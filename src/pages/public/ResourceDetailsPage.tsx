import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { knowledgeService, KnowledgeResource } from '@/services/knowledgeService';
import { Star, Download, FileText, CheckCircle2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export interface ResourceDetailsPageProps {
  resourceId?: string;
}

export const ResourceDetailsPage: React.FC<ResourceDetailsPageProps> = ({ resourceId }) => {
  const [resource, setResource] = useState<KnowledgeResource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
      }
      setIsLoading(false);
    };

    fetchResource();
    return () => {
      isMounted = false;
    };
  }, [activeId]);

  const handleDownload = async () => {
    if (!resource) return;
    setIsDownloading(true);
    const res = await knowledgeService.trackDownload(resource.id);
    setIsDownloading(false);
    setIsDownloadModalOpen(true);
    const targetUrl = res.data?.downloadUrl || resource.file_url;
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
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

              <div className="flex items-center gap-4 border-t border-b border-kth-slate-200 py-4 mb-6">
                <div>
                  <span className="text-xs font-bold text-kth-slate-500 uppercase tracking-wider">ACCESS PRICE</span>
                  <div className="font-mono text-xl font-bold text-kth-primary-600">
                    {resource.is_free ? 'FREE ACCESS' : `₹${resource.price_inr}`}
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Download className="w-4 h-4" />}
                  isLoading={isDownloading}
                  onClick={handleDownload}
                >
                  Download Resource
                </Button>
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

      <Dialog
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        title="Download Confirmed"
        description={resource.title}
      >
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-base text-kth-slate-900 mb-1">Download Started Successfully</h4>
          <p className="text-xs text-kth-slate-500 mb-4">
            Your download for <strong>{resource.title}</strong> has been logged to your account.
          </p>
          <Button variant="primary" onClick={() => setIsDownloadModalOpen(false)}>
            Close Window
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
