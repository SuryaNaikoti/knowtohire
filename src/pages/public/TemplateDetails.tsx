import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockTemplates } from '../../constants/mockData';
import type { Template } from '../../constants/mockData';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { ArrowLeft, Star, ShieldCheck, Download, Award, Heart, Share2, ShoppingCart } from 'lucide-react';

export const TemplateDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const template = mockTemplates.find((t: Template) => t.id === id);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  if (!template) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Template Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The specified marketplace template does not exist or has been removed.</p>
        <Link to="/templates">
          <Button variant="primary">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const handlePurchase = () => {
    setPurchaseSuccess(true);
    setTimeout(() => {
      setPurchaseSuccess(false);
    }, 4000);
  };

  return (
    <div className="bg-slate-50/30 flex-1 w-full min-h-screen py-12 animate-fade-in-up">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-8">
        
        {/* Navigation Breadcrumbs & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link to="/templates" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white border-slate-200 text-xs py-1.5 px-3 rounded-lg h-9 hover:bg-slate-50" leftIcon={<Share2 className="w-3.5 h-3.5" />}>
              Share
            </Button>
            <Button variant="outline" size="sm" className="bg-white border-slate-200 text-xs py-1.5 px-3 rounded-lg h-9 hover:bg-slate-50" leftIcon={<Heart className="w-3.5 h-3.5" />}>
              Favorite
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Main Details Panel (Left) — 8/12 */}
          <main className="flex-1 bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm text-left">
            {/* Banner header block */}
            <div className="pb-6 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2.5 mb-3">
                <img
                  src={template.creatorAvatar}
                  alt={template.creator}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold leading-tight">{template.creator}</span>
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-emerald-600 leading-none">Verified Author</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 font-heading tracking-tight leading-snug">
                {template.title}
              </h1>
              <p className="text-sm text-slate-500 font-normal mt-2 leading-relaxed">
                {template.description}
              </p>
            </div>

            {/* Mockup Preview Visual */}
            <div className="bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden aspect-[16/9] mb-8 shadow-sm">
              <img
                src={template.coverUrl}
                alt={`${template.title} full preview`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Key Features list */}
            <section className="mb-8 space-y-4">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-heading flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" /> Key Features Included
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {template.features.map((feat, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Customer Reviews Section */}
            <section className="space-y-6 pt-6 border-t border-slate-100">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-heading flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500" /> Customer Reviews
              </h2>
              <div className="space-y-4">
                {template.reviews.map((rev, index) => (
                  <div key={index} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                      <span className="text-xs font-bold text-slate-800">{rev.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-700">{rev.rating}.0 Rating</span>
                    </div>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>

          {/* Checkout Sidebar (Right) — 4/12 */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            <Card className="bg-white border border-slate-200 shadow-sm relative overflow-hidden rounded-[24px] text-left">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardContent className="p-8 space-y-6">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">One-time Purchase Price</span>
                  <div className="text-2xl font-black text-slate-900 font-heading leading-tight mt-1">
                    ₹{template.price}
                  </div>
                </div>

                <div className="space-y-3.5 pt-4 border-t border-slate-100 text-xs text-slate-500 font-semibold">
                  <div className="flex items-center justify-between">
                    <span>Formats Supported</span>
                    <span className="font-bold text-slate-850 uppercase flex gap-1">
                      {template.formats.map((form) => (
                        <span key={form} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[8px] font-extrabold select-none">
                          {form}
                        </span>
                      ))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Downloads Volume</span>
                    <span className="font-bold text-slate-800">{template.downloadsCount} Sold</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>License Type</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Personal</span>
                  </div>
                </div>

                <Button
                  onClick={handlePurchase}
                  variant={purchaseSuccess ? 'secondary' : 'primary'}
                  className={`w-full py-3 h-11 text-white shadow-md text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 ${
                    purchaseSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                  }`}
                  leftIcon={purchaseSuccess ? <CheckCircle2 className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                >
                  {purchaseSuccess ? 'Purchase Complete!' : 'Purchase Asset'}
                </Button>
                
                {purchaseSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center animate-fade-in-up">
                    <p className="text-[11px] font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                      <Download className="w-3.5 h-3.5 animate-bounce" /> Added to your candidate downloads dashboard.
                    </p>
                  </div>
                )}
                
                <p className="text-[10px] text-slate-450 font-bold text-center leading-relaxed">
                  Downloads register directly to Candidate Downloads Hub profiles.
                </p>
              </CardContent>
            </Card>
          </aside>

        </div>
      </div>
    </div>
  );
};

const CheckCircle2: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default TemplateDetails;
