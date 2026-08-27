import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { requestService, ContentRequest, RequestStatus } from '@/services';
import {
  Loader2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  FileQuestion,
  Clock,
  ThumbsUp,
  AlertCircle,
  FolderCheck,
} from 'lucide-react';

export interface AdminRequestsPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminRequestsPage: React.FC<AdminRequestsPageProps> = ({ onNavigate }) => {
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    const res = await requestService.getAllRequests();
    if (res.data) {
      setRequests(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();

    const handleChanges = () => {
      fetchRequests();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('kth_requests_changed', handleChanges);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kth_requests_changed', handleChanges);
      }
    };
  }, [fetchRequests]);

  const handleOpenFulfillPage = (req: ContentRequest) => {
    const targetUrl = `/admin/requests/${req.id}`;
    if (onNavigate) {
      onNavigate(targetUrl);
    } else {
      window.history.pushState({}, '', targetUrl);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.user_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.category || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || r.category.toLowerCase().includes(categoryFilter.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? r.status === 'under_review' || r.status === 'in_progress' || r.status === 'pending' || r.status === 'ready_for_delivery'
        : r.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // KPI Calculations
  const totalCount = requests.length;
  const activeCount = requests.filter(
    (r) => r.status === 'under_review' || r.status === 'in_progress' || r.status === 'pending' || r.status === 'ready_for_delivery'
  ).length;
  const fulfilledCount = requests.filter((r) => r.status === 'completed').length;
  const totalUpvotes = requests.reduce((sum, r) => sum + (r.upvote_count || 0), 0);

  const getStatusBadge = (s: RequestStatus) => {
    switch (s) {
      case 'pending':
        return (
          <Badge variant="amber" className="capitalize font-mono text-[10px]">
            Pending Review
          </Badge>
        );
      case 'under_review':
        return (
          <Badge variant="cyan" className="capitalize font-mono text-[10px]">
            Under Review
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="cyan" className="capitalize font-mono text-[10px]" hasPulse>
            In Progress
          </Badge>
        );
      case 'ready_for_delivery':
        return (
          <Badge variant="indigo" className="capitalize font-mono text-[10px]">
            Ready for Delivery
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="emerald" className="font-mono text-[10px]">
            Fulfilled
          </Badge>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <Badge variant="rose" className="capitalize font-mono text-[10px]">
            {s}
          </Badge>
        );
      default:
        return <Badge variant="slate">{s}</Badge>;
    }
  };

  return (
    <AdminShell title="On-Demand Content Requests Queue" currentPath="/admin/requests" onNavigate={onNavigate}>
      <div className="space-y-6 font-sans">
        {/* KPI Metrics Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Total Submissions</p>
                <h3 className="text-2xl font-extrabold text-kth-slate-900 mt-0.5">{totalCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-kth-primary-50 text-kth-primary-600 flex items-center justify-center">
                <FileQuestion className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Under Review & Active</p>
                <h3 className="text-2xl font-extrabold text-cyan-600 mt-0.5">{activeCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Fulfilled Deliverables</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-0.5">{fulfilledCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FolderCheck className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 bg-white border-kth-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">Community Upvotes</p>
                <h3 className="text-2xl font-extrabold text-amber-600 mt-0.5">{totalUpvotes}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Toolbar & Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search requests by title, description, or requester..."
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
                  { value: 'Sustainability', label: 'Sustainability & ESG' },
                  { value: 'Environmental', label: 'Environmental & EHS' },
                  { value: 'Patent', label: 'Intellectual Property' },
                  { value: 'Legal', label: 'Legal & Contracts' },
                  { value: 'Technology', label: 'Technology' },
                ]}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active (Review / Progress)' },
                  { value: 'pending', label: 'Pending Review' },
                  { value: 'under_review', label: 'Under Review' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Fulfilled (Completed)' },
                  { value: 'rejected', label: 'Declined / Rejected' },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-kth-slate-100">
            <span className="text-xs font-mono text-kth-slate-500 font-bold shrink-0">
              {filteredRequests.length} of {requests.length} Requests
            </span>
          </div>
        </div>

        {/* Requests Table Card */}
        <Card className="p-0 overflow-hidden border-kth-slate-200 bg-white shadow-xs">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500 font-medium">Loading content requests queue...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-16 text-center text-kth-slate-500 text-xs space-y-2">
              <AlertCircle className="w-8 h-8 text-kth-slate-400 mx-auto mb-1" />
              <p className="font-bold text-sm text-kth-slate-700">No Content Requests Found</p>
              <p>Try refining your search keyword or clearing the status/category filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Request & Requester Scope</th>
                    <th className="p-4">Type & Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Deliverable State</th>
                    <th className="p-4">Submission Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kth-slate-100">
                  {filteredRequests.map((req) => {
                    const hasDeliverable = Boolean(req.deliverable_url || req.completed_resource_id);

                    return (
                      <tr
                        key={req.id}
                        onClick={() => handleOpenFulfillPage(req)}
                        className="hover:bg-kth-slate-50/70 transition-colors cursor-pointer"
                      >
                        <td className="p-4 max-w-xs sm:max-w-sm">
                          <div className="font-bold text-kth-slate-900 text-sm hover:text-kth-primary-600 transition-colors">
                            {req.title}
                          </div>
                          <div className="text-kth-slate-500 text-xs line-clamp-2 mt-0.5">{req.description}</div>
                          {req.user_name && (
                            <div className="text-[11px] text-kth-slate-600 font-medium mt-1">
                              Requester: <span className="font-bold text-kth-slate-800">{req.user_name}</span>{' '}
                              {req.user_email && <span className="text-kth-slate-400 font-mono text-[10px]">({req.user_email})</span>}
                            </div>
                          )}
                          {req.additional_requirements && (
                            <div className="text-[10px] text-kth-slate-400 mt-1 italic line-clamp-1">
                              Req: {req.additional_requirements}
                            </div>
                          )}
                          {req.admin_notes && (
                            <div className="text-[10px] text-kth-primary-700 mt-1.5 font-medium bg-kth-primary-50 px-2 py-0.5 rounded border border-kth-primary-200 inline-block">
                              Note: {req.admin_notes}
                            </div>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="flex flex-col gap-1 items-start">
                            <Badge variant="indigo" className="text-[10px]">
                              {req.type || 'Study Material'}
                            </Badge>
                            <span className="text-[11px] text-kth-slate-600 font-medium">{req.category}</span>
                            {req.preferred_format && (
                              <span className="text-[10px] font-mono text-kth-slate-400">
                                Format: {req.preferred_format}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4">{getStatusBadge(req.status)}</td>

                        <td className="p-4">
                          {hasDeliverable ? (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 w-fit">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>
                                {req.deliverable_format ? `${req.deliverable_format} Attached` : 'Deliverable Linked'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 w-fit">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Deliverable Required</span>
                            </div>
                          )}
                        </td>

                        <td className="p-4 text-kth-slate-500 font-mono text-[11px]">
                          {new Date(req.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="p-4 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                            rightIcon={<ArrowRight className="w-3.5 h-3.5 text-kth-slate-400" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenFulfillPage(req);
                            }}
                          >
                            Review & Fulfill
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminShell>
  );
};
