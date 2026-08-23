import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Bookmark, MapPin } from 'lucide-react';
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
  onSaveToggle,
  onApply,
}) => {
  const salaryText = `${formatINR(minSalaryINR)} - ${formatINR(maxSalaryINR, true)}`;

  return (
    <Card variant="interactive" className="flex flex-col justify-between h-full p-4 sm:p-5 bg-white border border-kth-slate-200/90 hover:border-kth-primary-300 rounded-xl">
      <div>
        <CardHeader className="mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
            <div className="w-10 h-10 rounded-xl bg-kth-primary-50 border border-kth-primary-100 text-kth-primary-700 font-display font-extrabold flex items-center justify-center text-sm sm:text-base shrink-0 shadow-2xs">
              {companyLogo || company.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-kth-slate-800 truncate max-w-[140px] sm:max-w-[180px]">{company}</span>
                {isVerified && <Badge variant="cyan" className="py-0.5 px-1.5 text-[9px] shrink-0 font-bold">Verified</Badge>}
              </div>
              <div className="flex items-center gap-1 text-xs text-kth-slate-500 mt-0.5 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-kth-slate-400" />
                <span className="truncate">{location}</span>
                {isRemote && <span className="font-semibold text-kth-primary-600 shrink-0 text-[11px]">(Remote)</span>}
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label={isSaved ? "Remove from bookmarks" : "Save job"}
            onClick={(e) => { e.stopPropagation(); onSaveToggle?.(); }}
            className={`p-2 rounded-lg transition-colors shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center ${isSaved ? 'text-kth-primary-600 bg-kth-primary-50' : 'text-kth-slate-400 hover:text-kth-slate-700 hover:bg-kth-slate-100'}`}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </CardHeader>

        <CardContent className="p-0">
          <h3 className="font-display text-sm sm:text-base font-bold text-kth-slate-900 mb-2.5 leading-snug line-clamp-2">
            {title}
          </h3>

          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 flex-wrap">
            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-200/90 px-2 py-0.5 rounded-md">
              {salaryText}
            </span>
            <Badge variant="indigo" className="capitalize text-[11px] sm:text-xs font-semibold">{employmentType.replace('_', '-')}</Badge>
            {matchScore && (
              <Badge variant="emerald" hasPulse className="text-[11px] sm:text-xs">
                {matchScore}% Match
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(Array.isArray(skills) ? skills : []).slice(0, 3).map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-kth-slate-100/80 text-kth-slate-700 text-[11px] sm:text-xs font-medium border border-kth-slate-200/70 truncate max-w-[150px]">
                {skill}
              </span>
            ))}
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-3 mt-3 sm:pt-4 sm:mt-4 border-t border-kth-slate-100 flex items-center justify-between gap-2">
        <span className="text-xs text-kth-slate-400 font-medium truncate">
          {postedDate || 'Active Opening'}
        </span>
        <Button variant="primary" size="sm" onClick={onApply} className="shrink-0 font-bold text-xs">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
