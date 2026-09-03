import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { templateService, MarketplaceTemplate, TemplateStatus } from '@/services/templateService';
import {
  Plus,
  Trash2,
  Loader2,
  FileText,
  Search,
  CheckCircle2,
  Layers,
  ShoppingBag,
  IndianRupee,
  AlertCircle,
  Edit,
  Play,
  Pause,
  ExternalLink,
} from 'lucide-react';
import { formatINR } from '@/design-system/tokens';
import { creatorService } from '@/services/creatorService';

export interface AdminTemplatesPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminTemplatesPage: React.FC<AdminTemplatesPageProps> = ({ onNavigate }) => {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleNavigateEdit = (t: MarketplaceTemplate) => {
    if (onNavigate) {
      onNavigate(`/admin/templates/${t.id}/edit`);
    } else {
      window.location.href = `/admin/templates/${t.id}/edit`;
    }
  };

  const handleQuickStatusChange = async (id: string, st: 'draft' | 'published') => {
    setActionLoadingId(id);
    await templateService.updateTemplate(id, { status: st });
    setActionLoadingId(null);
    fetchTemplates();
  };

  const handleDeleteTemplate = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to permanently delete template "${title}"?`)) {
      setActionLoadingId(id);
      await templateService.deleteTemplate(id);
      setActionLoadingId(null);
      fetchTemplates();
    }
  };

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    const [res, salesRes] = await Promise.all([
      templateService.getTemplates({ status: 'all' }),
      creatorService.getSales(),
    ]);
    if (res.data) {
      setTemplates(res.data);
    }
    if (salesRes.data) {
      setSalesData(salesRes.data.filter((s) => s.itemType === 'template'));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchTemplates();

    const handleStorageChange = () => {
      fetchTemplates();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('kth_templates_changed', handleStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kth_templates_changed', handleStorageChange);
      }
    };
  }, [fetchTemplates]);

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCategory = categoryFilter === 'all' || t.category.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // KPI Calculations
  const totalCount = templates.length;
  const publishedCount = templates.filter((t) => t.status === 'published').length;
  const totalItemsSold = salesData.length;
  const totalRevenue = salesData.reduce((acc, s) => acc + s.amountINR, 0);

  const getStatusBadge = (tStatus: TemplateStatus) => {
    switch (tStatus) {
      case 'published':
        return (
          <Badge variant="emerald" className="capitalize font-mono text-[10px]" hasPulse>
            Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="amber" className="capitalize font-mono text-[10px]">
            Draft
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="slate" className="capitalize font-mono text-[10px]">
            Archived
          </Badge>
        );
      default:
        return <Badge variant="slate">{tStatus}</Badge>;
    }
  };

  return (
    <AdminShell title="Template Marketplace CMS" currentPath="/admin/templates" onNavigate={onNavigate}>
      <div className="space-y-6 font-sans">
        {/* KPI Metrics Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Total Templates</p>
                <h3 className="text-2xl font-extrabold text-kth-slate-900 mt-0.5">{totalCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
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

        {/* Toolbar & Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search templates by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-kth-slate-400" />}
              />
            </div>
            <div className="w-full sm:w-56">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'Resume', label: 'Resume & CV Templates' },
                  { value: 'Legal', label: 'Legal & Contracts' },
                  { value: 'Compliance', label: 'Compliance Toolkits' },
                  { value: 'Professional', label: 'Professional Documents' },
                ]}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'published', label: 'Published (Live)' },
                  { value: 'draft', label: 'Drafts Only' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-kth-slate-100">
            <span className="text-xs font-mono text-kth-slate-500 font-bold shrink-0">
              {filteredTemplates.length} of {templates.length} Assets
            </span>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                if (onNavigate) onNavigate('/admin/templates/new');
                else window.location.href = '/admin/templates/new';
              }}
            >
              Add Template
            </Button>
          </div>
        </div>

        {/* Templates Table Card */}
        <Card className="p-0 overflow-hidden border-kth-slate-200 bg-white shadow-xs">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500 font-medium">Loading templates repository...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-16 text-center text-kth-slate-500 text-xs space-y-2">
              <AlertCircle className="w-8 h-8 text-kth-slate-400 mx-auto mb-1" />
              <p className="font-bold text-sm text-kth-slate-700">No Templates Found</p>
              <p>Try refining your search keyword or clearing the status/category filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Template Title & Asset</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Formats</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Downloads</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kth-slate-100">
                  {filteredTemplates.map((t) => (
                    <tr key={t.id} className="hover:bg-kth-slate-50/70 transition-colors">
                      <td className="p-4 max-w-xs sm:max-w-sm">
                        <div className="font-bold text-kth-slate-900 text-sm">{t.title}</div>
                        <div className="text-kth-slate-500 text-xs line-clamp-1 mt-0.5">{t.description}</div>
                        {t.file_url && (
                          <div className="flex items-center gap-1 text-[11px] text-kth-primary-600 font-mono mt-1">
                            <FileText className="w-3 h-3 shrink-0" />
                            <span className="truncate">{t.file_name || 'Uploaded Template Document'}</span>
                            {t.file_size && <span className="text-kth-slate-400">({t.file_size})</span>}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <Badge variant="indigo" className="text-[10px]">
                          {t.category}
                        </Badge>
                      </td>

                      <td className="p-4">{getStatusBadge(t.status)}</td>

                      <td className="p-4 font-mono font-semibold text-kth-slate-700">{t.formats.join(', ')}</td>

                      <td className="p-4 font-mono font-bold text-kth-primary-600">
                        {t.is_free ? 'FREE' : `₹${t.price_inr}`}
                      </td>

                      <td className="p-4 font-mono text-kth-slate-700">{t.downloads_count.toLocaleString()}</td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-semibold text-amber-700 border-amber-300 hover:bg-amber-50"
                            onClick={() => onNavigate ? onNavigate(`/admin/templates/${t.id}/metrics`) : (window.location.href = `/admin/templates/${t.id}/metrics`)}
                          >
                            Metrics
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs font-semibold"
                            leftIcon={<Edit className="w-3.5 h-3.5" />}
                            onClick={() => handleNavigateEdit(t)}
                          >
                            Edit
                          </Button>
                          {t.status !== 'published' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              title="Publish Template to Live Marketplace"
                              leftIcon={<Play className="w-3.5 h-3.5 text-emerald-600" />}
                              isLoading={actionLoadingId === t.id}
                              onClick={() => handleQuickStatusChange(t.id, 'published')}
                            >
                              Publish
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              title="Revert to Draft"
                              leftIcon={<Pause className="w-3.5 h-3.5 text-amber-600" />}
                              isLoading={actionLoadingId === t.id}
                              onClick={() => handleQuickStatusChange(t.id, 'draft')}
                            >
                              Draft
                            </Button>
                          )}
                          <a
                            href={`/templates/${t.slug || t.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-kth-slate-400 hover:text-kth-slate-700 rounded-lg hover:bg-kth-slate-100 transition-colors"
                            title="Preview Template Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-xs font-semibold p-2"
                            isLoading={actionLoadingId === t.id}
                            onClick={() => handleDeleteTemplate(t.id, t.title)}
                            title="Delete Template"
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
