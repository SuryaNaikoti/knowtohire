import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { requestService, ContentRequest } from '@/services';
import {
  Loader2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export interface AdminRequestsPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminRequestsPage: React.FC<AdminRequestsPageProps> = ({ onNavigate }) => {
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <AdminShell title="On-Demand Content Requests Queue" currentPath="/admin/requests">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-kth-slate-200 shadow-xs">
          <div>
            <h2 className="font-display text-base font-bold text-kth-slate-900">User Content & Research Submissions</h2>
            <p className="text-xs text-kth-slate-500 mt-0.5">
              Review custom candidate requests, upload deliverables directly to Supabase Storage, link Knowledge Hub assets, and manage fulfillment.
            </p>
          </div>
          <span className="text-xs font-mono text-kth-slate-500 font-bold bg-kth-slate-100 px-3 py-1.5 rounded-xl border border-kth-slate-200 shrink-0">
            {requests.length} Total Requests
          </span>
        </div>

        {/* Requests Table Card */}
        <Card className="p-0 overflow-hidden rounded-2xl border-kth-slate-200 shadow-xs">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500">Loading requests queue...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-kth-slate-500 text-xs">No on-demand content requests in the queue.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Request & Scope</th>
                    <th className="p-4">Type & Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Deliverable State</th>
                    <th className="p-4">Submission Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kth-slate-100">
                  {requests.map((req) => {
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
                            <Badge variant="indigo">{req.type || 'Study Material'}</Badge>
                            <span className="text-[11px] text-kth-slate-500 font-medium">{req.category}</span>
                            {req.preferred_format && (
                              <span className="text-[10px] font-mono text-kth-slate-400">
                                Format: {req.preferred_format}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <Badge
                            variant={
                              req.status === 'completed'
                                ? 'emerald'
                                : req.status === 'under_review' || req.status === 'in_progress' || req.status === 'ready_for_delivery'
                                ? 'cyan'
                                : req.status === 'rejected' || req.status === 'cancelled'
                                ? 'rose'
                                : 'amber'
                            }
                            className="capitalize font-mono text-[11px]"
                          >
                            {req.status === 'completed'
                              ? 'Fulfilled'
                              : req.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>

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
