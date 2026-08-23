import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileText, Download } from 'lucide-react';

export interface TemplateCardProps {
  title: string;
  category: string;
  format?: string;
  priceINR?: number;
  isFree?: boolean;
  downloads?: string | number;
  onDownload?: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  title,
  category,
  format = 'DOCX',
  priceINR = 0,
  isFree = true,
  downloads = '8.4k',
  onDownload,
}) => {
  return (
    <Card variant="interactive" className="flex flex-col justify-between h-full p-4 sm:p-5 bg-white border border-kth-slate-200/90 hover:border-kth-primary-400/80 rounded-xl transition-all duration-200">
      <div>
        <CardHeader className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="indigo" className="gap-1 min-w-0 max-w-[170px] truncate text-[11px] font-semibold">
            <FileText className="w-3 h-3 shrink-0" />
            <span className="truncate">{category}</span>
          </Badge>
          <span className="font-mono text-[11px] font-bold text-kth-primary-700 bg-kth-primary-50 border border-kth-primary-200/80 px-2 py-0.5 rounded shrink-0">
            {format}
          </span>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full h-24 mb-3 rounded-xl bg-gradient-to-br from-kth-slate-50 to-indigo-50/40 border border-kth-slate-200/80 flex flex-col items-center justify-center text-kth-slate-400 p-2 relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-white border border-kth-slate-200 flex items-center justify-center text-kth-primary-600 shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium text-kth-slate-500 mt-1">Verified Template</span>
          </div>

          <h3 className="font-display font-bold text-sm sm:text-base text-kth-slate-900 mb-1 leading-snug line-clamp-2">
            {title}
          </h3>
        </CardContent>
      </div>

      <CardFooter className="flex items-center justify-between border-t border-kth-slate-100 pt-3 mt-2 gap-2">
        <div className="min-w-0">
          <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            {isFree ? 'FREE' : `₹${priceINR}`}
          </span>
          <span className="text-[10px] text-kth-slate-400 block truncate mt-1">
            {typeof downloads === 'number' ? downloads.toLocaleString() : downloads} downloads
          </span>
        </div>
        <Button
          variant={isFree ? 'secondary' : 'primary'}
          size="sm"
          className="shrink-0 text-xs font-bold"
          leftIcon={<Download className="w-3.5 h-3.5" />}
          onClick={onDownload}
        >
          {isFree ? 'Download' : 'Get Template'}
        </Button>
      </CardFooter>
    </Card>
  );
};
