import React, { useState, useEffect, useCallback } from 'react';
import { CandidateShell } from '@/components/candidate/CandidateShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { requestService, ContentRequest, RequestStatus } from '@/services/requestService';
import {
  FileText,
  Plus,
  AlertCircle,
  ExternalLink,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  Calendar,
  Download,
  FileCheck,
} from 'lucide-react';

export const CandidateRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ContentRequest | null>(null);

  // Form State
  const [type, setType] = useState('Study Material');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [preferredFormat, setPreferredFormat] = useState('PDF');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
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

  const handleOpenCreateModal = () => {
    setTitle('');
    setDescription('');
    setType('Study Material');
    setCategory('Technology');
    setPreferredFormat('PDF');
    setAdditionalRequirements('');
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setSubmitError('Please provide a title for your request.');
      return;
    }
    if (!description.trim()) {
      setSubmitError('Please describe the scope and requirements of the content you need.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const res = await requestService.createRequest({
      title: title.trim(),
      description: description.trim(),
      category,
      type,
      preferred_format: preferredFormat,
      additional_requirements: additionalRequirements.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.error) {
      setSubmitError(res.error.message);
    } else {
      setIsModalOpen(false);
      setSuccessToast('Your content request has been submitted to the editorial queue!');
      setTimeout(() => setSuccessToast(null), 5000);
      fetchRequests();
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

  const activeCount = requests.filter(
    (r) => r.status === 'pending' || r.status === 'under_review' || r.status === 'in_progress' || r.status === 'ready_for_delivery'
  ).length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;

  const handleOpenDeliverable = (req: ContentRequest) => {
    if (req.deliverable_url) {
      window.open(req.deliverable_url, '_blank');
    } else if (req.completed_resource_id) {
      window.location.href = `/knowledge/${req.completed_resource_id}`;
    }
  };

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
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenCreateModal} className="shrink-0">
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
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenCreateModal}>
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
                    className={`p-5 sm:p-6 bg-white transition-all shadow-xs rounded-2xl cursor-pointer ${
                      isFulfilled
                        ? 'border-emerald-200 hover:border-emerald-400 bg-gradient-to-r from-white via-white to-emerald-50/20'
                        : 'border-kth-slate-200 hover:border-kth-primary-300'
                    }`}
                    onClick={() => setSelectedRequest(req)}
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
                            <span className="text-[11px] font-bold text-emerald-700 underline shrink-0">
                              Ready for Download
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-kth-slate-400 font-mono pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-kth-slate-400" />
                            Submitted: {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {req.admin_notes && (
                            <span className="text-kth-primary-700 font-sans font-medium bg-kth-primary-50 px-2 py-0.5 rounded border border-kth-primary-200">
                              Editor Note: {req.admin_notes}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-kth-slate-100">
                        {isFulfilled && hasDeliverable ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<Download className="w-3.5 h-3.5" />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeliverable(req);
                              }}
                            >
                              View / Download Resource
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest(req);
                            }}
                          >
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Create Request Modal */}
        <Dialog
          isOpen={isModalOpen}
          onClose={() => !isSubmitting && setIsModalOpen(false)}
          title="Submit Custom Content Request"
          description="Specify the exact study guide, research paper, white paper, or template requirements for our editorial desk."
          maxWidth="lg"
        >
          <form onSubmit={handleCreateRequest} className="space-y-4 pt-2">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Request Type *"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { value: 'Study Material', label: 'Study Material' },
                  { value: 'Research Document', label: 'Research Document' },
                  { value: 'White Paper', label: 'White Paper' },
                  { value: 'Template', label: 'Template' },
                ]}
              />

              <Select
                label="Domain / Subject"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'Technology', label: 'Technology & Cloud Engineering' },
                  { value: 'Sustainability', label: 'Sustainability & Climate' },
                  { value: 'Environmental', label: 'Environmental & ESG' },
                  { value: 'IPR', label: 'Patent & Intellectual Property' },
                  { value: 'Research', label: 'Public Policy & Empirical Research' },
                  { value: 'General', label: 'General Career & Professional Guide' },
                ]}
              />
            </div>

            <Input
              label="Request Title *"
              placeholder="e.g. Advanced Digital Marketing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">
                Detailed Scope & Objectives *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the specific technical frameworks, industry standards, practical blueprints, or document requirements you need..."
                className="w-full rounded-xl border border-kth-slate-200 p-3 text-xs text-kth-slate-900 bg-white placeholder:text-kth-slate-400 outline-none focus:ring-2 focus:ring-kth-primary-500/20 focus:border-kth-primary-600 transition-colors resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Preferred Format"
                value={preferredFormat}
                onChange={(e) => setPreferredFormat(e.target.value)}
                options={[
                  { value: 'PDF', label: 'PDF Document' },
                  { value: 'DOCX', label: 'Word (.docx)' },
                  { value: 'PPTX', label: 'Presentation (.pptx)' },
                  { value: 'Excel', label: 'Spreadsheet (.xlsx)' },
                  { value: 'ZIP', label: 'Archive (.zip)' },
                  { value: 'Other', label: 'Other Format' },
                ]}
              />

              <Input
                label="Additional Instructions / References (Optional)"
                placeholder="e.g. Include case studies and performance benchmarks"
                value={additionalRequirements}
                onChange={(e) => setAdditionalRequirements(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-kth-slate-100">
              <Button type="button" variant="secondary" size="sm" disabled={isSubmitting} onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                Submit Request
              </Button>
            </div>
          </form>
        </Dialog>

        {/* View Details Modal with Deliverable section */}
        <Dialog
          isOpen={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          title="Content Request & Deliverable"
          description={`Reference ID: ${selectedRequest?.id}`}
          maxWidth="lg"
        >
          {selectedRequest && (
            <div className="space-y-4 pt-2 max-h-[75vh] overflow-y-auto pr-1">
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(selectedRequest.status)}
                <Badge variant="indigo">{selectedRequest.type || 'Study Material'}</Badge>
                <Badge variant="slate">{selectedRequest.category}</Badge>
                {selectedRequest.preferred_format && (
                  <Badge variant="cyan">Preferred: {selectedRequest.preferred_format}</Badge>
                )}
              </div>

              <div>
                <h3 className="font-display font-bold text-base text-kth-slate-900">{selectedRequest.title}</h3>
                <p className="text-xs text-kth-slate-500 font-mono mt-0.5">
                  Submitted on {new Date(selectedRequest.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <div className="p-4 bg-kth-slate-50 border border-kth-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-kth-slate-500 block">Requested Scope & Description</span>
                <p className="text-xs text-kth-slate-700 leading-relaxed whitespace-pre-wrap">{selectedRequest.description}</p>
              </div>

              {selectedRequest.additional_requirements && (
                <div className="p-3.5 bg-kth-slate-50 border border-kth-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-kth-slate-500 block">Additional Instructions</span>
                  <p className="text-xs text-kth-slate-700 leading-relaxed">{selectedRequest.additional_requirements}</p>
                </div>
              )}

              {selectedRequest.admin_notes && (
                <div className="p-3.5 bg-kth-primary-50/70 border border-kth-primary-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-kth-primary-800 block">Editorial Desk Feedback</span>
                  <p className="text-xs text-kth-primary-950 leading-relaxed">{selectedRequest.admin_notes}</p>
                </div>
              )}

              {/* DELIVERABLE SECTION */}
              {selectedRequest.status === 'completed' && (selectedRequest.deliverable_url || selectedRequest.completed_resource_id) && (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">DELIVERABLE ATTACHED & FULFILLED</span>
                      <span className="text-[11px] text-emerald-800">
                        The requested study resource is ready for review and download.
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-mono font-bold text-xs shrink-0">
                        {selectedRequest.deliverable_format || 'PDF'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-kth-slate-900 truncate">
                          {selectedRequest.deliverable_title || selectedRequest.deliverable_name || selectedRequest.title}
                        </p>
                        <p className="text-[11px] text-kth-slate-500 font-mono">
                          {selectedRequest.deliverable_format || 'PDF'} {selectedRequest.deliverable_size ? `• ${selectedRequest.deliverable_size}` : ''}
                        </p>
                        {selectedRequest.deliverable_description && (
                          <p className="text-xs text-kth-slate-600 mt-1 line-clamp-2">
                            {selectedRequest.deliverable_description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {selectedRequest.deliverable_url && (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Download className="w-3.5 h-3.5" />}
                          onClick={() => window.open(selectedRequest.deliverable_url || '', '_blank')}
                        >
                          Download
                        </Button>
                      )}
                      {selectedRequest.completed_resource_id && (
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                          onClick={() => {
                            window.location.href = `/knowledge/${selectedRequest.completed_resource_id}`;
                          }}
                        >
                          View in Hub
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-kth-slate-100">
                <Button variant="secondary" size="sm" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </CandidateShell>
  );
};
