import React, { useState, useEffect } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { requestService, ContentRequest, RequestStatus } from '@/services/requestService';
import { paymentService } from '@/services/paymentService';
import { navigateTo } from '@/utils/navigation';
import {
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  Lock,
  Download,
  ExternalLink,
  CreditCard,
  AlertCircle,
} from 'lucide-react';

interface CandidateRequestDetailsPageProps {
  requestId?: string;
  onNavigate?: (path: string) => void;
}

export const CandidateRequestDetailsPage: React.FC<CandidateRequestDetailsPageProps> = ({ requestId: propRequestId, onNavigate }) => {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const pathId = currentPath.startsWith('/candidate/requests/') ? currentPath.replace('/candidate/requests/', '') : '';
  const id = propRequestId || pathId;

  const [request, setRequest] = useState<ContentRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequest = async () => {
    if (!id) return;
    setIsLoading(true);
    const res = await requestService.getMyRequests();
    if (res.data) {
      const match = res.data.find((r) => r.id === id);
      if (match) {
        setRequest(match);
      } else {
        setError('Content request record not found.');
      }
    } else {
      setError(res.error?.message || 'Failed to fetch request.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handlePayAndUnlock = async (req: ContentRequest) => {
    setIsPaying(true);
    setError(null);

    const price = req.price_inr || 0;
    const checkoutRes = await paymentService.initiateCheckout({
      amountINR: price,
      itemId: req.id,
      itemType: 'content_request',
      itemName: req.deliverable_title || req.title,
      onSuccess: async (paymentId: string) => {
        await requestService.markRequestPaid(req.id, paymentId);
        await fetchRequest();
        setIsPaying(false);
      },
      onCancel: () => {
        setIsPaying(false);
      },
    });

    if (checkoutRes.error) {
      setError(checkoutRes.error.message);
      setIsPaying(false);
    }
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('/candidate/requests');
    } else {
      navigateTo('/candidate/requests');
    }
  };

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

  return (
    <CandidateShell title="Content Request Deliverable" currentPath="/candidate/requests">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Content Requests</span>
          </button>
          <span className="text-xs font-mono text-kth-slate-400">Request #{id}</span>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <Card className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500 font-medium">Retrieving request records and deliverables...</p>
          </Card>
        ) : request ? (
          <div className="space-y-6">
            {/* Header Card */}
            <Card className="p-6 sm:p-8 space-y-4 bg-white border-kth-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(request.status)}
                <Badge variant="indigo">{request.type || 'Study Material'}</Badge>
                <Badge variant="slate">{request.category}</Badge>
                {request.preferred_format && (
                  <Badge variant="cyan">Format: {request.preferred_format}</Badge>
                )}
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-kth-slate-900">{request.title}</h1>
                <p className="text-xs text-kth-slate-500 font-mono mt-1">
                  Submitted on {new Date(request.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <div className="p-4 bg-kth-slate-50 border border-kth-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-kth-slate-500 block">
                  Requested Scope & Description
                </span>
                <p className="text-xs text-kth-slate-700 leading-relaxed whitespace-pre-wrap">{request.description}</p>
              </div>

              {request.additional_requirements && (
                <div className="p-4 bg-kth-slate-50 border border-kth-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-kth-slate-500 block">
                    Additional Instructions
                  </span>
                  <p className="text-xs text-kth-slate-700 leading-relaxed">{request.additional_requirements}</p>
                </div>
              )}

              {request.admin_notes && (
                <div className="p-4 bg-kth-primary-50/70 border border-kth-primary-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-kth-primary-800 block">
                    Editorial Desk Feedback
                  </span>
                  <p className="text-xs text-kth-primary-950 leading-relaxed">{request.admin_notes}</p>
                </div>
              )}
            </Card>

            {/* DELIVERABLE SECTION */}
            {request.status === 'completed' && (request.deliverable_url || request.completed_resource_id) && (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-sm font-bold text-emerald-950 block">DELIVERABLE ATTACHED & FULFILLED</span>
                      <span className="text-xs text-emerald-800">
                        The requested study resource is ready for access.
                      </span>
                    </div>
                  </div>
                  {request.price_inr && request.price_inr > 0 ? (
                    request.is_paid ? (
                      <Badge variant="emerald" className="font-bold">✓ Paid ₹{request.price_inr}</Badge>
                    ) : (
                      <Badge variant="amber" className="font-bold">₹{request.price_inr}</Badge>
                    )
                  ) : (
                    <Badge variant="emerald">Free Resource</Badge>
                  )}
                </div>

                {/* If paid content and NOT paid yet, show locked pay card */}
                {request.price_inr && request.price_inr > 0 && !request.is_paid ? (
                  <div className="bg-white p-5 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-kth-slate-900 truncate">
                          {request.deliverable_title || request.deliverable_name || request.title}
                        </p>
                        <p className="text-[11px] text-amber-700 font-medium">
                          Premium Research Deliverable • ₹{request.price_inr} required to unlock
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isPaying}
                      leftIcon={<CreditCard className="w-4 h-4" />}
                      onClick={() => handlePayAndUnlock(request)}
                    >
                      Pay ₹{request.price_inr} to Download
                    </Button>
                  </div>
                ) : (
                  /* UNLOCKED & DOWNLOADABLE */
                  <div className="bg-white p-5 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-mono font-bold text-xs shrink-0">
                        {request.deliverable_format || 'PDF'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-kth-slate-900 truncate">
                          {request.deliverable_title || request.deliverable_name || request.title}
                        </p>
                        <p className="text-[11px] text-kth-slate-500 font-mono">
                          {request.deliverable_format || 'PDF'} {request.deliverable_size ? `• ${request.deliverable_size}` : ''}
                        </p>
                        {request.deliverable_description && (
                          <p className="text-xs text-kth-slate-600 mt-1 line-clamp-2">
                            {request.deliverable_description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {request.deliverable_url && (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Download className="w-3.5 h-3.5" />}
                          onClick={() => window.open(request.deliverable_url || '', '_blank')}
                        >
                          Download Deliverable
                        </Button>
                      )}
                      {request.completed_resource_id && (
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                          onClick={() => {
                            window.location.href = `/knowledge/${request.completed_resource_id}`;
                          }}
                        >
                          View in Hub
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </CandidateShell>
  );
};
