import { supabase, isSupabaseConfigured } from '../supabase';

export interface TemplateCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
}

export interface Template {
  id: string;
  category_id?: string;
  title: string;
  slug: string;
  description?: string;
  price_cents: number;
  preview_image_url?: string;
  download_url: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TemplatePurchase {
  id: string;
  candidate_id: string;
  template_id: string;
  order_id?: string;
  purchase_price_cents: number;
  created_at?: string;
}

const LOCAL_CATEGORIES_KEY = 'kth_template_categories';
const LOCAL_TEMPLATES_KEY = 'kth_templates';
const LOCAL_PURCHASES_KEY = (candidateId: string) => `kth_template_purchases_${candidateId}`;

const defaultCategories: TemplateCategory[] = [
  { id: 'cat-1', name: 'Resume Templates', slug: 'resumes', description: 'ATS-ready resume layouts' },
  { id: 'cat-2', name: 'Cover Letters', slug: 'covers', description: 'Professional cover letter designs' },
  { id: 'cat-3', name: 'Portfolios', slug: 'portfolios', description: 'Responsive web portfolios' }
];

const defaultTemplates: Template[] = [
  { id: 'temp-1', category_id: 'cat-1', title: 'Minimalist Tech Resume', slug: 'minimalist-tech', description: 'Clean modern resume layout tailored for engineering candidates.', price_cents: 1500, preview_image_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400', download_url: '/assets/templates/minimalist-tech.docx', is_active: true },
  { id: 'temp-2', category_id: 'cat-1', title: 'Executive Modern Resume', slug: 'executive-modern', description: 'A bold, premium layout for leadership positions.', price_cents: 2500, preview_image_url: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=400', download_url: '/assets/templates/executive-modern.docx', is_active: true },
  { id: 'temp-3', category_id: 'cat-2', title: 'Classic Cover Letter', slug: 'classic-cover', description: 'Formal letter template matching minimalist designs.', price_cents: 500, preview_image_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400', download_url: '/assets/templates/classic-cover.docx', is_active: true }
];

export const templateService = {
  getTemplateCategories: async (): Promise<TemplateCategory[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('template_categories').select('*');
      if (!error && data) return data as TemplateCategory[];
    }
    const local = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (!local) {
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(defaultCategories));
      return defaultCategories;
    }
    return JSON.parse(local);
  },

  getTemplates: async (categoryId?: string): Promise<Template[]> => {
    if (isSupabaseConfigured && supabase) {
      const query = supabase.from('templates').select('*').eq('is_active', true);
      if (categoryId) {
        query.eq('category_id', categoryId);
      }
      const { data, error } = await query;
      if (!error && data) return data as Template[];
    }
    const localStr = localStorage.getItem(LOCAL_TEMPLATES_KEY);
    const list: Template[] = localStr ? JSON.parse(localStr) : defaultTemplates;
    if (!localStr) {
      localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(defaultTemplates));
    }
    return categoryId ? list.filter(t => t.category_id === categoryId) : list;
  },

  getTemplate: async (idOrSlug: string): Promise<Template | null> => {
    if (isSupabaseConfigured && supabase) {
      const isUuid = idOrSlug.length === 36;
      const query = supabase.from('templates').select('*');
      if (isUuid) {
        query.eq('id', idOrSlug);
      } else {
        query.eq('slug', idOrSlug);
      }
      const { data, error } = await query.maybeSingle();
      if (!error && data) return data as Template;
    }
    const list = await templateService.getTemplates();
    return list.find(t => t.id === idOrSlug || t.slug === idOrSlug) || null;
  },

  searchTemplates: async (queryStr: string): Promise<Template[]> => {
    const list = await templateService.getTemplates();
    if (!queryStr.trim()) return list;
    return list.filter(t => t.title.toLowerCase().includes(queryStr.toLowerCase()) || (t.description && t.description.toLowerCase().includes(queryStr.toLowerCase())));
  },

  purchaseTemplate: async (candidateId: string, templateId: string, orderId?: string, priceCents?: number): Promise<boolean> => {
    const price = priceCents || 0;
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('template_purchases').insert({
        candidate_id: candidateId,
        template_id: templateId,
        order_id: orderId,
        purchase_price_cents: price
      });
      if (error) throw error;
      return true;
    }
    const key = LOCAL_PURCHASES_KEY(candidateId);
    const current: TemplatePurchase[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (!current.some(p => p.template_id === templateId)) {
      current.push({
        id: `pur_${Math.random().toString(36).substring(2, 9)}`,
        candidate_id: candidateId,
        template_id: templateId,
        order_id: orderId,
        purchase_price_cents: price,
        created_at: new Date().toISOString()
      });
      localStorage.setItem(key, JSON.stringify(current));
    }
    return true;
  },

  getPurchasedTemplates: async (candidateId: string): Promise<Template[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('template_purchases')
        .select('*, templates(*)')
        .eq('candidate_id', candidateId);
      if (!error && data) {
        return (data as any[]).map(d => d.templates).filter(Boolean) as Template[];
      }
    }
    const key = LOCAL_PURCHASES_KEY(candidateId);
    const purchases: TemplatePurchase[] = JSON.parse(localStorage.getItem(key) || '[]');
    const allTemplates = await templateService.getTemplates();
    return purchases.map(p => allTemplates.find(t => t.id === p.template_id)).filter(Boolean) as Template[];
  },

  downloadTemplate: async (candidateId: string, templateId: string): Promise<string> => {
    // Verify purchase
    const purchased = await templateService.getPurchasedTemplates(candidateId);
    const found = purchased.find(t => t.id === templateId);
    if (!found) {
      throw new Error('Access denied. Template has not been purchased.');
    }
    return found.download_url;
  }
};
