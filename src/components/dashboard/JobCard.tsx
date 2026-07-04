import React from 'react';
import type { Job } from '../../lib/services/jobsService';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { MapPin, Briefcase, DollarSign, Calendar, Bookmark, BookmarkCheck, Star } from 'lucide-react';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onViewDetails?: () => void;
  showSaveButton?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved = false,
  onToggleSave,
  onViewDetails,
  showSaveButton = true,
}) => {
  const getDomainBadgeColor = (domain: string) => {
    switch (domain) {
      case 'Environmental':
        return 'secondary'; // green
      case 'ESG':
        return 'secondary'; // green
      case 'Patent':
        return 'accent'; // orange
      case 'IPR':
        return 'accent'; // orange
      case 'Research':
        return 'primary'; // blue
      case 'Consulting':
        return 'primary'; // blue
      case 'General':
      default:
        return 'neutral'; // gray
    }
  };

  const getJobTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Full-time':
        return 'primary';
      case 'Part-time':
        return 'neutral';
      case 'Contract':
        return 'warning';
      case 'Internship':
      default:
        return 'accent';
    }
  };

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return 'Compensation undisclosed';
    const fmt = (val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toString();
    if (min && max) return `${currency} ${fmt(min)} - ${fmt(max)}`;
    if (min) return `${currency} ${fmt(min)}+`;
    return `${currency} Up to ${fmt(max!)}`;
  };

  return (
    <Card hoverEffect className={`bg-white border border-gray-200 border-solid relative transition-all duration-200 overflow-hidden ${job.is_featured ? 'ring-1 ring-amber-450 border-amber-300' : ''}`}>
      {/* Featured Ribbon Tag */}
      {job.is_featured && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg shadow-sm flex items-center gap-0.5 select-none z-10">
          <Star className="w-2.5 h-2.5 fill-white" /> FEATURED
        </div>
      )}

      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
        {/* Core Detail Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center space-x-3 min-w-0">
              {/* Company Logo fallback */}
              {job.company_logo ? (
                <img
                  src={job.company_logo}
                  alt={`${job.company_name} Logo`}
                  className="w-10 h-10 rounded-lg object-cover border border-gray-150 border-solid shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 border-solid flex items-center justify-center font-black text-gray-500 text-sm shrink-0 select-none">
                  {job.company_name?.[0] || 'K'}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="font-heading font-black text-gray-900 text-sm sm:text-base leading-tight truncate hover:text-primary transition-colors cursor-pointer" onClick={onViewDetails}>
                  {job.title}
                </h4>
                <p className="text-xs text-gray-500 font-semibold mt-0.5 leading-none">
                  {job.company_name}
                </p>
              </div>
            </div>

            {/* Saved Bookmark Toggle */}
            {showSaveButton && onToggleSave && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave();
                }}
                className={`p-1.5 rounded-lg border border-solid transition shrink-0 cursor-pointer ${
                  isSaved
                    ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                    : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label={isSaved ? 'Remove from bookmarked jobs' : 'Bookmark this job'}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4 fill-current" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Job Badges Meta */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge variant={getDomainBadgeColor(job.career_domain)} size="sm">
              {job.career_domain} Domain
            </Badge>
            <Badge variant={getJobTypeBadgeColor(job.employment_type)} size="sm">
              {job.employment_type}
            </Badge>
            <Badge variant="neutral" size="sm" className="bg-gray-50 text-gray-600 border-gray-250">
              {job.location_type}
            </Badge>
          </div>

          {/* Location & Meta Text */}
          <div className="text-xs text-gray-500 font-medium space-y-1 pt-1">
            <div className="flex items-center space-x-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{job.city}{job.state ? `, ${job.state}` : ''}, {job.country}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className={job.salary_visible ? 'font-semibold text-gray-800' : 'text-gray-400 italic'}>
                {job.salary_visible
                  ? formatSalary(job.salary_min, job.salary_max, job.salary_currency)
                  : 'Undisclosed Salary'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-gray-100 border-solid pt-3 shrink-0">
          <div className="flex items-center text-[10px] text-gray-400 font-semibold space-x-2">
            <span className="flex items-center gap-0.5"><Briefcase className="w-3 h-3" /> {job.view_count || 0} views</span>
            {job.application_deadline && (
              <span className="flex items-center gap-0.5">
                <Calendar className="w-3 h-3" /> Due {new Date(job.application_deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
              </span>
            )}
          </div>
          <button
            onClick={onViewDetails}
            className="text-xs font-bold text-primary hover:text-blue-800 transition focus:outline-none focus:underline cursor-pointer"
          >
            Details & Apply →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
