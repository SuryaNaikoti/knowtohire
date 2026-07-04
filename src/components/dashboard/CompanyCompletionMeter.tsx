import React from 'react';

interface CompanyCompletionMeterProps {
  percentage: number;
  className?: string;
  size?: number;
}

export const CompanyCompletionMeter: React.FC<CompanyCompletionMeterProps> = ({
  percentage,
  className = '',
  size = 80,
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

  return (
    <div className={`flex items-center space-x-4 bg-white p-4 rounded-xl border border-gray-200 border-solid shadow-xs ${className}`}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            className="stroke-gray-100"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Active progress */}
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
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black font-heading text-gray-900">{percentage}%</span>
        </div>
      </div>
      <div>
        <h4 className="text-xs font-bold text-gray-900">Company Profile Completion Strength</h4>
        <p className="text-[10px] text-gray-400 font-bold mt-0.5 leading-tight">
          {percentage === 100
            ? 'Outstanding! Your company directory listing is fully verified.'
            : 'Fill in emails, LinkedIn pages, locations, and branding assets to increase candidate engagement.'}
        </p>
      </div>
    </div>
  );
};
