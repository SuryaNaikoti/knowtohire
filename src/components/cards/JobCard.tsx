import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Bookmark, MapPin, Check, ArrowRight } from 'lucide-react';
import { formatINR } from '@/design-system/tokens';

export interface JobCardProps {
  id?: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  isRemote?: boolean;
  isVerified?: boolean;
  employmentType: string;
  minSalaryINR: number;
  maxSalaryINR: number;
  skills: string[];
  matchScore?: number; // e.g. 96
  postedDate?: string;
  isSaved?: boolean;
  isClosed?: boolean;
  onSaveToggle?: () => void;
  onApply?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  title,
  company,
  companyLogo,
  location,
  isRemote = false,
  isVerified = true,
  employmentType,
  minSalaryINR,
  maxSalaryINR,
  skills,
  matchScore,
  postedDate,
  isSaved = false,
  isClosed = false,
  onSaveToggle,
  onApply,
}) => {
  const isSalaryValid = (minSalaryINR && minSalaryINR > 0) || (maxSalaryINR && maxSalaryINR > 0);
  const salaryText = isSalaryValid
    ? `${formatINR(minSalaryINR)} - ${formatINR(maxSalaryINR, true)}`
    : 'Salary not disclosed';

  const displayedSkills = (Array.isArray(skills) ? skills : []).slice(0, 3);

  return (
    <Card variant="interactive" className="flex flex-col justify-between p-3.5 sm:p-4 bg-white border border-kth-slate-200/90 hover:border-kth-primary-300 rounded-xl shadow-2xs hover:shadow-sm transition-all duration-200">
      <div>
        <CardHeader className="mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
            <div className="w-9 h-9 rounded-lg bg-kth-primary-50 border border-kth-primary-100/80 text-kth-primary-700 font-display font-extrabold flex items-center justify-center text-sm shrink-0 shadow-2xs">
              {companyLogo ? (
                <img src={companyLogo} alt={company} className="w-full h-full object-cover rounded-lg" />
              ) : (
                company.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const target = `/companies/${encodeURIComponent(company)}`;
                    window.history.pushState({}, '', target);
                    window.dispatchEvent(new Event('popstate'));
                  }}
                  className="text-xs font-bold text-kth-slate-900 hover:text-kth-primary-600 hover:underline truncate max-w-[120px] sm:max-w-[180px] text-left cursor-pointer"
                >
                  {company}
                </button>
                {isVerified && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full shrink-0">
                    <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-kth-slate-500 mt-0.5 truncate">
                <MapPin className="w-3 h-3 shrink-0 text-kth-slate-400" />
                <span className="truncate">{location}</span>
                {isRemote && <span className="font-semibold text-kth-primary-600 shrink-0 text-[10px] sm:text-[11px]">(Remote)</span>}
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label={isSaved ? "Remove from bookmarks" : "Save job"}
            onClick={(e) => { e.stopPropagation(); onSaveToggle?.(); }}
            className={`p-2 rounded-lg transition-all shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer ${isSaved ? 'text-kth-primary-600 bg-kth-primary-50 scale-105' : 'text-kth-slate-400 hover:text-kth-slate-700 hover:bg-kth-slate-100'}`}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </CardHeader>

        <CardContent className="p-0">
          <h3 className="font-display text-sm sm:text-[15px] font-bold text-kth-slate-900 mb-2 leading-snug line-clamp-2 min-h-[2.2rem] flex items-center">
            {title}
          </h3>

          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            {isClosed ? (
              <Badge variant="rose" className="text-[10px] sm:text-[11px] font-bold py-0.5 px-2 bg-rose-100 text-rose-800 border-rose-200">
                Closed — No longer accepting applications
              </Badge>
            ) : (
              <>
                <span className={`font-mono text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-md ${isSalaryValid ? 'text-emerald-700 bg-emerald-50/90 border border-emerald-200/90' : 'text-kth-slate-600 bg-kth-slate-100 border border-kth-slate-200/80'}`}>
                  {salaryText}
                </span>
                <Badge variant="indigo" className="capitalize text-[10px] sm:text-[11px] font-semibold py-0.5 px-2">{employmentType.replace('_', '-')}</Badge>
                {matchScore && (
                  <Badge variant="emerald" hasPulse className="text-[10px] sm:text-[11px] py-0.5 px-2">
                    {matchScore}% Match
                  </Badge>
                )}
              </>
            )}
          </div>

          {displayedSkills.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {displayedSkills.map((skill, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-kth-slate-100/80 text-kth-slate-700 text-[10px] sm:text-[11px] font-medium border border-kth-slate-200/70 truncate max-w-[120px] sm:max-w-[140px]">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="pt-2.5 mt-2.5 sm:pt-3 sm:mt-3 border-t border-kth-slate-100 flex items-center justify-between gap-2">
        <span className="text-[11px] sm:text-xs text-kth-slate-400 font-medium truncate">
          {isClosed ? 'Requisition Closed' : (postedDate || 'Active Opening')}
        </span>
        <Button
          variant={isClosed ? "secondary" : "primary"}
          size="sm"
          onClick={onApply}
          className="shrink-0 font-bold text-xs h-8 px-3.5 shadow-2xs"
        >
          {isClosed ? 'View Details' : 'View Job'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};
