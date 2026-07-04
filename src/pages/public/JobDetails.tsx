import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockJobs } from '../../constants/mockData';
import type { Job } from '../../constants/mockData';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { MapPin, Briefcase, DollarSign, ArrowLeft, ChevronRight, Share2, Heart, Award, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { candidateService } from '../../lib/services/candidateService';

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const job = mockJobs.find((j: Job) => j.id === id);

  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApp, setCheckingApp] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (!profile || profile.role !== 'candidate' || !id) return;
      setCheckingApp(true);
      try {
        const applied = await candidateService.hasApplied(profile.id, id);
        setHasApplied(applied);
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingApp(false);
      }
    };
    checkStatus();
  }, [profile, id]);

  const handleApply = async () => {
    if (!profile || profile.role !== 'candidate' || !id) return;
    setApplying(true);
    try {
      await candidateService.applyToJob(profile.id, id);
      setHasApplied(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Job Listing Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The job posting you are trying to access does not exist or has expired.</p>
        <Link to="/jobs">
          <Button variant="primary">Back to All Jobs</Button>
        </Link>
      </div>
    );
  }

  const similarJobs = mockJobs.filter((j: Job) => j.id !== job.id).slice(0, 2);

  return (
    <div className="bg-slate-50/30 flex-1 w-full min-h-screen py-12 animate-fade-in-up">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-8">
        
        {/* Navigation Breadcrumbs & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Jobs Feed
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white border-slate-200 text-xs py-1.5 px-3 rounded-lg h-9 hover:bg-slate-50" leftIcon={<Share2 className="w-3.5 h-3.5" />}>
              Share
            </Button>
            <Button variant="outline" size="sm" className="bg-white border-slate-200 text-xs py-1.5 px-3 rounded-lg h-9 hover:bg-slate-50" leftIcon={<Heart className="w-3.5 h-3.5" />}>
              Save
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Main Job Body (Left) — 8/12 */}
          <main className="flex-1 bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm text-left">
            {/* Header Block */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center pb-6 border-b border-slate-100 mb-6">
              <div className="w-16 h-16 rounded-2xl border border-slate-100 shrink-0 shadow-sm flex items-center justify-center bg-slate-50">
                <img
                  src={job.logo}
                  alt={`${job.company} logo`}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-lg select-none">
                    {job.company}
                  </span>
                  {job.matchScore && (
                    <span className="text-[10px] font-black text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200/20 select-none">
                      🔥 {job.matchScore}% Match Dossier
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-slate-900 font-heading tracking-tight leading-snug">
                  {job.title}
                </h1>
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-4 flex-wrap font-semibold">
                  <span className="text-slate-800 font-extrabold">{job.department} Department</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.location}</span>
                  <span className="text-slate-300">•</span>
                  <span className="bg-slate-100 px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-slate-650 uppercase select-none">{job.type}</span>
                </p>
              </div>
            </div>

            {/* Description Section */}
            <section className="mb-8 space-y-3">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-heading flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Position Description
              </h2>
              <p className="text-sm text-slate-600 font-normal leading-relaxed">
                {job.description}
              </p>
            </section>

            {/* Requirements Section */}
            <section className="mb-8 space-y-4">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-heading flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Core Requirements
              </h2>
              <ul className="space-y-3">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-slate-650 font-normal leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Benefits Section */}
            <section className="space-y-4">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-heading flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Compensation & Benefits
              </h2>
              <ul className="space-y-3">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-slate-650 font-normal leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>
          </main>

          {/* Sidebar Utilities (Right) — 4/12 */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            
            {/* Action Card */}
            <Card className="bg-white border border-slate-200 shadow-sm relative overflow-hidden rounded-[24px] text-left">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardContent className="p-8 space-y-6">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Salary Estimation</span>
                  <div className="text-2xl font-black text-slate-900 font-heading leading-tight mt-1 flex items-center gap-1">
                    <DollarSign className="w-6 h-6 text-slate-450 shrink-0" /> {job.salary}
                  </div>
                </div>

                <div className="space-y-3.5 pt-4 border-t border-slate-100 text-xs text-slate-500 font-semibold">
                  <div className="flex items-center justify-between">
                    <span>Work Arrangement</span>
                    <span className="text-slate-800 font-extrabold">{job.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Location</span>
                    <span className="text-slate-800 font-extrabold truncate max-w-[140px]">{job.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Posted Date</span>
                    <span className="text-slate-800 font-extrabold">{job.postedAt}</span>
                  </div>
                </div>

                {profile ? (
                  profile.role === 'candidate' ? (
                    hasApplied ? (
                      <Button
                        disabled
                        variant="secondary"
                        className="w-full py-3 h-11 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" /> Applied
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={handleApply}
                        isLoading={applying}
                        disabled={checkingApp}
                        className="w-full py-3 h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md text-xs font-bold"
                      >
                        Apply for this Position
                      </Button>
                    )
                  ) : (
                    <div className="text-center text-[11px] font-bold text-gray-500 bg-gray-50 py-3 rounded-xl border border-dashed border-gray-200">
                      Logged in as {profile.role}
                    </div>
                  )
                ) : (
                  <Link to="/register?ref=apply" className="block pt-2">
                    <Button variant="primary" className="w-full py-3 h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md text-xs font-bold">
                      Apply for this Position
                    </Button>
                  </Link>
                )}
                <p className="text-[10px] text-slate-400 font-bold text-center leading-relaxed">
                  Submitting matches your CV dossier automatically and sends pipeline alerts.
                </p>
              </CardContent>
            </Card>

            {/* Similar Positions */}
            <div className="space-y-3 text-left">
              <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest px-1">Similar Positions</h3>
              {similarJobs.map((simJob) => (
                <Card key={simJob.id} hoverEffect className="bg-white border border-slate-200 rounded-2xl group overflow-hidden">
                  <CardContent className="p-4 flex gap-4 items-center">
                    <div className="w-11 h-11 rounded-lg border border-slate-100 shrink-0 shadow-sm flex items-center justify-center bg-slate-50">
                      <img
                        src={simJob.logo}
                        alt={`${simJob.company} logo`}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate font-heading">
                        {simJob.title}
                      </h4>
                      <p className="text-[10px] text-slate-450 font-semibold mt-0.5 truncate">{simJob.company} • {simJob.location}</p>
                    </div>
                    <Link to={`/jobs/${simJob.id}`} className="shrink-0">
                      <button className="p-2 rounded-lg text-slate-450 hover:text-emerald-700 hover:bg-slate-50 cursor-pointer transition-colors border border-transparent bg-transparent">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

// Simple inner helper icon component since CheckCircle2 has a custom shape
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

export default JobDetails;
