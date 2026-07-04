import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockResources } from '../../constants/mockData';
import type { Resource } from '../../constants/mockData';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { ArrowLeft, Star, Download, Award, CheckCircle, Info } from 'lucide-react';

export const ResourceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const resource = mockResources.find((r: Resource) => r.id === id);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!resource) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Resource Not Found</h2>
        <p className="text-sm text-gray-550 mb-6">The specified career resource does not exist.</p>
        <Link to="/resources">
          <Button variant="primary">Back to Knowledge Hub</Button>
        </Link>
      </div>
    );
  }

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 4000);
  };

  return (
    <div className="bg-slate-50/30 flex-1 w-full min-h-screen py-12 animate-fade-in-up">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-8">
        
        {/* Navigation Breadcrumbs & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link to="/resources" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Hub Catalog
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Main Core Body (Left) — 8/12 */}
          <main className="flex-1 bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm text-left">
            <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-slate-100 mb-6">
              <img
                src={resource.coverUrl}
                alt={`${resource.title} cover`}
                className="w-full md:w-44 rounded-2xl object-cover border border-slate-200 aspect-[3/4]"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-lg select-none tracking-widest">
                  {resource.format}
                </span>
                <h1 className="text-2xl font-bold text-slate-900 font-heading tracking-tight leading-snug mt-2">
                  {resource.title}
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-semibold">{resource.author}</p>

                {/* Basic statistics */}
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 flex-wrap font-bold">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {resource.rating} Rating
                  </span>
                  <span className="text-slate-350">•</span>
                  <span>{resource.downloadsCount} downloads</span>
                </div>
              </div>
            </div>

            {/* Summary Description */}
            <section className="mb-8 space-y-3">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-heading flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-350" /> Resource Description
              </h2>
              <p className="text-sm text-slate-650 font-normal leading-relaxed">
                {resource.description}
              </p>
            </section>

            {/* Chapters Checklist */}
            <section className="space-y-4">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-heading flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" /> Table of Contents & Covered Modules
              </h2>
              <ul className="space-y-3">
                {resource.chapters.map((chap, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-slate-650 font-semibold leading-relaxed border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                    <span className="text-xs font-bold text-slate-400 shrink-0 self-center">
                      Chapter {index + 1}
                    </span>
                    <span className="text-slate-700 font-semibold">{chap}</span>
                  </li>
                ))}
              </ul>
            </section>
          </main>

          {/* Sidebar Details (Right) — 4/12 */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            <Card className="bg-white border border-slate-200 shadow-sm rounded-[24px] overflow-hidden text-left">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3.5 mb-6 text-xs text-slate-500 font-semibold">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span>File Format</span>
                    <span className="font-extrabold text-slate-800 uppercase">PDF E-book</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span>File Size</span>
                    <span className="font-extrabold text-slate-800">{resource.fileSize}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Publish Date</span>
                    <span className="font-extrabold text-slate-800">{resource.publishedDate}</span>
                  </div>
                </div>

                <Button
                  onClick={handleDownload}
                  variant={downloadSuccess ? 'secondary' : 'primary'}
                  className={`w-full py-3 h-11 text-white shadow-md text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 ${
                    downloadSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                  }`}
                  leftIcon={downloadSuccess ? <CheckCircle className="w-4 h-4 animate-bounce" /> : <Download className="w-4 h-4" />}
                >
                  {downloadSuccess ? 'Downloading Complete!' : 'Download Resource PDF'}
                </Button>
                
                {downloadSuccess && (
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

export default ResourceDetails;
