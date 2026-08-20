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
    <Card variant="interactive" className="flex flex-col justify-between h-full">
      <div>
        <CardHeader className="mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-kth-primary-50 border border-kth-primary-100 text-kth-primary-700 font-display font-extrabold flex items-center justify-center text-base shrink-0">
              {companyLogo || company.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-kth-slate-700">{company}</span>
                {isVerified && <Badge variant="cyan" className="py-0.5 px-1.5 text-[9px]">Verified</Badge>}
              </div>
              <div className="flex items-center gap-1 text-xs text-kth-slate-500 mt-0.5">
                <MapPin className="w-3 h-3 shrink-0 text-kth-slate-400" />
                <span>{location}</span>
                {isRemote && <span className="font-semibold text-kth-primary-600">(Remote)</span>}
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label={isSaved ? "Remove from bookmarks" : "Save job"}
            onClick={(e) => { e.stopPropagation(); onSaveToggle?.(); }}
            className={`p-2 rounded-md transition-colors ${isSaved ? 'text-kth-primary-600 bg-kth-primary-50' : 'text-kth-slate-400 hover:text-kth-slate-700 hover:bg-kth-slate-100'}`}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </CardHeader>

        <CardContent>
          <h3 className="font-display text-base font-bold text-kth-slate-900 mb-2 leading-snug">
            {title}
          </h3>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge variant="mono">{salaryText}</Badge>
            <Badge variant="indigo" className="capitalize">{employmentType.replace('_', '-')}</Badge>
            {matchScore && (
              <Badge variant="emerald" hasPulse>
                {matchScore}% Match
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(Array.isArray(skills) ? skills : []).map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-kth-slate-100 text-kth-slate-700 text-xs font-medium border border-kth-slate-200">
                {skill}
              </span>
            ))}
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-4 mt-4 border-t border-kth-slate-100 flex items-center justify-between">
        <span className="text-xs text-kth-slate-400 font-medium">
          {postedDate || 'Recently posted'}
        </span>
        <Button variant="primary" size="sm" onClick={onApply}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
