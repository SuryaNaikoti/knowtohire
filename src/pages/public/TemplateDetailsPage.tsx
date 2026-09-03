import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { templateService, MarketplaceTemplate } from '@/services/templateService';
import { paymentService } from '@/services/paymentService';
import { FileText, Download, CheckCircle2, ArrowLeft, Loader2, AlertCircle, ShoppingCart, CreditCard, Shield, IndianRupee } from 'lucide-react';

export interface TemplateDetailsPageProps {
  templateId?: string;
}

type CheckoutStep = 'idle' | 'cart' | 'processing' | 'success';

export const TemplateDetailsPage: React.FC<TemplateDetailsPageProps> = ({ templateId }) => {
  const [template, setTemplate] = useState<MarketplaceTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);

  const activeId = templateId || window.location.pathname.replace('/templates/', '');

  useEffect(() => {
    let isMounted = true;
    const fetchTemplate = async () => {
      setIsLoading(true);
      setError(null);
      const res = await templateService.getTemplateByIdOrSlug(activeId, { requirePublished: true });
      if (!isMounted) return;
      if (res.error) {
        setError(res.error.message);
      } else {
        setTemplate(res.data);
        // Check if already purchased in this session
        if (res.data && paymentService.isPurchased(res.data.id)) {
          setIsPurchased(true);
        }
      }
      setIsLoading(false);
    };

    fetchTemplate();
    return () => {
      isMounted = false;
    };
  }, [activeId]);

  // Free template: direct download
  const handleFreeDownload = async () => {
    if (!template) return;
    setIsProcessing(true);
    const res = await templateService.trackDownload(template.id);
    setIsProcessing(false);
    setCheckoutStep('success');
    const targetUrl = res.data?.downloadUrl || template.file_url || template.download_url;
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  };

  // Paid template: open cart modal
  const handlePurchaseClick = () => {
    if (!template) return;
    if (isPurchased) {
      // Already purchased — go straight to download
      handleDirectDownload();
      return;
    }
    setCheckoutStep('cart');
  };

  // Process simulated payment
  const handleConfirmPayment = async () => {
    if (!template) return;
    setCheckoutStep('processing');
    setIsProcessing(true);

    const res = await paymentService.initiateCheckout({
      itemType: 'template',
      itemId: template.id,
      itemName: template.title,
      amountINR: template.price_inr,
      onSuccess: async (payId) => {
        setTransactionId(payId);
        paymentService.recordPurchase(template.id, payId);
        setIsPurchased(true);
        await templateService.trackDownload(template.id);
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

  // Direct download for already-purchased templates
  const handleDirectDownload = async () => {
    if (!template) return;
    setIsProcessing(true);
    const res = await templateService.trackDownload(template.id);
    setIsProcessing(false);
    setCheckoutStep('success');
    const targetUrl = res.data?.downloadUrl || template.file_url || template.download_url;
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
        <p className="text-xs text-kth-slate-500 font-medium">Loading template specifications...</p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="py-20 bg-kth-slate-50 min-h-screen">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl border border-kth-slate-200 text-center shadow-xs">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="font-display text-lg font-bold text-kth-slate-900 mb-1">Template Not Found</h2>
          <p className="text-xs text-kth-slate-500 mb-6">{error || 'The requested template could not be found.'}</p>
          <Button variant="primary" onClick={() => (window.location.href = '/templates')}>
            Return to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-kth-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => (window.location.href = '/templates')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-kth-slate-600 hover:text-kth-primary-600 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Template Marketplace
        </button>

        <Card className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
            <div className="w-full md:w-64 h-72 bg-kth-slate-100 border border-kth-slate-200 rounded-lg flex flex-col items-center justify-center p-6 text-kth-slate-400 shrink-0 shadow-xs">
              <FileText className="w-16 h-16 opacity-30 mb-2 text-kth-primary-600" />
              <Badge variant="mono">{template.formats.join(' / ')}</Badge>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="indigo">{template.category}</Badge>
                <Badge variant="slate">{template.downloads_count.toLocaleString()} downloads</Badge>
              </div>

              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-kth-slate-900 mb-3 leading-tight">
                {template.title}
              </h1>

              <p className="text-sm text-kth-slate-700 leading-relaxed mb-6">
                {template.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 bg-kth-slate-50 p-4 rounded-lg border border-kth-slate-200 mb-6">
                <div>
                  <span className="text-xs font-bold text-kth-slate-500 uppercase tracking-wider">TEMPLATE PRICE</span>
                  <div className="font-mono text-xl font-bold text-kth-primary-600">
                    {template.is_free ? 'FREE ACCESS' : `₹${template.price_inr}`}
                  </div>
                </div>
                {template.is_free ? (
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Download className="w-4 h-4" />}
                    isLoading={isProcessing}
                    onClick={handleFreeDownload}
                  >
                    Download Template
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
            </div>
          </div>

          <div className="border-t border-kth-slate-200 pt-6">
            <h3 className="font-display font-bold text-lg text-kth-slate-900 mb-4">What's Included in This Package</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none pl-0">
              {[
                'Fully editable Microsoft Word (.DOCX) file',
                'Ready-to-print PDF reference format',
                'ATS-friendly header & metadata formatting',
                'Clause annotations & compliance notes',
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2.5 text-xs text-kth-slate-700 bg-kth-slate-50 p-3 rounded-md border border-kth-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
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
          {/* Order Summary */}
          <div className="bg-kth-slate-50 rounded-lg border border-kth-slate-200 p-4 mb-5">
            <h4 className="text-xs font-bold text-kth-slate-500 uppercase tracking-wider mb-3">Order Summary</h4>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-md bg-kth-primary-100 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-kth-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-kth-slate-900 truncate">{template.title}</p>
                <p className="text-xs text-kth-slate-500">{template.category} • {template.formats.join(', ')}</p>
              </div>
              <div className="font-mono text-base font-bold text-kth-slate-900 shrink-0">₹{template.price_inr}</div>
            </div>
            <div className="border-t border-kth-slate-200 pt-3 flex items-center justify-between">
              <span className="text-xs font-bold text-kth-slate-700 uppercase">Total Amount</span>
              <span className="font-mono text-lg font-extrabold text-kth-primary-600">₹{template.price_inr}</span>
            </div>
          </div>

          {/* Trust badges */}
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
              Pay ₹{template.price_inr}
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
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-[bounceIn_0.4s_ease-out]">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-lg text-kth-slate-900 mb-1">
            {template.is_free ? 'Download Ready!' : 'Payment Successful!'}
          </h4>
          <p className="text-xs text-kth-slate-500 mb-2">
            Your files for <strong>{template.title}</strong> are ready.
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
                const targetUrl = template.file_url || template.download_url;
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
