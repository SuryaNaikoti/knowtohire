import React, { useState, useEffect, useCallback } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { formatINR } from '@/design-system/tokens';
import {
  creatorService,
  ContentItemType,
} from '@/services/creatorService';
import { knowledgeService, KnowledgeResource } from '@/services/knowledgeService';
import { templateService, MarketplaceTemplate } from '@/services/templateService';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
  Send,
  MessageSquare,
  Ban,
  ExternalLink,
  ShieldCheck,
  Percent,
  IndianRupee,
} from 'lucide-react';

export interface AdminContentReviewDetailPageProps {
  itemId: string;
  itemType: ContentItemType;
  onNavigate?: (path: string) => void;
}

export const AdminContentReviewDetailPage: React.FC<AdminContentReviewDetailPageProps> = ({
  itemId,
  itemType,
  onNavigate,
}) => {
  const [content, setContent] = useState<KnowledgeResource | MarketplaceTemplate | null>(null);
  const [sellingPriceINR, setSellingPriceINR] = useState<number>(999);
  const [creatorCommissionPct, setCreatorCommissionPct] = useState<number>(70);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [changeFeedback, setChangeFeedback] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    let item: any = null;
    if (itemType === 'resource') {
      const res = await knowledgeService.getResourceByIdOrSlug(itemId);
      item = res.data;
    } else {
      const tpl = await templateService.getTemplateByIdOrSlug(itemId);
      item = tpl.data;
    }

    if (item) {
      setContent(item);
      if (item.selling_price_inr !== undefined && item.selling_price_inr > 0) {
        setSellingPriceINR(item.selling_price_inr);
      } else if (item.price_inr !== undefined && item.price_inr > 0) {
        setSellingPriceINR(item.price_inr);
      }
      if (item.creator_commission_pct !== undefined) {
        setCreatorCommissionPct(item.creator_commission_pct);
      } else {
        const config = await creatorService.getMonetizationConfig();
        setCreatorCommissionPct(config.commissionPercentage || 70);
      }
      if (item.admin_notes) setAdminNotes(item.admin_notes);
      if (item.review_feedback) setChangeFeedback(item.review_feedback);
      if (item.rejection_reason) setRejectionReason(item.rejection_reason);
    }
    setIsLoading(false);
  }, [itemId, itemType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived financial computations
  const price = Number(sellingPriceINR) || 0;
  const commissionRate = Number(creatorCommissionPct) || 0;
  const platformSharePct = Math.max(0, 100 - commissionRate);
  const creatorEarnings = Math.round(((price * commissionRate) / 100) * 100) / 100;
  const platformEarnings = Math.round((price - creatorEarnings) * 100) / 100;

  // Handlers
  const handleSetCommercialTerms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (price <= 0) {
      setMessage({ type: 'error', text: 'Please set a valid positive selling price in INR.' });
      return;
    }
    setIsProcessing(true);
    setMessage(null);

    const res = await creatorService.adminSetCommercialTerms(itemId, itemType, {
      sellingPriceINR: price,
      creatorCommissionPct: commissionRate,
      adminNotes: adminNotes.trim(),
    });

    setIsProcessing(false);
    if (res.error) {
      setMessage({ type: 'error', text: res.error.message });
    } else {
      setMessage({
        type: 'success',
        text: `Commercial terms successfully recorded! Status updated to "Terms Pending". The creator can now review and accept the agreement.`,
      });
      loadData();
    }
  };

  const handleRequestChanges = async () => {
    if (!changeFeedback.trim()) {
      setMessage({ type: 'error', text: 'Please enter revision feedback explaining what needs to be changed.' });
      return;
    }
    setIsProcessing(true);
    setMessage(null);

    const res = await creatorService.adminRequestChanges(itemId, itemType, changeFeedback);
    setIsProcessing(false);

    if (res.error) {
      setMessage({ type: 'error', text: res.error.message });
    } else {
      setMessage({ type: 'success', text: 'Change request feedback sent to creator. Status changed to "Changes Requested".' });
      loadData();
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setMessage({ type: 'error', text: 'Please provide a clear rejection reason for the creator.' });
      return;
    }
    setIsProcessing(true);
    setMessage(null);

    const res = await creatorService.adminRejectContent(itemId, itemType, rejectionReason);
    setIsProcessing(false);

    if (res.error) {
      setMessage({ type: 'error', text: res.error.message });
    } else {
      setMessage({ type: 'success', text: 'Content has been rejected. The creator will see this status and reason.' });
      loadData();
    }
  };

  const handleFinalPublish = async () => {
    setIsProcessing(true);
    setMessage(null);

    const res = await creatorService.adminFinalPublish(itemId, itemType);
    setIsProcessing(false);

    if (res.error) {
      setMessage({ type: 'error', text: res.error.message });
    } else {
      setMessage({
        type: 'success',
        text: 'Content successfully published! It is now live in the marketplace and purchasable by candidates and companies.',
      });
      loadData();
    }
  };

  const handleUnpublish = async () => {
    setIsProcessing(true);
    setMessage(null);

    const res = await creatorService.adminUnpublish(itemId, itemType);
    setIsProcessing(false);

    if (res.error) {
      setMessage({ type: 'error', text: res.error.message });
    } else {
      setMessage({ type: 'success', text: 'Content has been unlisted / archived from the public marketplace.' });
      loadData();
    }
  };

  if (isLoading) {
    return (
      <AdminShell title="Review Submission" currentPath="/admin/creator-content" onNavigate={onNavigate}>
        <div className="p-12 text-center text-xs text-kth-slate-500 font-medium font-sans">
          Loading submission details...
        </div>
      </AdminShell>
    );
  }

  if (!content) {
    return (
      <AdminShell title="Submission Not Found" currentPath="/admin/creator-content" onNavigate={onNavigate}>
        <div className="max-w-2xl mx-auto p-8 text-center space-y-4 font-sans">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-kth-slate-900">Submission Not Found</h2>
          <p className="text-xs text-kth-slate-600">The requested content asset could not be located in the database.</p>
          <Button variant="secondary" size="sm" onClick={() => handleNavigate('/admin/creator-content')}>
            Back to Queue
          </Button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Creator Content Review & Terms" currentPath="/admin/creator-content" onNavigate={onNavigate}>
      <div className="max-w-5xl mx-auto space-y-6 font-sans pb-16">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleNavigate('/admin/creator-content')}
            className="inline-flex items-center gap-2 text-xs font-bold text-kth-slate-600 hover:text-kth-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Content Review Queue
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-kth-slate-500">Current Status:</span>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-kth-slate-900 text-white shadow-2xs font-mono">
              {content.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <Alert
            variant={message.type === 'success' ? 'success' : 'error'}
            title={message.type === 'success' ? 'Action Completed' : 'Action Failed'}
          >
            {message.text}
          </Alert>
        )}

        {/* Top Header Card */}
        <Card className="p-6 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-kth-slate-100 text-kth-slate-700 border border-kth-slate-200">
                  {itemType === 'resource' ? <BookOpen className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                  {itemType === 'resource' ? 'Knowledge Hub Resource' : 'Marketplace Template'}
                </span>
                <span className="text-xs text-kth-slate-500 font-medium">
                  Category: <strong className="text-kth-slate-800">{content.category}</strong>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-display font-extrabold text-kth-slate-900 tracking-tight">
                {content.title}
              </h1>

              <p className="text-xs sm:text-sm text-kth-slate-600 leading-relaxed">
                {content.description}
              </p>
            </div>

            {/* Publication Gate Trigger */}
            <div className="shrink-0 flex flex-col items-end gap-2">
              {content.status === 'ready_to_publish' && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleFinalPublish}
                  isLoading={isProcessing}
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 shadow-xs cursor-pointer"
                >
                  Authorize Final Publication
                </Button>
              )}

              {content.status === 'published' && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Live on Marketplace
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleUnpublish}
                    isLoading={isProcessing}
                    className="text-xs text-rose-600 hover:bg-rose-50"
                  >
                    Unpublish / Archive
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-kth-slate-100 text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-kth-slate-400">Creator</div>
              <div className="font-semibold text-kth-slate-800 mt-0.5">
                {(content as any).author || 'Verified Creator'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-kth-slate-400">Submitted Date</div>
              <div className="font-mono text-kth-slate-700 mt-0.5">
                {content.submitted_at || content.created_at
                  ? new Date(content.submitted_at || content.created_at).toLocaleDateString()
                  : '—'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-kth-slate-400">Deliverable Asset</div>
              <div className="font-semibold text-kth-slate-800 mt-0.5 truncate">
                {content.file_name || 'Attached asset file'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-kth-slate-400">File Download / Preview</div>
              {content.file_url ? (
                <a
                  href={content.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-kth-primary-600 hover:underline font-semibold mt-0.5"
                >
                  Inspect Deliverable <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-kth-slate-400 italic">No direct URL</span>
              )}
            </div>
          </div>
        </Card>

        {/* Section: Workflow Timeline & Status Audit */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Review & Commercial Terms Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Set Commercial Terms Card */}
            <Card className="p-6 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-kth-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    ₹
                  </div>
                  <h2 className="text-sm font-bold text-kth-slate-900">
                    Set Commercial Terms & Royalties
                  </h2>
                </div>
                {content.terms_set_at && (
                  <span className="text-[11px] text-kth-slate-500 font-mono">
                    Last Assigned: {new Date(content.terms_set_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-kth-slate-600 leading-relaxed">
                Define the marketplace selling price and the Creator royalty split. Once submitted, the terms will be presented to the creator for mandatory formal acceptance before the asset can be published.
              </p>

              <form onSubmit={handleSetCommercialTerms} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-kth-slate-700 flex items-center gap-1">
                      <IndianRupee className="w-3 h-3 text-kth-slate-400" /> Selling Price (INR)
                    </label>
                    <input
                      type="number"
                      min={49}
                      step={10}
                      required
                      value={sellingPriceINR}
                      onChange={(e) => setSellingPriceINR(Number(e.target.value))}
                      className="w-full text-sm font-mono font-bold px-3.5 py-2 rounded-lg border border-kth-slate-300 focus:outline-none focus:border-kth-primary-600 bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-kth-slate-700 flex items-center gap-1">
                      <Percent className="w-3 h-3 text-kth-slate-400" /> Creator Commission (%)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={95}
                      step={1}
                      required
                      value={creatorCommissionPct}
                      onChange={(e) => setCreatorCommissionPct(Number(e.target.value))}
                      className="w-full text-sm font-mono font-bold px-3.5 py-2 rounded-lg border border-kth-slate-300 focus:outline-none focus:border-kth-primary-600 bg-white"
                    />
                  </div>
                </div>

                {/* Real-time Commercial Terms Breakdown Preview */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-kth-slate-50 to-emerald-50/30 border border-kth-slate-200 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-kth-slate-500">
                    Live Commercial Economics per Customer Sale
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 rounded-lg bg-white border border-kth-slate-200 shadow-2xs">
                      <div className="text-[10px] text-kth-slate-500 font-semibold uppercase">Customer Pays</div>
                      <div className="text-sm font-extrabold font-mono text-kth-slate-900 mt-0.5">
                        {formatINR(price)}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-emerald-200 shadow-2xs">
                      <div className="text-[10px] text-emerald-700 font-semibold uppercase">Creator ({commissionRate}%)</div>
                      <div className="text-sm font-extrabold font-mono text-emerald-700 mt-0.5">
                        {formatINR(creatorEarnings)}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-sky-200 shadow-2xs">
                      <div className="text-[10px] text-sky-700 font-semibold uppercase">Platform ({platformSharePct}%)</div>
                      <div className="text-sm font-extrabold font-mono text-sky-800 mt-0.5">
                        {formatINR(platformEarnings)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-kth-slate-700">Internal Admin Notes (Optional)</label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Pricing benchmarks, comparative notes, or commercial rationale..."
                    className="w-full text-xs px-3.5 py-2 rounded-lg border border-kth-slate-300 focus:outline-none focus:border-kth-primary-600 bg-white"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isProcessing}
                    leftIcon={<Send className="w-4 h-4" />}
                    className="bg-kth-slate-900 hover:bg-black text-white font-bold text-xs px-6 cursor-pointer"
                  >
                    Set Terms & Send to Creator for Acceptance
                  </Button>
                </div>
              </form>
            </Card>

            {/* Request Changes or Reject Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Request Changes */}
              <Card className="p-5 bg-white border border-amber-200/80 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <MessageSquare className="w-4 h-4" /> Request Content Changes
                </div>
                <p className="text-[11px] text-kth-slate-600 leading-relaxed">
                  Provide constructive editorial feedback so the creator can edit and resubmit the material.
                </p>
                <textarea
                  rows={3}
                  value={changeFeedback}
                  onChange={(e) => setChangeFeedback(e.target.value)}
                  placeholder="e.g. Please update SEBI reference on page 14 and refresh the executive summary..."
                  className="w-full text-xs p-2.5 rounded-lg border border-kth-slate-300 focus:outline-none focus:border-amber-600 bg-white"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleRequestChanges}
                  isLoading={isProcessing}
                  className="w-full text-xs font-bold border-amber-300 text-amber-900 hover:bg-amber-50 cursor-pointer"
                >
                  Send Change Request
                </Button>
              </Card>

              {/* Reject Submission */}
              <Card className="p-5 bg-white border border-rose-200/80 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <Ban className="w-4 h-4" /> Reject Submission
                </div>
                <p className="text-[11px] text-kth-slate-600 leading-relaxed">
                  Reject content that fails quality standards, plagiarism screening, or platform suitability.
                </p>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Content does not meet KnowToHire quality or originality standards..."
                  className="w-full text-xs p-2.5 rounded-lg border border-kth-slate-300 focus:outline-none focus:border-rose-600 bg-white"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleReject}
                  isLoading={isProcessing}
                  className="w-full text-xs font-bold border-rose-300 text-rose-900 hover:bg-rose-50 cursor-pointer"
                >
                  Reject Submission
                </Button>
              </Card>
            </div>
          </div>

          {/* Right Sidebar: Status & Acceptance Audit Log */}
          <div className="space-y-4">
            <Card className="p-5 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-kth-slate-500 border-b border-kth-slate-100 pb-2">
                Business Lifecycle Audit
              </h3>

              <div className="space-y-3 text-xs">
                {/* Step 1: Submission */}
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="font-bold text-kth-slate-900">Creator Submitted</div>
                    <div className="text-[11px] text-kth-slate-500">
                      {content.submitted_at || content.created_at
                        ? new Date(content.submitted_at || content.created_at).toLocaleString()
                        : 'Completed'}
                    </div>
                  </div>
                </div>

                {/* Step 2: Commercial Terms Assigned */}
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      content.terms_set_at ? 'bg-emerald-100 text-emerald-700' : 'bg-kth-slate-100 text-kth-slate-400'
                    }`}
                  >
                    {content.terms_set_at ? '✓' : '2'}
                  </div>
                  <div>
                    <div className="font-bold text-kth-slate-900">Admin Assigned Terms</div>
                    <div className="text-[11px] text-kth-slate-500">
                      {content.terms_set_at ? (
                        <span>
                          {new Date(content.terms_set_at).toLocaleString()} by {content.terms_set_by}
                        </span>
                      ) : (
                        'Awaiting Admin assignment'
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 3: Creator Acceptance */}
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      content.terms_accepted_at ? 'bg-emerald-100 text-emerald-700' : 'bg-kth-slate-100 text-kth-slate-400'
                    }`}
                  >
                    {content.terms_accepted_at ? '✓' : '3'}
                  </div>
                  <div>
                    <div className="font-bold text-kth-slate-900">Creator Acceptance</div>
                    <div className="text-[11px] text-kth-slate-500">
                      {content.terms_accepted_at ? (
                        <span className="text-emerald-700 font-semibold">
                          Accepted on {new Date(content.terms_accepted_at).toLocaleString()}
                        </span>
                      ) : (
                        'Awaiting explicit Creator acceptance'
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 4: Final Publication */}
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      content.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-kth-slate-100 text-kth-slate-400'
                    }`}
                  >
                    {content.status === 'published' ? '✓' : '4'}
                  </div>
                  <div>
                    <div className="font-bold text-kth-slate-900">Admin Publication</div>
                    <div className="text-[11px] text-kth-slate-500">
                      {content.status === 'published' ? (
                        <span className="text-emerald-700 font-semibold">
                          Published {content.published_at ? new Date(content.published_at).toLocaleDateString() : ''}
                        </span>
                      ) : content.status === 'ready_to_publish' ? (
                        <span className="text-emerald-600 font-bold">Ready for publication</span>
                      ) : (
                        'Locked until terms accepted'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Rejection / Feedback Note if present */}
            {content.rejection_reason && (
              <Card className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-rose-800">Recorded Rejection Reason:</div>
                <div className="text-rose-700">{content.rejection_reason}</div>
              </Card>
            )}

            {content.review_feedback && (
              <Card className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-amber-800">Change Request Feedback:</div>
                <div className="text-amber-700">{content.review_feedback}</div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
};
