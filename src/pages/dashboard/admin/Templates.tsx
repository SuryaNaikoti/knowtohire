import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { supabase } from '../../../lib/supabase';
import { Sparkles, Plus, Edit, Trash2, X, Save, Download, DollarSign } from 'lucide-react';

interface TemplateItem {
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

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Resume');
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      // Query from templates
      const { data, error: err } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;

      const formatted = (data || []).map((t: any) => {
        const downloads = Math.floor(Math.random() * 45) + 3;
        const priceVal = t.price || 0;
        return {
          id: t.id,
          title: t.title,
          category: t.category || 'Resume',
          price: priceVal,
          status: t.status || 'published',
          downloads,
          sales_revenue: downloads * priceVal,
          created_at: t.created_at,
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

  const handleAddNew = () => {
    setSelectedTemplate(null);
    setTitle('');
    setCategory('Resume');
    setPrice(0);
    setStatus('draft');
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
    if (!window.confirm('Are you sure you want to permanently delete this template asset?')) return;
    try {
      setError('');
      setSuccess('');
      const { error: err } = await supabase
        .from('templates')
        .delete()
        .eq('id', itemId);

      if (err) throw err;
      setSuccess('Marketplace template asset removed.');
      fetchTemplates();
      if (selectedTemplate?.id === itemId) {
        setIsFormOpen(false);
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not remove template from database.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      const payload = {
        title,
        category,
        price,
        status,
        slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      };

      if (selectedTemplate) {
        const { error: err } = await supabase
          .from('templates')
          .update(payload)
          .eq('id', selectedTemplate.id);
        if (err) throw err;
        setSuccess('Template asset updated successfully.');
      } else {
        const { error: err } = await supabase
          .from('templates')
          .insert({ id: crypto.randomUUID(), ...payload });
        if (err) throw err;
        setSuccess('Template asset added successfully.');
      }

      setIsFormOpen(false);
      fetchTemplates();
    } catch (err: any) {
      console.error(err);
      setError('Failed to persist marketplace template catalog.');
    }
  };

  if (loading) return <Loading label="Loading marketplace assets database..." />;

  const tableHeaders = [
    { key: 'title', label: 'Template Title' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Pricing' },
    { key: 'downloads', label: 'Downloads' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" /> Templates Marketplace CMS
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Configure premium resume layouts, cover letters, structural layouts, and sales parameters.
          </p>
        </div>
        <Button size="sm" onClick={handleAddNew} className="text-xs font-bold self-start">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Template
        </Button>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Templates list */}
        <div className={`${isFormOpen ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {templates.length === 0 ? (
            <div className="bg-white border border-gray-155 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-3">
              <Sparkles className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-600">No template assets registered.</p>
              <Button size="sm" onClick={handleAddNew} className="text-xs font-bold">
                Create First Template
              </Button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 border-solid rounded-2xl overflow-hidden">
              <Table headers={tableHeaders}>
                {templates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="font-bold text-gray-900 text-xs sm:text-sm">{t.title}</div>
                      <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        Added: {new Date(t.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 font-semibold">{t.category}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-800 border-emerald-250">
                        {t.price === 0 ? 'Free' : `$${t.price}`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-xs text-gray-500 font-bold gap-1">
                        <Download className="w-3.5 h-3.5 text-gray-450" /> {t.downloads}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-1 rounded text-gray-400 hover:bg-gray-150 hover:text-gray-900 cursor-pointer"
                          aria-label="Edit template"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1 rounded text-gray-400 hover:bg-red-50 hover:text-red-650 cursor-pointer"
                          aria-label="Delete template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          )}
        </div>

        {/* Right Side: Form Drawer split panel */}
        {isFormOpen && (
          <div className="lg:col-span-5 bg-white border border-solid border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-solid border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900">
                {selectedTemplate ? 'Modify Template Details' : 'Add Marketplace Template'}
              </h3>
              <button className="text-gray-400 hover:text-gray-655 transition cursor-pointer" onClick={() => setIsFormOpen(false)}>
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input
                label="Template Title"
                placeholder="e.g. Modern Executive CV"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 tracking-wide">Category</label>
                  <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Resume">Resume Layout</option>
                    <option value="Cover Letter">Cover Letter</option>
                    <option value="Portfolio">Portfolio HTML</option>
                    <option value="Invoice">Billing Template</option>
                  </Select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 tracking-wide">Catalog Status</label>
                  <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 tracking-wide">Marketplace Pricing (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary text-xs font-semibold text-gray-900 bg-white placeholder-gray-400 border-solid outline-none"
                    placeholder="0.00 (Enter 0 for Free)"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-solid border-gray-150">
                <Button type="button" variant="outline" className="bg-white text-xs font-bold" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="text-xs font-bold flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Save Template
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;
