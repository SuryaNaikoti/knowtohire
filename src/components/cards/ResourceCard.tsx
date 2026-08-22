import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BookOpen, Star, Download } from 'lucide-react';

export interface ResourceCardProps {
  title: string;
  category: string;
  author: string;
  format?: string;
  pageCount?: number;
  rating?: number;
  downloadCount?: string | number;
  isFree?: boolean;
  priceINR?: number;
  onDownload?: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  title,
  category,
  author,
  format = 'PDF',
  pageCount = 120,
  rating = 4.9,
  downloadCount = '14.2k',
  isFree = true,
  priceINR = 0,
  onDownload,
}) => {
  return (
    <Card variant="interactive" className="flex flex-col justify-between h-full p-4 sm:p-5">
      <div>
        <CardHeader className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="cyan" className="gap-1 min-w-0 max-w-[180px] truncate text-[11px] sm:text-xs">
            <BookOpen className="w-3 h-3 shrink-0" />
            <span className="truncate">{category}</span>
          </Badge>
          <div className="flex items-center gap-1 text-xs font-semibold text-kth-slate-600 shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full h-28 sm:h-32 mb-3 sm:mb-4 rounded-md bg-gradient-to-br from-kth-slate-100 to-kth-slate-200 border border-kth-slate-200 flex flex-col items-center justify-center p-3 text-center">
            <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-kth-slate-400 mb-1.5" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-kth-slate-500 font-bold">
              {format} • {pageCount} Pages
            </span>
          </div>

          <h3 className="font-display font-bold text-sm sm:text-base text-kth-slate-900 mb-1 leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-kth-slate-500 mb-2 truncate">By {author}</p>
        </CardContent>
      </div>

      <CardFooter className="flex items-center justify-between border-t border-kth-slate-100 pt-3 mt-3 gap-2">
        <div className="min-w-0">
          <div className="text-xs font-bold text-kth-slate-900">
            {isFree ? 'FREE' : `₹${priceINR}`}
          </div>
          <span className="text-[10px] text-kth-slate-400 block truncate">
            {typeof downloadCount === 'number' ? downloadCount.toLocaleString() : downloadCount} downloads
          </span>
        </div>
        <Button
          variant={isFree ? 'secondary' : 'primary'}
          size="sm"
          className="shrink-0 text-xs font-bold"
          leftIcon={<Download className="w-3.5 h-3.5" />}
          onClick={onDownload}
        >
          {isFree ? 'Download' : 'Get E-Book'}
        </Button>
      </CardFooter>
    </Card>
  );
};
