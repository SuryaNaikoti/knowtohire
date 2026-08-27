import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUploader } from '@/components/ui/FileUploader';
import {
  requestService,
  ContentRequest,
  RequestStatus,
  knowledgeService,
  KnowledgeResource,
} from '@/services';
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Search,
  UploadCloud,
  Calendar,
  User,
} from 'lucide-react';

export interface AdminFulfillRequestPageProps {
  requestId?: string;
  onNavigate?: (path: string) => void;
}

export const AdminFulfillRequestPage: React.FC<AdminFulfillRequestPageProps> = ({
  requestId,
  onNavigate,
}) => {
  // Extract ID from prop or pathname
  const activeId = requestId || window.location.pathname.replace('/admin/requests/', '').replace('/fulfill', '');

  const [request, setRequest] = useState<ContentRequest | null>(null);
  const [knowledgeResources, setKnowledgeResources] = useState<KnowledgeResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form States
  const [status, setStatus] = useState<RequestStatus>('under_review');
  const [adminNotes, setAdminNotes] = useState('');
  const [priceINR, setPriceINR] = useState('0');
  const [fulfillmentMode, setFulfillmentMode] = useState<'upload' | 'attach'>('upload');

  // Custom Deliverable State
  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [deliverableDescription, setDeliverableDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Attached Resource State
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('/admin/requests');
    } else {
      window.history.pushState({}, '', '/admin/requests');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const [reqRes, resRes] = await Promise.all([
      requestService.getRequestById(activeId),
      knowledgeService.getResources({ status: 'all' }),
    ]);

    if (reqRes.error || !reqRes.data) {
      setErrorMessage(reqRes.error?.message || 'Request not found.');
      setRequest(null);
    } else {
      const req = reqRes.data;
      setRequest(req);
      setStatus(req.status);
      setAdminNotes(req.admin_notes || '');
      setPriceINR(String(req.price_inr || 0));
      setDeliverableTitle(req.deliverable_title || `${req.title} — Deliverable`);
      setDeliverableDescription(req.deliverable_description || '');
      setSelectedResourceId(req.completed_resource_id || '');
      setFulfillmentMode(req.completed_resource_id ? 'attach' : 'upload');
    }

    if (resRes.data) {
      setKnowledgeResources(resRes.data);
    }

    setIsLoading(false);
  }, [activeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (targetStatus?: RequestStatus) => {
    if (!request) return;
    setErrorMessage(null);

    const finalStatus = targetStatus || status;

    // Check deliverable existence if status is completed
    const hasDeliverable = Boolean(
      selectedFile ||
      request.deliverable_url ||
      (fulfillmentMode === 'attach' && selectedResourceId)
    );

    if (finalStatus === 'completed' && !hasDeliverable) {
      setErrorMessage('A completed resource or file deliverable must be uploaded or attached before this request can be marked as fulfilled.');
      return;
    }

    setIsSaving(true);

    const res = await requestService.updateAndFulfillRequest(request.id, {
      status: finalStatus,
      admin_notes: adminNotes.trim() || undefined,
      deliverable_title: deliverableTitle.trim() || undefined,
      deliverable_description: deliverableDescription.trim() || undefined,
      price_inr: parseFloat(priceINR) || 0,
      completed_resource_id: fulfillmentMode === 'attach' ? (selectedResourceId || undefined) : undefined,
      file: fulfillmentMode === 'upload' && selectedFile ? selectedFile : undefined,
      onProgress: (pct) => setUploadProgress(pct),
    });

    setIsSaving(false);

    if (res.error) {
      setErrorMessage(res.error.message);
    } else {
      setSuccessToast(
        finalStatus === 'completed'
          ? `Request marked as Fulfilled and deliverable published successfully!`
          : `Request updated successfully.`
      );
      setTimeout(() => setSuccessToast(null), 5000);
      loadData();
    }
  };

  const filteredResources = knowledgeResources.filter(
    (r) =>
      r.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
      r.category.toLowerCase().includes(resourceSearch.toLowerCase())
  );

  const getStatusBadge = (s: RequestStatus) => {
    switch (s) {
      case 'pending':
        return <Badge variant="amber">Submitted</Badge>;
      case 'under_review':
      case 'in_progress':
      case 'ready_for_delivery':
        return <Badge variant="cyan" className="capitalize">{s.replace(/_/g, ' ')}</Badge>;
      case 'completed':
        return <Badge variant="emerald" className="font-bold">Fulfilled</Badge>;
      case 'rejected':
      case 'cancelled':
        return <Badge variant="rose" className="capitalize">{s}</Badge>;
      default:
        return <Badge variant="slate">{s}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AdminShell title="Review & Fulfill Request" currentPath="/admin/requests" onNavigate={onNavigate}>
        <div className="py-32 flex flex-col items-center justify-center bg-white rounded-2xl border border-kth-slate-200">
          <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
          <p className="text-xs text-kth-slate-500 font-medium">Loading content request details...</p>
        </div>
      </AdminShell>
    );
  }

  if (errorMessage && !request) {
    return (
      <AdminShell title="Review & Fulfill Request" currentPath="/admin/requests" onNavigate={onNavigate}>
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-kth-slate-200 text-center shadow-xs">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="font-display text-lg font-bold text-kth-slate-900 mb-1">Request Not Found</h2>
          <p className="text-xs text-kth-slate-500 mb-6">{errorMessage}</p>
          <Button variant="primary" onClick={handleBack}>
            Back to Requests Queue
          </Button>
        </div>
      </AdminShell>
    );
  }

  if (!request) return null;

  return (
    <AdminShell title={`Fulfill: ${request.title}`} currentPath="/admin/requests" onNavigate={onNavigate}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-kth-slate-200 shadow-xs">
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-kth-slate-500 hover:text-kth-primary-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Content Requests Queue
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-bold text-kth-slate-900">
                Review & Fulfill Content Request
              </h1>
              {getStatusBadge(request.status)}
            </div>
            <p className="text-xs text-kth-slate-500">
              Reference ID: <span className="font-mono text-kth-slate-700 font-semibold">{request.id}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSaving}
              onClick={() => handleSave()}
            >
              Save Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSaving && status === 'completed'}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => handleSave('completed')}
            >
              Mark as Fulfilled
            </Button>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold px-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Main Fulfillment & Deliverable Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Candidate Request Scope */}
            <Card className="p-6 bg-white border-kth-slate-200 shadow-xs rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-kth-slate-100 pb-3">
                <h3 className="font-display text-sm font-bold text-kth-slate-900 uppercase tracking-wider">
                  Request Information
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="indigo">{request.type || 'Study Material'}</Badge>
                  <Badge variant="slate">{request.category}</Badge>
                  {request.preferred_format && (
                    <Badge variant="cyan">Format: {request.preferred_format}</Badge>
                  )}
                </div>
              </div>

              <div>
                <h2 className="font-display text-lg font-bold text-kth-slate-900 mb-1">{request.title}</h2>
                <div className="flex items-center gap-4 text-[11px] text-kth-slate-400 font-mono mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Submitted: {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {request.user_email && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {request.user_name || request.user_email}
                    </span>
                  )}
                </div>

                <div className="p-4 bg-kth-slate-50 border border-kth-slate-200/80 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-kth-slate-500 block">
                    Scope Description & Objectives
                  </span>
                  <p className="text-xs text-kth-slate-700 leading-relaxed whitespace-pre-wrap">
                    {request.description}
                  </p>
                </div>

                {request.additional_requirements && (
                  <div className="p-3.5 bg-kth-slate-50 border border-kth-slate-200/80 rounded-xl mt-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-kth-slate-500 block">
                      Additional Instructions / Benchmarks
                    </span>
                    <p className="text-xs text-kth-slate-700">{request.additional_requirements}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* 2. Deliverable & Fulfillment Section */}
            <Card className="p-6 bg-white border-kth-slate-200 shadow-xs rounded-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-kth-slate-100 pb-4">
                <div>
                  <h3 className="font-display text-base font-bold text-kth-slate-900 flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-kth-primary-600" />
                    Fulfill Request Deliverable
                  </h3>
                  <p className="text-xs text-kth-slate-500 mt-0.5">
                    Upload a custom deliverable directly to Supabase Storage or link an existing Knowledge Hub resource.
                  </p>
                </div>

                {/* Mode Selector */}
                <div className="flex items-center bg-kth-slate-100 p-1 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setFulfillmentMode('upload')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      fulfillmentMode === 'upload'
                        ? 'bg-white text-kth-primary-700 shadow-xs'
                        : 'text-kth-slate-600 hover:text-kth-slate-900'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillmentMode('attach')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      fulfillmentMode === 'attach'
                        ? 'bg-white text-kth-primary-700 shadow-xs'
                        : 'text-kth-slate-600 hover:text-kth-slate-900'
                    }`}
                  >
                    Attach Existing Resource
                  </button>
                </div>
              </div>

              {fulfillmentMode === 'upload' ? (
                /* OPTION A: File Upload */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Deliverable Title *"
                      value={deliverableTitle}
                      onChange={(e) => setDeliverableTitle(e.target.value)}
                      placeholder="e.g. Advanced Digital Marketing Master Guide"
                      required
                    />

                    <Input
                      label="Deliverable Summary (Optional)"
                      value={deliverableDescription}
                      onChange={(e) => setDeliverableDescription(e.target.value)}
                      placeholder="e.g. Full 48-page guide including case studies"
                    />
                  </div>

                  <FileUploader
                    label="Upload Deliverable File"
                    description="Drag & drop your deliverable file (PDF, DOCX, XLSX, PPTX, ZIP)"
                    selectedFile={selectedFile}
                    uploadedFileName={request.deliverable_name || request.deliverable_title}
                    uploadedFileSize={request.deliverable_size}
                    uploadedFormat={request.deliverable_format}
                    onFileSelect={(f) => setSelectedFile(f)}
                    onFileRemove={() => setSelectedFile(null)}
                    isUploading={isSaving}
                    uploadProgress={uploadProgress}
                    uploadSuccess={Boolean(request.deliverable_url || selectedFile)}
                  />

                  {request.deliverable_url && !selectedFile && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold block">Deliverable File Attached</span>
                          <span className="text-emerald-700">
                            {request.deliverable_name || request.deliverable_title} ({request.deliverable_format || 'PDF'} • {request.deliverable_size || '2.4 MB'})
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Download className="w-3.5 h-3.5" />}
                        onClick={() => window.open(request.deliverable_url || '', '_blank')}
                      >
                        Download Current File
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                /* OPTION B: Attach Knowledge Hub Resource */
                <div className="space-y-4">
                  <Input
                    label="Search Knowledge Hub Resources"
                    placeholder="Search by title, subject, or category..."
                    value={resourceSearch}
                    onChange={(e) => setResourceSearch(e.target.value)}
                    leftIcon={<Search className="w-4 h-4 text-kth-slate-400" />}
                  />

                  <div className="max-h-60 overflow-y-auto divide-y divide-kth-slate-100 border border-kth-slate-200 rounded-xl bg-white">
                    {filteredResources.length === 0 ? (
                      <div className="p-6 text-center text-xs text-kth-slate-400">
                        No matching knowledge hub resources found.
                      </div>
                    ) : (
                      filteredResources.map((res) => {
                        const isSelected = selectedResourceId === res.id;
                        return (
                          <div
                            key={res.id}
                            onClick={() => setSelectedResourceId(res.id)}
                            className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-kth-primary-50/70 border-l-4 border-kth-primary-600'
                                : 'hover:bg-kth-slate-50'
                            }`}
                          >
                            <div className="min-w-0 pr-3">
                              <p className="text-xs font-bold text-kth-slate-900 truncate">{res.title}</p>
                              <p className="text-[11px] text-kth-slate-500 font-mono mt-0.5">
                                {res.category} • {res.format} • {res.file_size || '2.4 MB'}
                              </p>
                            </div>
                            <Badge variant={isSelected ? 'indigo' : 'slate'} className="shrink-0 text-[10px]">
                              {isSelected ? '✓ Selected' : 'Select'}
                            </Badge>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right 1 Col: Status & Actions Sidebar */}
          <div className="space-y-6">
            {/* Status & Notes Card */}
            <Card className="p-6 bg-white border-kth-slate-200 shadow-xs rounded-2xl space-y-4">
              <h3 className="font-display text-sm font-bold text-kth-slate-900 uppercase tracking-wider border-b border-kth-slate-100 pb-3">
                Review & Governance
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">
                  Lifecycle Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RequestStatus)}
                  className="w-full rounded-xl border border-kth-slate-200 p-3 text-xs text-kth-slate-900 bg-white outline-none focus:ring-2 focus:ring-kth-primary-500/20"
                >
                  <option value="pending">Submitted / Pending Review</option>
                  <option value="under_review">Under Active Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="ready_for_delivery">Ready for Delivery</option>
                  <option value="completed">Fulfilled & Published</option>
                  <option value="rejected">Declined</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">
                  Access Pricing (INR)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    placeholder="0 for Free Access"
                    value={priceINR}
                    onChange={(e) => setPriceINR(e.target.value)}
                  />
                </div>
                <p className="text-[11px] text-kth-slate-400">
                  {parseFloat(priceINR) > 0 ? (
                    <span className="text-amber-700 font-medium">
                      Paid Content: Candidate must pay ₹{priceINR} before unlocking download.
                    </span>
                  ) : (
                    'Free Deliverable: Accessible immediately once fulfilled.'
                  )}
                </p>
                {request.is_paid && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] font-bold text-emerald-800 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Payment Confirmed by Candidate (Tx: {request.payment_id || 'Verified'})</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">
                  Editorial / Review Notes
                </label>
                <textarea
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Feedback visible to the requesting candidate in their portal..."
                  className="w-full rounded-xl border border-kth-slate-200 p-3 text-xs text-kth-slate-900 outline-none focus:ring-2 focus:ring-kth-primary-500/20 resize-none"
                />
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full justify-center"
                  isLoading={isSaving && status === 'completed'}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => handleSave('completed')}
                >
                  Mark as Fulfilled
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full justify-center"
                  disabled={isSaving}
                  onClick={() => handleSave()}
                >
                  Save Changes
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-center text-kth-slate-500"
                  onClick={handleBack}
                >
                  Cancel & Return
                </Button>
              </div>
            </Card>

            {/* Quick Checklist / Audit Card */}
            <Card className="p-5 bg-kth-slate-50 border-kth-slate-200 shadow-xs rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider">
                Fulfillment Checklist
              </h4>
              <ul className="space-y-2 text-xs text-kth-slate-600 pl-0 list-none">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${request.description ? 'text-emerald-600' : 'text-kth-slate-300'}`} />
                  <span>Scope requirement verified</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      selectedFile || request.deliverable_url || selectedResourceId
                        ? 'text-emerald-600'
                        : 'text-amber-500'
                    }`}
                  />
                  <span>Deliverable attached / uploaded</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${status === 'completed' ? 'text-emerald-600' : 'text-kth-slate-300'}`} />
                  <span>Status set to Fulfilled</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </AdminShell>
  );
};
