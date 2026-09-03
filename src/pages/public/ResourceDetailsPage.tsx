import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { knowledgeService, KnowledgeResource } from '@/services/knowledgeService';
import { paymentService } from '@/services/paymentService';
import { Star, Download, FileText, CheckCircle2, ArrowLeft, Loader2, AlertCircle, ShoppingCart, CreditCard, Shield, IndianRupee } from 'lucide-react';

export interface ResourceDetailsPageProps {
  resourceId?: string;
}

type CheckoutStep = 'idle' | 'cart' | 'processing' | 'success';

export const ResourceDetailsPage: React.FC<ResourceDetailsPageProps> = ({ resourceId }) => {
  const [resource, setResource] = useState<KnowledgeResource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);

  // Extract ID from pathname if not provided directly
  const activeId = resourceId || window.location.pathname.replace('/knowledge/', '');

  useEffect(() => {
    let isMounted = true;
    const fetchResource = async () => {
      setIsLoading(true);
      setError(null);
      const res = await knowledgeService.getResourceByIdOrSlug(activeId);
      if (!isMounted) return;
      if (res.error) {
        setError(res.error.message);
      } else {
        setResource(res.data);
        if (res.data && paymentService.isPurchased(res.data.id)) {
          setIsPurchased(true);
        }
      }
      setIsLoading(false);
    };

    fetchResource();
    return () => {
      isMounted = false;
    };
  }, [activeId]);

  // Free resource: direct download
  const handleFreeDownload = async () => {
    if (!resource) return;
    setIsProcessing(true);
    const res = await knowledgeService.trackDownload(resource.id);
    setIsProcessing(false);
    setCheckoutStep('success');
    const targetUrl = res.data?.downloadUrl || resource.file_url;
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  };

  // Paid resource: open cart modal
  const handlePurchaseClick = () => {
    if (!resource) return;
    if (isPurchased) {
      handleDirectDownload();
      return;
    }
    setCheckoutStep('cart');
  };

  // Process simulated payment
  const handleConfirmPayment = async () => {
    if (!resource) return;
    setCheckoutStep('processing');
    setIsProcessing(true);

    const res = await paymentService.initiateCheckout({
      itemType: 'resource',
      itemId: resource.id,
      itemName: resource.title,
      amountINR: resource.price_inr ?? 0,
      onSuccess: async (payId) => {
        setTransactionId(payId);
        paymentService.recordPurchase(resource.id, payId);
        setIsPurchased(true);
        await knowledgeService.trackDownload(resource.id);
        setIsProcessing(false);
        setCheckoutStep('success');
      },
      onCancel: () => {
        setIsProcessing(false);
        setCheckoutStep('idle');
      },
    });

    if (res.error) {
      setIsProcessing(false);
      setCheckoutStep('idle');
    }
  };

  // Direct download for already-purchased resources
  const handleDirectDownload = async () => {
    if (!resource) return;
    setIsProcessing(true);
    const res = await knowledgeService.trackDownload(resource.id);
    setIsProcessing(false);
    setCheckoutStep('success');
    const targetUrl = res.data?.downloadUrl || resource.file_url;
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  };

  const handleCloseModal = () => {
    setCheckoutStep('idle');
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center bg-kth-slate-50 min-h-screen">
        <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
        <p className="text-xs text-kth-slate-500 font-medium">Loading resource details...</p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="py-20 bg-kth-slate-50 min-h-screen">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl border border-kth-slate-200 text-center shadow-xs">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="font-display text-lg font-bold text-kth-slate-900 mb-1">Resource Not Found</h2>
          <p className="text-xs text-kth-slate-500 mb-6">{error || 'The requested resource could not be found.'}</p>
          <Button variant="primary" onClick={() => (window.location.href = '/knowledge')}>
            Return to Knowledge Hub
          </Button>
        </div>
      </div>
    );
  }

  const isFree = resource.is_free;

  return (
    <div className="py-12 bg-kth-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => (window.location.href = '/knowledge')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-kth-slate-600 hover:text-kth-primary-600 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Knowledge Hub
        </button>

        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-56 h-72 bg-gradient-to-br from-kth-slate-800 to-kth-primary-900 rounded-lg flex flex-col justify-between p-6 text-white shrink-0 shadow-md">
              <Badge variant="cyan">{resource.category}</Badge>
              <div>
                <FileText className="w-10 h-10 text-white/40 mb-2" />
                <h4 className="font-display font-bold text-sm leading-tight text-white">{resource.title}</h4>
              </div>
              <div className="text-[11px] text-kth-slate-300 font-mono">
                {resource.format} • {resource.pageCount} Pages • {resource.file_size || '2.4 MB'}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="cyan">{resource.category}</Badge>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-4 h-4 fill-current" /> {resource.rating} Rating
                </div>
              </div>

              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-kth-slate-900 mb-3 leading-tight">
                {resource.title}
              </h1>

              <p className="text-xs text-kth-slate-500 mb-4">
                Authored by <strong className="text-kth-slate-800">{resource.author}</strong> • Downloaded{' '}
                <strong className="text-kth-slate-800">{resource.downloads_count.toLocaleString()}</strong> times
              </p>

              <p className="text-sm text-kth-slate-700 leading-relaxed mb-6">
                {resource.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 border-t border-b border-kth-slate-200 py-4 mb-6">
                <div>
                  <span className="text-xs font-bold text-kth-slate-500 uppercase tracking-wider">ACCESS PRICE</span>
                  <div className="font-mono text-xl font-bold text-kth-primary-600">
                    {isFree ? 'FREE ACCESS' : `₹${resource.price_inr}`}
                  </div>
                </div>
                {isFree ? (
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Download className="w-4 h-4" />}
                    isLoading={isProcessing}
                    onClick={handleFreeDownload}
                  >
                    Download Resource
                  </Button>
                ) : isPurchased ? (
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Download className="w-4 h-4" />}
                    isLoading={isProcessing}
                    onClick={handleDirectDownload}
                  >
                    Download (Purchased)
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<ShoppingCart className="w-4 h-4" />}
                    isLoading={isProcessing}
                    onClick={handlePurchaseClick}
                  >
                    Purchase & Download
                  </Button>
                )}
              </div>

              <h4 className="font-bold text-xs text-kth-slate-500 uppercase tracking-wider mb-2">Key Topics Covered</h4>
              <div className="flex gap-2 flex-wrap">
                {(resource.tags || ['EIA', 'ESG Compliance', 'CPCB Regulations', 'Environmental Audit']).map((t, idx) => (
                  <Badge key={idx} variant="slate" className="normal-case text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ========== CHECKOUT MODAL: Cart Step ========== */}
      <Dialog
        isOpen={checkoutStep === 'cart'}
        onClose={handleCloseModal}
        title="Checkout"
        maxWidth="md"
      >
        <div className="py-2">
          <div className="bg-kth-slate-50 rounded-lg border border-kth-slate-200 p-4 mb-5">
            <h4 className="text-xs font-bold text-kth-slate-500 uppercase tracking-wider mb-3">Order Summary</h4>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-md bg-kth-primary-100 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-kth-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-kth-slate-900 truncate">{resource.title}</p>
                <p className="text-xs text-kth-slate-500">{resource.category} • {resource.format} • {resource.pageCount} Pages</p>
              </div>
              <div className="font-mono text-base font-bold text-kth-slate-900 shrink-0">₹{resource.price_inr}</div>
            </div>
            <div className="border-t border-kth-slate-200 pt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-kth-slate-700 uppercase">Total Amount</span>
              <span className="font-mono text-lg font-extrabold text-kth-primary-600">₹{resource.price_inr}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-kth-slate-500 mb-5">
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-kth-primary-600" />
              <span>INR Payment</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5 text-kth-primary-600" />
              <span>Instant Download</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              leftIcon={<CreditCard className="w-4 h-4" />}
              onClick={handleConfirmPayment}
            >
              Pay ₹{resource.price_inr}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ========== CHECKOUT MODAL: Processing Step ========== */}
      <Dialog
        isOpen={checkoutStep === 'processing'}
        onClose={() => {}}
        title="Processing Payment"
        maxWidth="sm"
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-kth-primary-50 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin" />
          </div>
          <h4 className="font-bold text-base text-kth-slate-900 mb-2">Processing your payment...</h4>
          <p className="text-xs text-kth-slate-500">
            Please wait while we securely process your transaction.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-kth-slate-400">
            <Shield className="w-3 h-3" />
            <span>256-bit SSL Encrypted • Powered by KnowToHire</span>
          </div>
        </div>
      </Dialog>

      {/* ========== CHECKOUT MODAL: Success Step ========== */}
      <Dialog
        isOpen={checkoutStep === 'success'}
        onClose={handleCloseModal}
        title="Payment Successful"
        maxWidth="sm"
      >
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-lg text-kth-slate-900 mb-1">
            {isFree ? 'Download Ready!' : 'Payment Successful!'}
          </h4>
          <p className="text-xs text-kth-slate-500 mb-2">
            Your resource <strong>{resource.title}</strong> is ready for download.
          </p>
          {transactionId && (
            <p className="text-[10px] font-mono text-kth-slate-400 mb-4">
              Transaction ID: {transactionId}
            </p>
          )}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-5">
            <p className="text-xs text-emerald-700">
              <strong>✓</strong> Your download has started automatically. If it didn't, click the button below.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={handleCloseModal}>
              Close
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => {
                const targetUrl = resource.file_url;
                if (targetUrl) {
                  window.open(targetUrl, '_blank');
                }
                handleCloseModal();
              }}
            >
              Download Again
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
