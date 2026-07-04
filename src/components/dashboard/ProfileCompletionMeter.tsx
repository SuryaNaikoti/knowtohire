import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface ProfileCompletionMeterProps {
  percentage: number;
  breakdown?: {
    bio: boolean;
    resume: boolean;
    skills: boolean;
    experience: boolean;
    education: boolean;
    certifications: boolean;
  };
  className?: string;
  size?: number;
}

export const ProfileCompletionMeter: React.FC<ProfileCompletionMeterProps> = ({
  percentage,
  breakdown,
  className = '',
  size = 90,
}) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColorClasses = (pct: number) => {
    if (pct < 35) return 'stroke-red-500';
    if (pct < 75) return 'stroke-orange-500';
    return 'stroke-emerald-500';
  };

  const strokeColorClass = getColorClasses(percentage);

  const checklist = [
    { label: 'General Biography & Title', completed: breakdown?.bio ?? false, path: ROUTES.DASHBOARD.CANDIDATE.PORTFOLIO },
    { label: 'Resume Document Upload', completed: breakdown?.resume ?? false, path: ROUTES.DASHBOARD.CANDIDATE.PORTFOLIO },
    { label: '3+ Technical Skills', completed: breakdown?.skills ?? false, path: ROUTES.DASHBOARD.CANDIDATE.SKILLS },
    { label: 'Professional Work Experience', completed: breakdown?.experience ?? false, path: ROUTES.DASHBOARD.CANDIDATE.EXPERIENCE },
    { label: 'Education History', completed: breakdown?.education ?? false, path: ROUTES.DASHBOARD.CANDIDATE.EDUCATION },
    { label: 'Verifiable Certifications', completed: breakdown?.certifications ?? false, path: ROUTES.DASHBOARD.CANDIDATE.CERTIFICATIONS },
  ];

  return (
    <div className={`bg-white p-6 rounded-2xl border border-gray-200 border-solid shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center ${className}`}>
      
      {/* Circle Meter Column */}
      <div className="flex items-center gap-5 md:border-r border-solid border-gray-100 pr-4">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle
              className="stroke-gray-100"
              strokeWidth={strokeWidth}
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <circle
              className={`transition-all duration-500 ease-out border-solid ${strokeColorClass}`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-black font-heading text-gray-900">{percentage}%</span>
            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Score</span>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide">Profile Strength Index</h4>
          <p className="text-[10px] text-gray-500 font-medium mt-1 leading-normal">
            {percentage === 100
              ? 'Outstanding! Your candidate dossier is fully complete.'
              : 'Complete the checklist to maximize matching indexes.'}
          </p>
        </div>
      </div>

      {/* Checklist Breakdown (takes remaining 2 cols) */}
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {checklist.map((item) => (
          <div
            key={item.label}
            className={`flex items-center justify-between p-2.5 rounded-xl border border-solid transition-all ${
              item.completed
                ? 'bg-emerald-50/30 border-emerald-100/50'
                : 'bg-amber-50/10 border-gray-150 hover:bg-amber-50/20'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {item.completed ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span className={`text-[11px] font-bold truncate ${item.completed ? 'text-emerald-800' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </div>
            {!item.completed && (
              <Link
                to={item.path}
                className="text-[9px] font-black text-primary hover:text-blue-700 flex items-center gap-0.5 shrink-0 uppercase tracking-wider"
              >
                Complete <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
