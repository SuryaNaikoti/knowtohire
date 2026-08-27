import React, { useState, useEffect, useCallback } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { requestService, ContentRequest, RequestStatus } from '@/services/requestService';
import {
  FileText,
  Plus,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  Calendar,
  FileCheck,
} from 'lucide-react';

export const CandidateRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    const res = await requestService.getMyRequests();
    if (res.data) {
      setRequests(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();

    const handleStorageChange = () => {
      fetchRequests();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('kth_requests_changed', handleStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kth_requests_changed', handleStorageChange);
      }
    };
  }, [fetchRequests]);

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="amber" className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Submitted
          </Badge>
        );
      case 'under_review':
      case 'in_progress':
      case 'ready_for_delivery':
        return (
          <Badge variant="cyan" className="flex items-center gap-1 capitalize">
            <Info className="w-3 h-3" /> {status.replace(/_/g, ' ')}
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="emerald" className="flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3" /> Fulfilled
          </Badge>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <Badge variant="rose" className="flex items-center gap-1 capitalize">
            <XCircle className="w-3 h-3" /> {status}
          </Badge>
        );
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const activeCount = requests.filter(
    (r) => r.status === 'pending' || r.status === 'under_review' || r.status === 'in_progress' || r.status === 'ready_for_delivery'
  ).length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;

  return (
    <CandidateShell title="Content Requests" currentPath="/candidate/requests">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-kth-slate-200 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-kth-primary-50 text-kth-primary-700 border border-kth-primary-200/60 mb-2">
              Knowledge Hub On-Demand
            </div>
            <h1 className="font-display text-xl font-bold text-kth-slate-900">Custom Research & Content Requests</h1>
            <p className="text-xs text-kth-slate-500 mt-1 max-w-xl leading-relaxed">
              Request specialized study materials, research documents, white papers, or professional templates from our domain specialists.
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => { window.location.href = '/candidate/requests/new'; }}
            className="shrink-0 font-bold text-xs"
          >
            New Content Request
          </Button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-0.5"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Content Area */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white rounded-2xl border border-kth-slate-200 shadow-xs">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500">Loading your content requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center bg-white border-kth-slate-200 shadow-xs rounded-2xl">
            <div className="w-16 h-16 bg-kth-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-kth-primary-100">
              <FileText className="w-8 h-8 text-kth-primary-600" />
            </div>
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-1">No Content Requests Yet</h3>
            <p className="text-xs text-kth-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
              Need a specific study material, research document, white paper, or professional template? Submit a request and track its progress here.
            </p>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => { window.location.href = '/candidate/requests/new'; }}
            >
              Create Your First Request
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Quick Summary Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-kth-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider block">Total Submissions</span>
                <span className="text-xl font-bold font-mono text-kth-slate-900">{requests.length}</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-kth-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">In Progress / Review</span>
                <span className="text-xl font-bold font-mono text-amber-700">{activeCount}</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-kth-slate-200 shadow-xs col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Fulfilled Deliverables</span>
                <span className="text-xl font-bold font-mono text-emerald-700">{completedCount}</span>
              </div>
            </div>

            {/* Request Cards Feed */}
            <div className="space-y-4">
              {requests.map((req) => {
                const isFulfilled = req.status === 'completed';
                const hasDeliverable = Boolean(req.deliverable_url || req.completed_resource_id);

                return (
                  <Card
                    key={req.id}
                    className={`p-5 sm:p-6 bg-white transition-all shadow-xs rounded-2xl cursor-pointer group ${
                      isFulfilled
                        ? 'border-emerald-200 hover:border-emerald-400 bg-gradient-to-r from-white via-white to-emerald-50/20'
                        : 'border-kth-slate-200 hover:border-kth-primary-300'
                    }`}
                    onClick={() => { window.location.href = `/candidate/requests/${req.id}`; }}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(req.status)}
                          <Badge variant="indigo" className="text-[10px] font-medium">
                            {req.type || 'Study Material'}
                          </Badge>
                          <Badge variant="slate" className="text-[10px]">
                            {req.category}
                          </Badge>
                          {req.preferred_format && (
                            <span className="text-[10px] text-kth-slate-500 font-mono bg-kth-slate-100 px-2 py-0.5 rounded">
                              Format: {req.preferred_format}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-display text-base font-bold text-kth-slate-900 group-hover:text-kth-primary-600 transition-colors">
                            {req.title}
                          </h3>
                          <p className="text-xs text-kth-slate-600 leading-relaxed line-clamp-2 mt-1">
                            {req.description}
                          </p>
                        </div>

                        {/* If fulfilled, show Deliverable Banner */}
                        {isFulfilled && hasDeliverable && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-2 mt-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-emerald-900 block truncate">
                                  {req.deliverable_title || req.deliverable_name || 'Deliverable Completed'}
                                </span>
                                <span className="text-[10px] text-emerald-700 font-mono">
                                  {req.deliverable_format || 'PDF'} {req.deliverable_size ? `• ${req.deliverable_size}` : ''}
                                </span>
                              </div>
                            </div>
                            {req.price_inr && req.price_inr > 0 && !req.is_paid ? (
                              <Badge variant="amber" className="text-[11px] font-bold shrink-0">
                                Price: ₹{req.price_inr}
                              </Badge>
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-700 underline shrink-0">
                                Ready for Download
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-kth-slate-400 font-mono pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-kth-slate-400" />
                            Submitted: {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {req.price_inr && req.price_inr > 0 ? (
                            req.is_paid ? (
                              <span className="text-emerald-700 font-sans font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                ✓ Paid (₹{req.price_inr})
                              </span>
                            ) : (
                              <span className="text-amber-800 font-sans font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Price: ₹{req.price_inr}
                              </span>
                            )
                          ) : null}
                          {req.admin_notes && (
                            <span className="text-kth-primary-700 font-sans font-medium bg-kth-primary-50 px-2 py-0.5 rounded border border-kth-primary-200">
                              Editor Note: {req.admin_notes}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-kth-slate-100">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/candidate/requests/${req.id}`;
                          }}
                        >
                          View Deliverable & Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </CandidateShell>
  );
};
