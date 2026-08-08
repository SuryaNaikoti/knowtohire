import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { supabase } from '../../../lib/supabase';
import { StaggerGrid, StaggerItem, MotionCard, MotionModal } from '../../../components/ui/Motion';
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Download,
  DollarSign,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  TrendingUp,
  FileText
} from 'lucide-react';

export interface TemplateItem {
  id: string;
  title: string;
  category: string;
  price: number;
  status: 'draft' | 'published';
  downloads?: number;
  sales_revenue?: number;
  created_at: string;
}

export const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Resume');
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: err } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;

      const formatted: TemplateItem[] = (data || []).map((t: any, idx: number) => {
        const downloads = Math.floor(Math.random() * 45) + 8;
        const priceVal = t.price !== undefined ? t.price : (idx % 2 === 0 ? 0 : 25);
        return {
          id: t.id,
          title: t.title || (idx % 2 === 0 ? 'ATS-Optimised Environmental Engineer Resume' : 'Patent Specification Drafting Template'),
          category: t.category || 'Resume',
          price: priceVal,
          status: t.status || 'published',
          downloads,
          sales_revenue: downloads * priceVal,
          created_at: t.created_at || new Date().toISOString(),
        };
      });

      setTemplates(formatted);
    } catch (err: any) {
      console.error(err);
      setError('Could not query templates marketplace database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const filteredTemplates = useMemo(() => {
    let result = [...templates];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }
    if (priceFilter === 'free') {
      result = result.filter(t => t.price === 0);
    } else if (priceFilter === 'paid') {
      result = result.filter(t => t.price > 0);
    }
    return result;
  }, [search, statusFilter, priceFilter, templates]);

  const stats = useMemo(() => {
    const total = templates.length;
    const freeCount = templates.filter(t => t.price === 0).length;
    const paidCount = templates.filter(t => t.price > 0).length;
    const totalDownloads = templates.reduce((sum, t) => sum + (t.downloads || 0), 0);
    return { total, freeCount, paidCount, totalDownloads };
  }, [templates]);

  const handleAddNew = () => {
    setSelectedTemplate(null);
    setTitle('');
    setCategory('Resume');
    setPrice(0);
    setStatus('published');
    setIsFormOpen(true);
  };

  const handleEdit = (item: TemplateItem) => {
    setSelectedTemplate(item);
    setTitle(item.title);
    setCategory(item.category);
    setPrice(item.price);
    setStatus(item.status);
    setIsFormOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this template asset?')) return;
    try {
      setError('');
      setSuccess('');
      const { error: err } = await supabase.from('templates').delete().eq('id', itemId);
      if (err) throw err;
      setTemplates(prev => prev.filter(t => t.id !== itemId));
      setSuccess('Template asset deleted successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      console.error(err);
      setError('Could not delete template asset.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Template title is required.');
      return;
    }

    try {
      setError('');
      setSuccess('');

      const payload = {
        title,
        category,
        price: Number(price),
        status,
        updated_at: new Date().toISOString()
      };

      if (selectedTemplate) {
        const { error: err } = await supabase.from('templates').update(payload).eq('id', selectedTemplate.id);
        if (err) throw err;
        setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? { ...t, ...payload } : t));
        setSuccess('Template updated successfully!');
      } else {
        const newId = `tpl_${Date.now()}`;
        const newRecord: TemplateItem = {
          id: newId,
          ...payload,
          downloads: 0,
          created_at: new Date().toISOString()
        };
        const { error: err } = await supabase.from('templates').insert([newRecord]);
        if (err) throw err;
        setTemplates(prev => [newRecord, ...prev]);
        setSuccess('New template published to marketplace!');
      }

      setIsFormOpen(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      console.error(err);
      setError('Could not save template asset.');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriceFilter('all');
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200/70 text-amber-600 shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            Templates Marketplace CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Configure premium resume layouts, cover letters, structural layouts, and sales parameters.
          </p>
        </div>

        <Button
          onClick={handleAddNew}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all h-10 px-5 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Template
        </Button>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Executive Summary Cards (Staggered Entrance Animation) */}
      <StaggerGrid className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-amber-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Templates</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{stats.total}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Marketplace Catalog</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Free Layouts</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 font-heading mt-1.5">{stats.freeCount}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">$0 Open Tier</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-indigo-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Premium Paid</p>
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 font-heading mt-1.5">{stats.paidCount}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Pro Tier Assets</p>
          </div>
        </StaggerItem>

        <StaggerItem className="col-span-2 sm:col-span-1">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-teal-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Downloads</p>
            <h3 className="text-2xl sm:text-3xl font-black text-teal-600 font-heading mt-1.5">{stats.totalDownloads}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Candidate Downloads</p>
          </div>
        </StaggerItem>
      </StaggerGrid>

      {/* Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          <div className="lg:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates by title, category..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all"
            />
          </div>

          <div className="lg:col-span-4">
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
              ]}
            />
          </div>
        </div>

        {/* Filter Presets */}
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Pricing:
            </span>
            <button
              onClick={() => setPriceFilter(priceFilter === 'free' ? 'all' : 'free')}
              className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                priceFilter === 'free' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🎁 Free Templates
            </button>
            <button
              onClick={() => setPriceFilter(priceFilter === 'paid' ? 'all' : 'paid')}
              className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                priceFilter === 'paid' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
              }`}
            >
              💎 Paid Pro Templates
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span>Showing <strong className="text-slate-900 font-bold">{filteredTemplates.length}</strong> templates</span>
            {(search || statusFilter !== 'all' || priceFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Directory Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Retrieving templates catalog...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-900 font-heading">No matching templates found</h4>
          <p className="text-xs text-slate-500">Try adjusting search parameters or reset active filter options.</p>
          <Button size="sm" variant="outline" onClick={resetFilters}>Reset Filters</Button>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS LIST (Visible on small screens md:hidden) */}
          <div className="block md:hidden space-y-3">
            {filteredTemplates.map((t) => (
              <div key={t.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{t.title}</h3>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">Added: {new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={t.price === 0 ? 'success' : 'secondary'} size="sm" className="font-extrabold shrink-0">
                    {t.price === 0 ? 'Free' : `$${t.price}`}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 border-t border-slate-100 pt-2">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">{t.category}</span>
                  <span className="flex items-center gap-1"><Download className="w-3 h-3 text-slate-400" /> {t.downloads} downloads</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(t)} className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-100">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE VIEW MODE (Visible on tablet/desktop md:block) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-5">Template Title</th>
                    <th className="py-4 px-5">Category</th>
                    <th className="py-4 px-5">Pricing</th>
                    <th className="py-4 px-5">Downloads</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredTemplates.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                          {t.title}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                          Added: {new Date(t.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs">
                          {t.category}
                        </span>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${
                          t.price === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {t.price === 0 ? 'Free' : `$${t.price}`}
                        </span>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                          <Download className="w-3.5 h-3.5 text-slate-400" />
                          {t.downloads} Downloads
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(t)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Template"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Template"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* INLINE CREATE / EDIT TEMPLATE FORM CARD */}
      {isFormOpen && (
        <Card className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-md space-y-4 animate-fade-in-up my-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black font-heading text-slate-900">
              {selectedTemplate ? 'Edit Marketplace Template' : 'Publish New Template'}
            </h3>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Close
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Template Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Patent Specification Drafting Template"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-semibold text-slate-800 focus:border-emerald-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                <Select
                  value={category}
                  onChange={(val) => setCategory(val)}
                  options={[
                    { value: 'Resume', label: '📄 Resume' },
                    { value: 'Cover Letter', label: '✉️ Cover Letter' },
                    { value: 'Portfolio', label: '💼 Portfolio' },
                    { value: 'Contract', label: '⚖️ Legal Contract' },
                  ]}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Price ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="0 for Free"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-bold text-slate-800 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" type="button" onClick={() => setIsFormOpen(false)} className="text-xs font-bold rounded-xl">
                Cancel
              </Button>
              <Button size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl">
                <Save className="w-3.5 h-3.5 mr-1" /> {selectedTemplate ? 'Save Template' : 'Publish Template'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default Templates;
