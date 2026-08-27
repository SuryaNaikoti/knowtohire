import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { templateService, MarketplaceTemplate } from '@/services/templateService';
import { paymentService } from '@/services/paymentService';
import { FileText, Download, CheckCircle2, ArrowLeft, Loader2, AlertCircle, ShoppingCart } from 'lucide-react';

export interface TemplateDetailsPageProps {
  templateId?: string;
}

export const TemplateDetailsPage: React.FC<TemplateDetailsPageProps> = ({ templateId }) => {
  const [template, setTemplate] = useState<MarketplaceTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
      }
      setIsLoading(false);
    };

    fetchTemplate();
    return () => {
      isMounted = false;
    };
  }, [activeId]);

  const handleGetTemplate = async () => {
    if (!template) return;
    setIsProcessing(true);

    if (template.is_free) {
      const res = await templateService.trackDownload(template.id);
      setIsProcessing(false);
      setIsModalOpen(true);
      const targetUrl = res.data?.downloadUrl || template.file_url || template.download_url;
      if (targetUrl) {
        window.open(targetUrl, '_blank');
      }
    } else {
      // Paid template purchase
      const res = await paymentService.initiateCheckout({
        itemType: 'template',
        itemId: template.id,
        itemName: template.title,
        amountINR: template.price_inr,
        onSuccess: async () => {
          const dlRes = await templateService.trackDownload(template.id);
          setIsProcessing(false);
          setIsModalOpen(true);
          const targetUrl = dlRes.data?.downloadUrl || template.file_url || template.download_url;
          if (targetUrl) {
            window.open(targetUrl, '_blank');
          }
        },
        onCancel: () => {
          setIsProcessing(false);
        },
      });

      if (res.error) {
        setIsProcessing(false);
      }
    }
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

              <div className="flex items-center gap-4 bg-kth-slate-50 p-4 rounded-lg border border-kth-slate-200 mb-6">
                <div>
                  <span className="text-xs font-bold text-kth-slate-500 uppercase tracking-wider">TEMPLATE PRICE</span>
                  <div className="font-mono text-xl font-bold text-kth-primary-600">
                    {template.is_free ? 'FREE ACCESS' : `₹${template.price_inr}`}
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={template.is_free ? <Download className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  isLoading={isProcessing}
                  onClick={handleGetTemplate}
                >
                  {template.is_free ? 'Download Template' : 'Purchase & Download'}
                </Button>
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

      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Template Ready"
        description={template.title}
      >
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-base text-kth-slate-900 mb-1">Package Download Confirmed</h4>
          <p className="text-xs text-kth-slate-500 mb-4">
            Your files for <strong>{template.title}</strong> are ready and have been saved to your downloads.
          </p>
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>
            Close Window
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
