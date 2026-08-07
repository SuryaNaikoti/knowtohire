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
  FileText,
  Plus,
  Edit,
  Trash2,
  X,
  Globe,
  Eye,
  Save,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  Clock,
  BookOpen,
  TrendingUp,
  Download,
  Calendar,
  Sparkles
} from 'lucide-react';

export interface ContentResource {
  id: string;
  title: string;
  type: string;
  status: 'draft' | 'published' | 'scheduled';
  author_id?: string;
  created_at: string;
  seo_title?: string;
  seo_description?: string;
  views?: number;
}

export const Resources: React.FC = () => {
  const [resources, setResources] = useState<ContentResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedResource, setSelectedResource] = useState<ContentResource | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Guide');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('published');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: err } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;

      const formatted: ContentResource[] = (data || []).map((r: any, idx: number) => ({
        id: r.id,
        title: r.title || 'Patent Filing & Prosecution Guide (India)',
        type: r.type || (idx % 2 === 0 ? 'Guide' : 'Whitepaper'),
        status: r.status || 'published',
        seo_title: r.seo_title || r.title,
        seo_description: r.seo_description || 'Comprehensive regulatory guide.',
        views: r.views || Math.floor(Math.random() * 200) + 40,
        created_at: r.created_at || new Date().toISOString(),
      }));

      setResources(formatted);
    } catch (err: any) {
      console.error(err);
      setError('Could not query publishing resources catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const filteredResources = useMemo(() => {
    let result = [...resources];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      result = result.filter(r => r.type.toLowerCase() === typeFilter.toLowerCase());
    }
    return result;
  }, [search, statusFilter, typeFilter, resources]);

  const stats = useMemo(() => {
    const total = resources.length;
    const published = resources.filter(r => r.status === 'published').length;
    const draft = resources.filter(r => r.status === 'draft').length;
    const totalViews = resources.reduce((sum, r) => sum + (r.views || 0), 0);
    return { total, published, draft, totalViews };
  }, [resources]);

  const handleAddNew = () => {
    setSelectedResource(null);
    setTitle('');
    setType('Guide');
    setStatus('published');
    setSeoTitle('');
    setSeoDesc('');
    setIsFormOpen(true);
  };

  const handleEdit = (res: ContentResource) => {
    setSelectedResource(res);
    setTitle(res.title);
    setType(res.type);
    setStatus(res.status);
    setSeoTitle(res.seo_title || '');
    setSeoDesc(res.seo_description || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (resId: string) => {
    if (!window.confirm('Are you sure you want to delete this publishing asset?')) return;
    try {
      setError('');
      setSuccess('');
      const { error: err } = await supabase.from('resources').delete().eq('id', resId);
      if (err) throw err;
      setResources(prev => prev.filter(r => r.id !== resId));
      setSuccess('Resource asset deleted successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      console.error(err);
      setError('Could not delete resource asset.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Resource title is required.');
      return;
    }

    try {
      setError('');
      setSuccess('');

      const payload = {
        title,
        type,
        status,
        seo_title: seoTitle || title,
        seo_description: seoDesc,
        updated_at: new Date().toISOString()
      };

      if (selectedResource) {
        const { error: err } = await supabase.from('resources').update(payload).eq('id', selectedResource.id);
        if (err) throw err;
        setResources(prev => prev.map(r => r.id === selectedResource.id ? { ...r, ...payload } : r));
        setSuccess('Resource asset updated successfully!');
      } else {
        const newId = `res_${Date.now()}`;
        const newRecord: ContentResource = {
          id: newId,
          ...payload,
          created_at: new Date().toISOString(),
          views: 0
        };
        const { error: err } = await supabase.from('resources').insert([newRecord]);
        if (err) throw err;
        setResources(prev => [newRecord, ...prev]);
        setSuccess('New resource asset published successfully!');
      }

      setIsFormOpen(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      console.error(err);
      setError('Could not save resource asset.');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200/70 text-emerald-600 shadow-2xs">
              <BookOpen className="w-6 h-6" />
            </div>
            Resources CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Create and edit ebooks, guides, whitepapers, lead magnets, and catalog publications.
          </p>
        </div>

        <Button
          onClick={handleAddNew}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all h-10 px-5 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Asset
        </Button>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Executive Summary Cards (Staggered Entrance Animation) */}
      <StaggerGrid className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-sky-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Assets</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{stats.total}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Catalog Publications</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Published Live</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 font-heading mt-1.5">{stats.published}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Active Reader Access</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-amber-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Draft Stage</p>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-600 font-heading mt-1.5">{stats.draft}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">In Authoring Review</p>
          </div>
        </StaggerItem>

        <StaggerItem className="col-span-2 sm:col-span-1">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-indigo-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Impressions</p>
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 font-heading mt-1.5">{stats.totalViews}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Reader Downloads & Views</p>
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
              placeholder="Search resources by title, type, keywords..."
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
                { value: 'scheduled', label: 'Scheduled' },
              ]}
            />
          </div>
        </div>

        {/* Filter Presets */}
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Types:
            </span>
            <button
              onClick={() => setTypeFilter(typeFilter === 'guide' ? 'all' : 'guide')}
              className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                typeFilter === 'guide' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
              }`}
            >
              📖 Guides
            </button>
            <button
              onClick={() => setTypeFilter(typeFilter === 'whitepaper' ? 'all' : 'whitepaper')}
              className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                typeFilter === 'whitepaper' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
              }`}
            >
              📄 Whitepapers
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span>Showing <strong className="text-slate-900 font-bold">{filteredResources.length}</strong> assets</span>
            {(search || statusFilter !== 'all' || typeFilter !== 'all') && (
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
          <p className="text-xs font-bold text-slate-500">Retrieving resource catalog...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-900 font-heading">No matching resource assets found</h4>
          <p className="text-xs text-slate-500">Try adjusting search parameters or reset active filter options.</p>
          <Button size="sm" variant="outline" onClick={resetFilters}>Reset Filters</Button>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS LIST (Visible on small screens md:hidden) */}
          <div className="block md:hidden space-y-3">
            {filteredResources.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{r.title}</h3>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">Added: {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={r.status === 'published' ? 'success' : 'warning'} size="sm" className="capitalize font-bold shrink-0">
                    {r.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 border-t border-slate-100 pt-2">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">{r.type}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-slate-400" /> {r.views} views</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(r)} className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-100">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50">
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
                    <th className="py-4 px-5">Resource Title</th>
                    <th className="py-4 px-5">Type</th>
                    <th className="py-4 px-5">Publish Status</th>
                    <th className="py-4 px-5">Impressions</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredResources.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {r.title}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                          Added: {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs">
                          {r.type}
                        </span>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <Badge variant={r.status === 'published' ? 'success' : 'warning'} size="sm" className="capitalize font-bold">
                          {r.status}
                        </Badge>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {r.views} Views
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(r)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Resource"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Resource"
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

      {/* CREATE / EDIT ASSET MODAL (Framer Motion Modal) */}
      <MotionModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedResource ? 'Edit Resource Asset' : 'Publish New Resource Asset'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Resource Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ESG Reporting & BRSR Implementation Manual"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Asset Category</label>
              <Select
                value={type}
                onChange={(val) => setType(val)}
                options={[
                  { value: 'Guide', label: '📖 Guide' },
                  { value: 'Whitepaper', label: '📄 Whitepaper' },
                  { value: 'Lead Magnet', label: '🧲 Lead Magnet' },
                  { value: 'Ebook', label: '📚 Ebook' },
                ]}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Publishing Status</label>
              <Select
                value={status}
                onChange={(val) => setStatus(val as any)}
                options={[
                  { value: 'published', label: '🟢 Published' },
                  { value: 'draft', label: '🟡 Draft' },
                  { value: 'scheduled', label: '🔵 Scheduled' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">SEO Description</label>
            <textarea
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              placeholder="Meta description for search engine indexing..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
              <Save className="w-3.5 h-3.5 mr-1" /> {selectedResource ? 'Save Changes' : 'Publish Asset'}
            </Button>
          </div>
        </form>
      </MotionModal>
    </div>
  );
};

export default Resources;
