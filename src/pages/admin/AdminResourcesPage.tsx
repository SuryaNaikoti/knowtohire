import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { knowledgeService, KnowledgeResource, ResourceStatus } from '@/services/knowledgeService';
import { formatINR } from '@/design-system/tokens';
import { creatorService } from '@/services/creatorService';
import { Plus, Trash2, Loader2, Edit, FileText, Search, BookOpen, CheckCircle2, ShoppingBag, IndianRupee } from 'lucide-react';

export interface AdminResourcesPageProps {
  onNavigate?: (route: string) => void;
}

export const AdminResourcesPage: React.FC<AdminResourcesPageProps> = ({ onNavigate }) => {
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleNavigateEdit = (r: KnowledgeResource) => {
    if (onNavigate) {
      onNavigate(`/admin/resources/${r.id}/edit`);
    } else {
      window.location.href = `/admin/resources/${r.id}/edit`;
    }
  };

  const handleToggleStatus = async (r: KnowledgeResource) => {
    setActionLoadingId(r.id);
    const newStatus: ResourceStatus = r.status === 'published' ? 'draft' : 'published';
    await knowledgeService.updateResource(r.id, { status: newStatus });
    setActionLoadingId(null);
    fetchResources();
  };

  const handleDeleteResource = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete resource "${title}"?`)) {
      setActionLoadingId(id);
      await knowledgeService.deleteResource(id);
      setActionLoadingId(null);
      fetchResources();
    }
  };

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    const [res, salesRes] = await Promise.all([
      knowledgeService.getResources({
        status: statusFilter === 'all' ? 'all' : (statusFilter as ResourceStatus),
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        search: searchTerm.trim() || undefined,
      }),
      creatorService.getSales(),
    ]);
    if (res.data) {
      setResources(res.data);
    }
    if (salesRes.data) {
      setSalesData(salesRes.data.filter((s) => s.itemType === 'resource'));
    }
    setIsLoading(false);
  }, [searchTerm, categoryFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchResources, 150);
    return () => clearTimeout(timer);
  }, [fetchResources]);

  useEffect(() => {
    const handleStorageChange = () => {
      fetchResources();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('kth_resources_changed', handleStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kth_resources_changed', handleStorageChange);
      }
    };
  }, [fetchResources]);



  const totalCount = resources.length;
  const publishedCount = resources.filter((r) => r.status === 'published').length;
  const totalItemsSold = salesData.length;
  const totalRevenue = salesData.reduce((acc, s) => acc + s.amountINR, 0);

  return (
    <AdminShell title="Knowledge Hub CMS" currentPath="/admin/resources" onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* KPI Metrics Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Total Publications</p>
                <h3 className="text-2xl font-extrabold text-kth-slate-900 mt-0.5">{totalCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Published & Live</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">{publishedCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Total Items Sold</p>
                <h3 className="text-2xl font-extrabold text-indigo-600 mt-0.5">{totalItemsSold} Units</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Total Revenue Generated</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">{formatINR(totalRevenue)}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-kth-slate-200 shadow-xs">
          <div>
            <h2 className="font-display text-base font-bold text-kth-slate-900">E-Books, Handbooks & Research Documents</h2>
            <p className="text-xs text-kth-slate-500 mt-0.5">
              Upload, manage, and publish educational assets to the KnowToHire Knowledge Hub.
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              if (onNavigate) onNavigate('/admin/resources/new');
              else window.location.href = '/admin/resources/new';
            }}
          >
            Add New Resource
          </Button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search resources by title, description, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-kth-slate-400" />}
            />
          </div>
          <div className="w-full md:w-56">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'Environmental & ESG', label: 'Environmental & ESG' },
                { value: 'Technology', label: 'Technology' },
                { value: 'Sustainability', label: 'Sustainability' },
                { value: 'Patent & IPR', label: 'Patent & IPR' },
                { value: 'Public Policy', label: 'Public Policy' },
              ]}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>
        </div>

        {/* Resources Table */}
        <Card className="p-0 overflow-hidden rounded-2xl border-kth-slate-200 shadow-xs">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500">Loading resources...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="p-12 text-center text-kth-slate-500 text-xs">No resources uploaded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Resource Title</th>
                    <th className="p-4">Category & Tags</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Format & Size</th>
                    <th className="p-4">Downloads</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kth-slate-100">
                  {resources.map((r) => (
                    <tr key={r.id} className="hover:bg-kth-slate-50/70 transition-colors">
                      <td className="p-4 max-w-xs sm:max-w-sm">
                        <div className="font-bold text-kth-slate-900 text-sm">{r.title}</div>
                        <div className="text-kth-slate-500 text-xs line-clamp-1 mt-0.5">{r.description}</div>
                        {r.file_url && (
                          <div className="flex items-center gap-1 text-[11px] text-kth-primary-600 font-mono mt-1">
                            <FileText className="w-3 h-3 shrink-0" />
                            <span className="truncate">{r.file_name || 'Attached File'}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant="cyan">{r.category}</Badge>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {(r.tags || []).slice(0, 2).map((t, idx) => (
                              <span key={idx} className="text-[10px] text-kth-slate-500 bg-kth-slate-100 px-1.5 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <Badge
                          variant={r.status === 'published' ? 'emerald' : r.status === 'draft' ? 'amber' : 'slate'}
                          className="capitalize font-mono text-[11px]"
                        >
                          {r.status}
                        </Badge>
                      </td>

                      <td className="p-4 font-mono">
                        <span className="font-bold text-kth-slate-900">{r.format}</span>
                        <span className="text-kth-slate-400 block text-[11px]">{r.file_size || '2.4 MB'}</span>
                      </td>

                      <td className="p-4 font-mono text-kth-slate-600 text-xs">
                        {(r.downloads_count || 0).toLocaleString()}
                      </td>

                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-semibold text-amber-700 border-amber-300 hover:bg-amber-50"
                            onClick={() => onNavigate ? onNavigate(`/admin/resources/${r.id}/metrics`) : (window.location.href = `/admin/resources/${r.id}/metrics`)}
                          >
                            Metrics
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs font-semibold"
                            leftIcon={<Edit className="w-3.5 h-3.5" />}
                            onClick={() => handleNavigateEdit(r)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant={r.status === 'published' ? 'outline' : 'primary'}
                            size="sm"
                            className="text-xs font-semibold"
                            isLoading={actionLoadingId === r.id}
                            onClick={() => handleToggleStatus(r)}
                          >
                            {r.status === 'published' ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-xs font-semibold p-2"
                            isLoading={actionLoadingId === r.id}
                            onClick={() => handleDeleteResource(r.id, r.title)}
                            title="Delete Resource"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminShell>
  );
};
