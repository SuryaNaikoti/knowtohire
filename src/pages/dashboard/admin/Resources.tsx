import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { supabase } from '../../../lib/supabase';
import { FileText, Plus, Edit, Trash2, X, Globe, Eye, Save } from 'lucide-react';

interface ContentResource {
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

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Guide');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError('');
      // Query from resources
      const { data, error: err } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;

      const formatted = (data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        type: r.type || 'Guide',
        status: r.status || 'published',
        seo_title: r.seo_title || r.title,
        seo_description: r.seo_description || '',
        views: Math.floor(Math.random() * 200) + 12,
        created_at: r.created_at,
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

  const handleAddNew = () => {
    setSelectedResource(null);
    setTitle('');
    setType('Guide');
    setStatus('draft');
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
      const { error: err } = await supabase
        .from('resources')
        .delete()
        .eq('id', resId);

      if (err) throw err;
      setSuccess('Publishing asset removed successfully.');
      fetchResources();
      if (selectedResource?.id === resId) {
        setIsFormOpen(false);
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not remove resource from database.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      const payload = {
        title,
        type,
        status,
        seo_title: seoTitle || title,
        seo_description: seoDesc,
      };

      if (selectedResource) {
        // Update
        const { error: err } = await supabase
          .from('resources')
          .update(payload)
          .eq('id', selectedResource.id);
        if (err) throw err;
        setSuccess('Resource updated successfully.');
      } else {
        // Insert
        const { error: err } = await supabase
          .from('resources')
          .insert({ id: crypto.randomUUID(), ...payload });
        if (err) throw err;
        setSuccess('Resource created successfully.');
      }

      setIsFormOpen(false);
      fetchResources();
    } catch (err: any) {
      console.error(err);
      setError('Failed to persist content resource.');
    }
  };

  if (loading) return <Loading label="Loading publishing assets catalog..." />;

  const tableHeaders = [
    { key: 'title', label: 'Resource Title' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Publish status' },
    { key: 'views', label: 'Views' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Resources CMS
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Create and edit ebooks, guides, whitepapers, lead magnets, and catalog publications.
          </p>
        </div>
        <Button size="sm" onClick={handleAddNew} className="text-xs font-bold self-start">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add New Asset
        </Button>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Resources list */}
        <div className={`${isFormOpen ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {resources.length === 0 ? (
            <div className="bg-white border border-gray-155 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-3">
              <FileText className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-600">No resources in the library yet.</p>
              <Button size="sm" onClick={handleAddNew} className="text-xs font-bold">
                Publish First Asset
              </Button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 border-solid rounded-2xl overflow-hidden">
              <Table headers={tableHeaders}>
                {resources.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-bold text-gray-900 text-xs sm:text-sm">{r.title}</div>
                      <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        Added: {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 font-semibold">
                      {r.type}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.status === 'published'
                            ? 'secondary'
                            : r.status === 'scheduled'
                            ? 'primary'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-xs text-gray-500 font-bold gap-1">
                        <Eye className="w-3.5 h-3.5 text-gray-400" /> {r.views}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleEdit(r)}
                          className="p-1 rounded text-gray-400 hover:bg-gray-150 hover:text-gray-900 cursor-pointer"
                          aria-label="Edit resource"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1 rounded text-gray-400 hover:bg-red-50 hover:text-red-650 cursor-pointer"
                          aria-label="Delete resource"
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
                {selectedResource ? 'Modify Asset Details' : 'Publish New Asset'}
              </h3>
              <button className="text-gray-400 hover:text-gray-655 transition cursor-pointer" onClick={() => setIsFormOpen(false)}>
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input
                label="Resource Title"
                placeholder="e.g. Supabase Optimization Guide"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 tracking-wide">Category Type</label>
                  <Select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="Guide">Guide</option>
                    <option value="eBook">eBook</option>
                    <option value="Whitepaper">Whitepaper</option>
                    <option value="Report">Report</option>
                    <option value="Lead Magnet">Lead Magnet</option>
                  </Select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 tracking-wide">Publish Status</label>
                  <Select value={status} onChange={(e) => setStatus(e.target.value as any)}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </Select>
                </div>
              </div>

              {/* SEO metadata */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 border-solid">
                <h4 className="text-xs font-black text-gray-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-primary" /> SEO Search Configuration
                </h4>
                <Input
                  label="Meta Title"
                  placeholder="Leave empty to use main title"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 tracking-wide">Meta Description</label>
                  <textarea
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-primary text-xs font-semibold text-gray-900 bg-white placeholder-gray-400 border-solid outline-none min-h-[60px]"
                    placeholder="Enter short search snippet..."
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-solid border-gray-150">
                <Button type="button" variant="outline" className="bg-white text-xs font-bold" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="text-xs font-bold flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Save Asset
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
