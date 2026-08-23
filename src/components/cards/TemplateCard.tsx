import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileText, Download, CheckCircle2, Shield } from 'lucide-react';

export interface TemplateCardProps {
  title: string;
  category: string;
  format?: string;
  formats?: string[];
  priceINR?: number;
  isFree?: boolean;
  downloads?: string | number;
  description?: string;
  onDownload?: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  title,
  category,
  format = 'DOCX',
  formats,
  priceINR = 0,
  isFree = true,
  downloads = '2.3k',
  description,
  onDownload,
}) => {
  const displayFormat = formats && formats.length > 0 ? formats[0] : format;

  const formattedDownloads =
    typeof downloads === 'number'
      ? downloads >= 1000
        ? `${(downloads / 1000).toFixed(1)}k`
        : downloads.toLocaleString('en-IN')
      : String(downloads || '1.5k');

  const getCategoryBadge = () => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('resume') || cat.includes('cv')) {
      return (
        <Badge variant="indigo" className="gap-1 min-w-0 max-w-[170px] truncate text-[11px] font-semibold">
          <FileText className="w-3 h-3 shrink-0" />
          <span className="truncate">{category}</span>
        </Badge>
      );
    }
    if (cat.includes('legal') || cat.includes('contract') || cat.includes('agreement')) {
      return (
        <Badge variant="slate" className="gap-1 min-w-0 max-w-[170px] truncate text-[11px] font-semibold">
          <Shield className="w-3 h-3 shrink-0" />
          <span className="truncate">{category}</span>
        </Badge>
      );
    }
    return (
      <Badge variant="indigo" className="gap-1 min-w-0 max-w-[170px] truncate text-[11px] font-semibold">
        <FileText className="w-3 h-3 shrink-0" />
        <span className="truncate">{category}</span>
      </Badge>
    );
  };

  return (
    <Card
      variant="interactive"
      className="group flex flex-col justify-between h-full p-4 sm:p-5 bg-white border border-kth-slate-200/90 hover:border-kth-primary-400/80 rounded-2xl transition-all duration-200 hover:shadow-md relative overflow-hidden"
    >
      <div className="flex flex-col flex-1">
        {/* Card Header: Category Badge + Format Pill */}
        <CardHeader className="flex items-center justify-between gap-2 mb-3 sm:mb-3.5">
          {getCategoryBadge()}
          <span className="font-mono text-[11px] font-bold text-kth-primary-700 bg-kth-primary-50 border border-kth-primary-200/80 px-2 py-0.5 rounded-md shrink-0 shadow-2xs">
            {displayFormat}
          </span>
        </CardHeader>

        {/* Card Content & Document Preview Hero */}
        <CardContent className="p-0 flex flex-col flex-1">
          <div className="w-full h-28 sm:h-32 mb-3.5 sm:mb-4 rounded-xl bg-gradient-to-br from-kth-slate-50 via-indigo-50/30 to-kth-primary-50/40 border border-kth-slate-200/80 flex flex-col items-center justify-center p-3 text-center text-kth-slate-500 shadow-2xs group-hover:border-kth-primary-200 transition-colors duration-200 relative overflow-hidden">
            {/* Subtle Document preview layout effect */}
            <div className="w-10 h-10 rounded-xl bg-white border border-kth-slate-200/90 flex items-center justify-center text-kth-primary-600 shadow-xs mb-1.5 group-hover:scale-105 transition-transform duration-200">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-kth-primary-800 tracking-wide uppercase">
              <CheckCircle2 className="w-3 h-3 text-kth-primary-600" />
              <span>Verified ATS Template</span>
            </div>
          </div>

          {/* Title Header */}
          <h3 className="font-display font-bold text-sm sm:text-base text-kth-slate-900 mb-1 leading-snug line-clamp-2 group-hover:text-kth-primary-700 transition-colors">
            {title}
          </h3>

          {description && (
            <p className="text-xs text-kth-slate-500 line-clamp-2 leading-relaxed mb-2 font-normal hidden sm:block">
              {description}
            </p>
          )}
        </CardContent>
      </div>

      {/* Card Footer: Pricing / Download Metadata + Action CTA */}
      <CardFooter className="flex items-center justify-between border-t border-kth-slate-100 pt-3 mt-3 gap-2 shrink-0">
        <div className="min-w-0 flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                isFree
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200/80'
                  : 'text-kth-primary-700 bg-kth-primary-50 border-kth-primary-200'
              }`}
            >
              {isFree ? 'FREE' : `₹${priceINR}`}
            </span>
          </div>
          <span className="text-[10px] text-kth-slate-400 block truncate mt-1">
            {formattedDownloads} downloads
          </span>
        </div>

        <Button
          variant={isFree ? 'secondary' : 'primary'}
          size="sm"
          className="shrink-0 text-xs font-bold transition-all shadow-2xs hover:shadow-xs"
          leftIcon={<Download className="w-3.5 h-3.5" />}
          onClick={onDownload}
        >
          {isFree ? 'Download' : 'Get Template'}
        </Button>
      </CardFooter>
    </Card>
  );
};
