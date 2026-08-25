import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { FileUploader } from '@/components/ui/FileUploader';
import {
  requestService,
  ContentRequest,
  RequestStatus,
  knowledgeService,
  KnowledgeResource,
} from '@/services';
import {
  Loader2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Download,
  Search,
  UploadCloud,
} from 'lucide-react';

export const AdminRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [knowledgeResources, setKnowledgeResources] = useState<KnowledgeResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<ContentRequest | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fulfillment Form State
  const [status, setStatus] = useState<RequestStatus>('under_review');
  const [adminNotes, setAdminNotes] = useState('');
  const [fulfillmentMode, setFulfillmentMode] = useState<'upload' | 'attach'>('upload');
  
  // Custom Deliverable State
  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [deliverableDescription, setDeliverableDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Attached Resource State
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    const [reqRes, resRes] = await Promise.all([
      requestService.getAllRequests(),
      knowledgeService.getResources({ status: 'all' }),
    ]);

    if (reqRes.data) {
      setRequests(reqRes.data);
    }
    if (resRes.data) {
      setKnowledgeResources(resRes.data);
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
      window.addEventListener('kth_resources_changed', handleChanges);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kth_requests_changed', handleChanges);
        window.removeEventListener('kth_resources_changed', handleChanges);
      }
    };
  }, [fetchRequests]);

  const handleOpenEdit = (req: ContentRequest) => {
    setSelectedReq(req);
    setStatus(req.status);
    setAdminNotes(req.admin_notes || '');
    setDeliverableTitle(req.deliverable_title || `${req.title} — Deliverable`);
    setDeliverableDescription(req.deliverable_description || '');
    setSelectedFile(null);
    setSelectedResourceId(req.completed_resource_id || '');
    setFulfillmentMode(req.completed_resource_id ? 'attach' : 'upload');
    setUploadProgress(0);
    setModalError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveUpdate = async (targetStatus?: RequestStatus) => {
    if (!selectedReq) return;
    setModalError(null);

    const finalStatus = targetStatus || status;

    // Check deliverable existence if status is completed
    const hasDeliverable = Boolean(
      selectedFile ||
      selectedReq.deliverable_url ||
      (fulfillmentMode === 'attach' && selectedResourceId)
    );

    if (finalStatus === 'completed' && !hasDeliverable) {
      setModalError('A completed resource or file deliverable must be uploaded or attached before this request can be marked as fulfilled.');
      return;
    }

    setIsUpdating(true);

    const res = await requestService.updateAndFulfillRequest(selectedReq.id, {
      status: finalStatus,
      admin_notes: adminNotes.trim() || undefined,
      deliverable_title: deliverableTitle.trim() || undefined,
      deliverable_description: deliverableDescription.trim() || undefined,
      completed_resource_id: fulfillmentMode === 'attach' ? (selectedResourceId || undefined) : undefined,
      file: fulfillmentMode === 'upload' && selectedFile ? selectedFile : undefined,
      onProgress: (pct) => setUploadProgress(pct),
    });

    setIsUpdating(false);

    if (res.error) {
      setModalError(res.error.message);
    } else {
      setIsEditModalOpen(false);
      setToastMessage(
        finalStatus === 'completed'
          ? `Request "${selectedReq.title}" has been marked as Fulfilled and the deliverable is published!`
          : `Request updated successfully.`
      );
      setTimeout(() => setToastMessage(null), 5000);
      fetchRequests();
    }
  };

  const filteredResources = knowledgeResources.filter((r) =>
    r.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
    r.category.toLowerCase().includes(resourceSearch.toLowerCase())
  );

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

        {/* Success Toast */}
        {toastMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold px-2"
            >
              Dismiss
            </button>
          </div>
        )}

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
                      <tr key={req.id} className="hover:bg-kth-slate-50/70 transition-colors">
                        <td className="p-4 max-w-xs sm:max-w-sm">
                          <div className="font-bold text-kth-slate-900 text-sm">{req.title}</div>
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
                            onClick={() => handleOpenEdit(req)}
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

        {/* Review & Fulfill Modal */}
        <Dialog
          isOpen={isEditModalOpen}
          onClose={() => !isUpdating && setIsEditModalOpen(false)}
          title="Review & Fulfill Content Request"
          description={selectedReq?.title || ''}
          maxWidth="lg"
        >
          {selectedReq && (
            <div className="space-y-5 pt-2 max-h-[75vh] overflow-y-auto pr-1">
              {/* Error Alert */}
              {modalError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* 1. Request Details Section */}
              <div className="p-4 bg-kth-slate-50 border border-kth-slate-200 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kth-slate-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo">{selectedReq.type || 'Study Material'}</Badge>
                    <Badge variant="slate">{selectedReq.category}</Badge>
                    {selectedReq.preferred_format && (
                      <Badge variant="cyan">Preferred: {selectedReq.preferred_format}</Badge>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-kth-slate-400">
                    Ref ID: {selectedReq.id}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider mb-1">
                    Candidate Scope & Objectives
                  </h4>
                  <p className="text-xs text-kth-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-kth-slate-200/80 whitespace-pre-wrap">
                    {selectedReq.description}
                  </p>
                </div>

                {selectedReq.additional_requirements && (
                  <div>
                    <h4 className="text-[11px] font-bold text-kth-slate-700 uppercase tracking-wider mb-1">
                      Additional Requirements
                    </h4>
                    <p className="text-xs text-kth-slate-600 bg-white p-2.5 rounded-xl border border-kth-slate-200/80">
                      {selectedReq.additional_requirements}
                    </p>
                  </div>
                )}
              </div>

              {/* 2. Review Section: Status & Editorial Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-kth-slate-700 uppercase tracking-wider block">
                    Lifecycle Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RequestStatus)}
                    className="w-full rounded-xl border border-kth-slate-200 p-2.5 text-xs text-kth-slate-900 bg-white outline-none focus:ring-2 focus:ring-kth-primary-500/20"
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
                    Editorial / Review Notes
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Feedback visible to the requesting candidate..."
                    className="w-full rounded-xl border border-kth-slate-200 p-2.5 text-xs text-kth-slate-900 outline-none focus:ring-2 focus:ring-kth-primary-500/20 resize-none"
                  />
                </div>
              </div>

              {/* 3. FULFILL REQUEST / DELIVERABLE SECTION */}
              <div className="border border-kth-slate-200 rounded-2xl p-5 bg-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-kth-slate-100 pb-3">
                  <div>
                    <h3 className="font-display text-sm font-bold text-kth-slate-900 flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-kth-primary-600" />
                      Fulfill Request & Deliverable
                    </h3>
                    <p className="text-[11px] text-kth-slate-500">
                      Upload a customized deliverable or attach an existing Knowledge Hub resource.
                    </p>
                  </div>

                  {/* Toggle Modes */}
                  <div className="flex items-center bg-kth-slate-100 p-1 rounded-xl shrink-0">
                    <button
                      type="button"
                      onClick={() => setFulfillmentMode('upload')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
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
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        fulfillmentMode === 'attach'
                          ? 'bg-white text-kth-primary-700 shadow-xs'
                          : 'text-kth-slate-600 hover:text-kth-slate-900'
                      }`}
                    >
                      Attach Resource
                    </button>
                  </div>
                </div>

                {fulfillmentMode === 'upload' ? (
                  /* Option A: Direct File Upload to Supabase Storage */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Deliverable Title"
                        value={deliverableTitle}
                        onChange={(e) => setDeliverableTitle(e.target.value)}
                        placeholder="e.g. Advanced Digital Marketing Master Guide"
                        required
                      />

                      <Input
                        label="Deliverable Summary (Optional)"
                        value={deliverableDescription}
                        onChange={(e) => setDeliverableDescription(e.target.value)}
                        placeholder="e.g. Full 48-page study guide including case studies"
                      />
                    </div>

                    <FileUploader
                      label="Upload Deliverable File"
                      description="Drag & drop your deliverable file or click to browse"
                      selectedFile={selectedFile}
                      uploadedFileName={selectedReq.deliverable_name || selectedReq.deliverable_title}
                      uploadedFileSize={selectedReq.deliverable_size}
                      uploadedFormat={selectedReq.deliverable_format}
                      onFileSelect={(f) => setSelectedFile(f)}
                      onFileRemove={() => setSelectedFile(null)}
                      isUploading={isUpdating}
                      uploadProgress={uploadProgress}
                      uploadSuccess={Boolean(selectedReq.deliverable_url || selectedFile)}
                    />

                    {selectedReq.deliverable_url && !selectedFile && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Existing deliverable is already attached.</span>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Download className="w-3.5 h-3.5" />}
                          onClick={() => window.open(selectedReq.deliverable_url || '', '_blank')}
                        >
                          View Current File
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Option B: Search & Attach Existing Knowledge Hub Resource */
                  <div className="space-y-3">
                    <Input
                      label="Search Knowledge Hub Resources"
                      placeholder="Type title or category..."
                      value={resourceSearch}
                      onChange={(e) => setResourceSearch(e.target.value)}
                      leftIcon={<Search className="w-4 h-4 text-kth-slate-400" />}
                    />

                    <div className="max-h-44 overflow-y-auto divide-y divide-kth-slate-100 border border-kth-slate-200 rounded-xl bg-white">
                      {filteredResources.length === 0 ? (
                        <div className="p-4 text-center text-xs text-kth-slate-400">
                          No matching knowledge hub resources found.
                        </div>
                      ) : (
                        filteredResources.map((res) => {
                          const isSelected = selectedResourceId === res.id;
                          return (
                            <div
                              key={res.id}
                              onClick={() => setSelectedResourceId(res.id)}
                              className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-kth-primary-50 border-l-4 border-kth-primary-600'
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
                                {isSelected ? 'Selected' : 'Select'}
                              </Badge>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Modal Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-kth-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => handleSaveUpdate('in_progress')}
                  >
                    Save as In Progress
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    isLoading={isUpdating && status !== 'completed'}
                    onClick={() => handleSaveUpdate()}
                  >
                    Save Changes
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    isLoading={isUpdating && status === 'completed'}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => handleSaveUpdate('completed')}
                  >
                    Mark as Fulfilled
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </AdminShell>
  );
};
