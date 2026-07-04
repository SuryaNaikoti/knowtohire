import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { templateService } from '../../lib/services/templateService';
import type { Template } from '../../lib/services/templateService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Check, Download, Lock, Sparkles, Star } from 'lucide-react';

export const TemplateDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const temp = await templateService.getTemplate(slug);
        if (temp) {
          setTemplate(temp);
          if (user) {
            const purchasedList = await templateService.getPurchasedTemplates(user.id);
            setPurchased(purchasedList.some(t => t.id === temp.id));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [slug, user]);

  if (loading) return <Loading label="Loading details..." />;

  if (!template) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Template Not Found</h2>
        <Link to="/marketplace">
          <Button variant="outline">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const features = [
    'Fully editable Microsoft Word format (.docx)',
    '100% compliant with standard parsing algorithms (ATS)',
    'Tailored margins, line heights, and padding details',
    'Includes sample ESG and sustainability role summaries',
    'Accompanying guidelines and resume checklists'
  ];

  const handlePurchaseClick = () => {
    if (!user) {
      navigate('/login', { state: { from: `/marketplace/template/${slug}` } });
      return;
    }
    navigate(`/marketplace/checkout?itemId=${template.id}&itemType=template`);
  };

  return (
    <div className="bg-slate-50/50 min-h-screen py-16 animate-fade-in-up">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Back Link */}
        <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors text-left w-full">
          <ArrowLeft className="w-4 h-4" /> Back to Template Catalog
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-left">
          {/* Main Info */}
          <div className="md:col-span-3 space-y-6">
            <div className="bg-white border border-solid border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <img
                src={template.preview_image_url || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800'}
                alt={template.title}
                className="w-full h-80 object-cover border-b border-solid border-slate-100"
              />
              <div className="p-6 sm:p-8 space-y-4">
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-slate-900 leading-tight">
                    {template.title}
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-primary text-[10px] font-black px-2 py-0.5 rounded-full border border-solid border-blue-100">
                    <Star className="w-3 h-3 fill-primary" /> Premium Asset
                  </span>
                </div>

                {template.description && (
                  <p className="text-xs sm:text-sm text-slate-650 font-normal leading-relaxed whitespace-pre-wrap">
                    {template.description}
                  </p>
                )}
              </div>
            </div>

            {/* Checklist */}
            <Card className="bg-white border border-solid border-slate-200 p-6 sm:p-8 rounded-3xl">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> What's Included
              </h2>
              <ul className="space-y-3">
                {features.map((feat, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs text-slate-650 font-medium leading-relaxed">
                    <span className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Pricing Panel */}
          <div className="md:col-span-2">
            <Card className="bg-white border border-solid border-slate-200 p-6 sm:p-8 rounded-3xl sticky top-24 shadow-sm space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Pricing</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">${(template.price_cents / 100).toFixed(2)}</span>
                  <span className="text-xs text-slate-400 font-bold">One-time payment</span>
                </div>
              </div>

              <div className="border-t border-solid border-slate-100 pt-6 space-y-4">
                {purchased ? (
                  <div className="space-y-3">
                    <div className="bg-emerald-50 border border-solid border-emerald-100 rounded-xl px-4 py-3 text-center">
                      <p className="text-xs font-bold text-emerald-700">You already own this template!</p>
                    </div>
                    <a href={template.download_url} download className="w-full">
                      <Button className="w-full font-bold text-xs flex items-center justify-center gap-1.5">
                        <Download className="w-4 h-4" /> Download DOCX file
                      </Button>
                    </a>
                  </div>
                ) : (
                  <Button onClick={handlePurchaseClick} className="w-full font-bold text-xs flex items-center justify-center gap-1.5">
                    <Lock className="w-4 h-4" /> Unlock Template Now
                  </Button>
                )}
              </div>

              <div className="bg-slate-50 border border-solid border-slate-100 rounded-2xl p-4 space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Refund Guarantee</p>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                  We guarantee 100% parsing satisfaction. Reach out to developer support if your formatting is flagged.
                </p>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};
export default TemplateDetails;
