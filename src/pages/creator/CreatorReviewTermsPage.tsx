import React, { useState, useEffect, useCallback } from 'react';
import { CreatorShell } from '@/components/creator/CreatorShell';
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
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileText,
  BookOpen,
  IndianRupee,
  Info,
} from 'lucide-react';

export interface CreatorReviewTermsPageProps {
  itemId: string;
  itemType: ContentItemType;
  onNavigate?: (path: string) => void;
}

export const CreatorReviewTermsPage: React.FC<CreatorReviewTermsPageProps> = ({
  itemId,
  itemType,
  onNavigate,
}) => {
  const [content, setContent] = useState<KnowledgeResource | MarketplaceTemplate | null>(null);
  const [agreed, setAgreed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showDeclineFeedback, setShowDeclineFeedback] = useState<boolean>(false);
  const [declineFeedback, setDeclineFeedback] = useState<string>('');
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
    }
    setIsLoading(false);
  }, [itemId, itemType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAcceptTerms = async () => {
    if (!agreed) {
      setMessage({
        type: 'error',
        text: 'Please review and select the checkbox acknowledging that you agree to the commercial terms.',
      });
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    const res = await creatorService.creatorAcceptTerms(itemId, itemType);
    setIsProcessing(false);

    if (res.error) {
      setMessage({ type: 'error', text: res.error.message });
    } else {
      setMessage({
        type: 'success',
        text: 'Commercial terms accepted! Your content status is now "Ready to Publish". KnowToHire administration has been notified for final marketplace release.',
      });
      setTimeout(() => {
        handleNavigate('/creator');
      }, 1500);
    }
  };

  const handleDeclineTerms = async () => {
    setIsProcessing(true);
    setMessage(null);

    const res = await creatorService.creatorDeclineTerms(itemId, itemType, declineFeedback);
    setIsProcessing(false);

    if (res.error) {
      setMessage({ type: 'error', text: res.error.message });
    } else {
      setMessage({
        type: 'error',
        text: 'You declined the proposed commercial terms. The content status has moved to "Changes Requested" and will not be published until new terms are agreed.',
      });
      setTimeout(() => {
        handleNavigate('/creator');
      }, 1500);
    }
  };

  if (isLoading) {
    return (
      <CreatorShell title="Commercial Terms Review" currentPath="/creator" onNavigate={onNavigate}>
        <div className="p-12 text-center text-xs text-kth-slate-500 font-medium font-sans">
          Loading commercial agreement details...
        </div>
      </CreatorShell>
    );
  }

  if (!content) {
    return (
      <CreatorShell title="Content Not Found" currentPath="/creator" onNavigate={onNavigate}>
        <div className="max-w-2xl mx-auto p-8 text-center space-y-4 font-sans">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-kth-slate-900">Content Not Found</h2>
          <p className="text-xs text-kth-slate-600">The requested content asset could not be located.</p>
          <Button variant="secondary" size="sm" onClick={() => handleNavigate('/creator')}>
            Return to Creator Studio
          </Button>
        </div>
      </CreatorShell>
    );
  }

  const sellingPrice = content.selling_price_inr ?? content.price_inr ?? 0;
  const commissionRate = content.creator_commission_pct ?? 70;
  const platformShare = content.platform_share_pct ?? Math.max(0, 100 - commissionRate);
  const earningsPerSale =
    content.creator_earnings_per_sale_inr ??
    Math.round(((sellingPrice * commissionRate) / 100) * 100) / 100;
  const platformPerSale = Math.round((sellingPrice - earningsPerSale) * 100) / 100;

  return (
    <CreatorShell title="Review & Accept Commercial Terms" currentPath="/creator" onNavigate={onNavigate}>
      <div className="max-w-4xl mx-auto space-y-6 font-sans pb-16">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleNavigate('/creator')}
            className="inline-flex items-center gap-2 text-xs font-bold text-kth-slate-600 hover:text-kth-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Creator Studio
          </button>

          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-mono">
            Action Required
          </span>
        </div>

        {/* Message Banner */}
        {message && (
          <Alert
            variant={message.type === 'success' ? 'success' : 'error'}
            title={message.type === 'success' ? 'Terms Accepted' : 'Notification'}
          >
            {message.text}
          </Alert>
        )}

        {/* Editorial Announcement Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-kth-slate-900 via-kth-slate-800 to-[#0c182c] border border-kth-slate-800 p-6 sm:p-8 text-white shadow-md">
          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> Content Quality Approved
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-extrabold text-white tracking-tight">
              Commercial Terms Proposed by KnowToHire
            </h1>
            <p className="text-xs sm:text-sm text-kth-slate-300 leading-relaxed">
              Your submission has passed quality moderation and editorial review. Below is the proposed retail pricing and guaranteed royalty split for your content asset.
            </p>
          </div>
        </div>

        {/* Content Details Card */}
        <Card className="p-6 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-kth-slate-500">
                {itemType === 'resource' ? <BookOpen className="w-3 h-3 text-sky-600" /> : <FileText className="w-3 h-3 text-purple-600" />}
                {itemType === 'resource' ? 'Knowledge Resource' : 'Marketplace Template'} • {content.category}
              </span>
              <h2 className="text-lg font-bold text-kth-slate-900">{content.title}</h2>
              <p className="text-xs text-kth-slate-600 leading-relaxed">{content.description}</p>
            </div>
          </div>
        </Card>

        {/* Commercial Economics Breakdown */}
        <Card className="p-6 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-kth-slate-100 pb-3">
            <h3 className="text-sm font-bold text-kth-slate-900 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-600" /> Commercial Terms Breakdown
            </h3>
            <span className="text-[11px] text-kth-slate-500 font-mono">
              Version: {content.terms_version || 'Initial Offer'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200 text-center">
              <div className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">
                Marketplace Selling Price
              </div>
              <div className="text-2xl font-extrabold font-mono text-kth-slate-900 mt-1">
                {formatINR(sellingPrice)}
              </div>
              <div className="text-[11px] text-kth-slate-500 mt-1">
                Retail price paid by customer
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-center">
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Your Creator Royalty ({commissionRate}%)
              </div>
              <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">
                {formatINR(earningsPerSale)}
              </div>
              <div className="text-[11px] text-emerald-800 font-medium mt-1">
                Credited to your balance per purchase
              </div>
            </div>

            <div className="p-4 rounded-xl bg-sky-50/80 border border-sky-200 text-center">
              <div className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">
                Platform Share ({platformShare}%)
              </div>
              <div className="text-2xl font-extrabold font-mono text-sky-800 mt-1">
                {formatINR(platformPerSale)}
              </div>
              <div className="text-[11px] text-sky-800 font-medium mt-1">
                KnowToHire hosting & payment processing
              </div>
            </div>
          </div>

          {/* Legal / Policy Safeguards */}
          <div className="p-4 bg-kth-slate-50 border border-kth-slate-200 rounded-xl space-y-2 text-xs text-kth-slate-600">
            <div className="flex items-center gap-2 font-bold text-kth-slate-800 text-xs">
              <Info className="w-4 h-4 text-kth-primary-600 shrink-0" />
              Creator Marketplace Standards & Protection Guarantee
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed">
              <li>
                <strong>Historical Financial Protection:</strong> Past sales will always remain recorded at the exact commercial terms in effect when purchased. Subsequent pricing adjustments will never retroactively adjust past royalties.
              </li>
              <li>
                <strong>Guaranteed Settlement:</strong> Creator balances become eligible for bank transfer withdrawal as soon as available royalties meet the ₹1,500 threshold.
              </li>
              <li>
                <strong>Controlled Publication:</strong> Accepting these terms moves your asset to "Ready to Publish" for final authorization by KnowToHire Administration.
              </li>
            </ul>
          </div>

          {/* Acceptance Agreement Form */}
          <div className="pt-4 border-t border-kth-slate-100 space-y-5">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
              <input
                type="checkbox"
                id="terms-agreed"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded text-kth-primary-600 focus:ring-kth-primary-500 border-kth-slate-300 mt-0.5 cursor-pointer"
              />
              <label htmlFor="terms-agreed" className="text-xs text-kth-slate-800 font-semibold cursor-pointer select-none">
                I have reviewed and agree to the commercial terms shown above for "{content.title}". I acknowledge that KnowToHire will collect ₹{sellingPrice.toLocaleString()} and credit ₹{earningsPerSale.toLocaleString()} (70%) per customer purchase to my creator account.
              </label>
            </div>

            {/* Optional Decline Reason Field */}
            {showDeclineFeedback ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                <label className="text-xs font-bold text-rose-900 block">
                  Provide Reason for Declining Proposed Terms (Visible to Admin):
                </label>
                <textarea
                  rows={3}
                  value={declineFeedback}
                  onChange={(e) => setDeclineFeedback(e.target.value)}
                  placeholder="e.g. Based on market comps, our production costs require an ₹1,800 retail price or 75% creator royalty..."
                  className="w-full text-xs p-3 rounded-lg border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleDeclineTerms}
                    isLoading={isProcessing}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                  >
                    Confirm & Send to Admin
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowDeclineFeedback(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {!showDeclineFeedback && (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setShowDeclineFeedback(true)}
                  isLoading={isProcessing}
                  className="w-full sm:w-auto text-xs font-semibold text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
                >
                  Decline Terms
                </Button>
              )}

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => handleNavigate('/creator')}
                  className="w-full sm:w-auto text-xs font-semibold cursor-pointer"
                >
                  Decide Later
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={!agreed || isProcessing}
                  isLoading={isProcessing}
                  onClick={handleAcceptTerms}
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 cursor-pointer"
                >
                  Accept Commercial Terms
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </CreatorShell>
  );
};
