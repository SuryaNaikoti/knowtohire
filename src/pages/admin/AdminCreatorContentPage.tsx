import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/design-system/tokens';
import {
  creatorService,
  CreatorContentQueueItem,
} from '@/services/creatorService';
import {
  Search,
  CheckCircle2,
  FileText,
  BookOpen,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export interface AdminCreatorContentPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminCreatorContentPage: React.FC<AdminCreatorContentPageProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<CreatorContentQueueItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const res = await creatorService.getAdminContentQueue();
    if (res.data) {
      setItems(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();

    const handleDataChanged = () => {
      loadData();
    };

    window.addEventListener('kth_creator_data_changed', handleDataChanged);
    return () => {
      window.removeEventListener('kth_creator_data_changed', handleDataChanged);
    };
  }, [loadData]);

  // Tab definitions
  const tabs = [
    { id: 'all', label: 'All Submissions', count: items.length },
    { id: 'pending_review', label: 'Pending Review', count: items.filter((i) => i.status === 'pending_review').length },
    { id: 'terms_pending', label: 'Terms Pending', count: items.filter((i) => i.status === 'terms_pending').length },
    { id: 'ready_to_publish', label: 'Ready to Publish', count: items.filter((i) => i.status === 'ready_to_publish').length },
    { id: 'published', label: 'Published', count: items.filter((i) => i.status === 'published').length },
    { id: 'changes_requested', label: 'Changes Requested', count: items.filter((i) => i.status === 'changes_requested').length },
    { id: 'rejected', label: 'Rejected', count: items.filter((i) => i.status === 'rejected').length },
  ];

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === 'all' || item.status === activeTab;
    const matchesSearch =
      searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Badge variant="amber" className="bg-amber-50 text-amber-800 border border-amber-200">Pending Review</Badge>;
      case 'terms_pending':
        return <Badge variant="cyan" className="bg-sky-50 text-sky-800 border border-sky-200">Terms Pending Creator</Badge>;
      case 'ready_to_publish':
        return <Badge variant="emerald" className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">Ready to Publish</Badge>;
      case 'published':
        return <Badge variant="slate" className="bg-kth-slate-100 text-kth-slate-800 border border-kth-slate-300">Published</Badge>;
      case 'changes_requested':
        return <Badge variant="amber" className="bg-orange-50 text-orange-800 border border-orange-200">Changes Requested</Badge>;
      case 'rejected':
        return <Badge variant="rose" className="bg-rose-50 text-rose-800 border border-rose-200">Rejected</Badge>;
      case 'draft':
        return <Badge variant="slate" className="bg-kth-slate-50 text-kth-slate-600 border border-kth-slate-200">Draft</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <AdminShell title="Creator Content Queue" currentPath="/admin/creator-content" onNavigate={onNavigate}>
      <div className="space-y-6 font-sans">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-kth-slate-200 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-extrabold text-kth-slate-900 tracking-tight">
              Creator Content Approval & Commercial Review
            </h1>
            <p className="text-xs sm:text-sm text-kth-slate-600 mt-1">
              Review submissions, assign selling price and royalties, track creator acceptance, and authorize publication.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadData}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Refresh Queue
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-kth-slate-200 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-kth-slate-900 text-white shadow-xs'
                  : 'text-kth-slate-600 hover:text-kth-slate-900 hover:bg-kth-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-kth-slate-700 text-amber-400 font-mono' : 'bg-kth-slate-200 text-kth-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-kth-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search content, creator, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-kth-slate-300 focus:outline-none focus:border-kth-primary-600 bg-white"
            />
          </div>

          <span className="text-xs text-kth-slate-500 font-medium self-end sm:self-center">
            Showing <strong>{filteredItems.length}</strong> items
          </span>
        </div>

        {/* Content Table / Card List */}
        <Card className="p-0 overflow-hidden bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-kth-slate-500 font-medium">
              Loading content review queue...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-kth-slate-800">No content submissions found</p>
              <p className="text-xs text-kth-slate-500 max-w-sm mx-auto">
                {activeTab === 'all'
                  ? 'There are currently no creator assets in this status.'
                  : `There are no submissions currently in the "${tabs.find((t) => t.id === activeTab)?.label}" queue.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Content</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Creator</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4">Commercial Terms</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kth-slate-100">
                  {filteredItems.map((item) => (
                    <tr key={`${item.type}-${item.id}`} className="hover:bg-kth-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-kth-slate-900 hover:text-kth-primary-600 transition-colors line-clamp-1 max-w-xs">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-kth-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{item.category}</span>
                          {item.format && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[10px] uppercase font-bold text-kth-slate-600">{item.format}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {item.type === 'resource' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            <BookOpen className="w-3 h-3" /> Resource
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            <FileText className="w-3 h-3" /> Template
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-kth-slate-800">{item.creatorName}</div>
                        <div className="text-[11px] text-kth-slate-500">{item.creatorEmail}</div>
                      </td>

                      <td className="py-3.5 px-4 text-kth-slate-600 font-mono text-[11px]">
                        {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        {item.sellingPriceINR !== undefined ? (
                          <div>
                            <div className="font-bold text-kth-slate-900 font-mono">
                              {formatINR(item.sellingPriceINR)}
                            </div>
                            <div className="text-[10px] text-kth-slate-500">
                              {item.creatorCommissionPct !== undefined ? (
                                <span>{item.creatorCommissionPct}% Royalty ({formatINR(item.creatorEarningsPerSaleINR || 0)})</span>
                              ) : (
                                <span className="text-amber-600 font-semibold">Terms Not Assigned</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-kth-slate-400 italic text-[11px]">Not priced</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(item.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleNavigate(`/admin/creator-content/${item.type}/${item.id}/review`)}
                          rightIcon={<ArrowRight className="w-3 h-3" />}
                          className="text-xs font-bold bg-white border border-kth-slate-300 hover:bg-kth-slate-900 hover:text-white transition-colors cursor-pointer"
                        >
                          Review & Terms
                        </Button>
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
