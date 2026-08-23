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
    <Card variant="interactive" className="flex flex-col justify-between h-full p-4 sm:p-5 bg-white border border-kth-slate-200/90 hover:border-cyan-400/80 rounded-xl transition-all duration-200">
      <div>
        <CardHeader className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="cyan" className="gap-1 min-w-0 max-w-[170px] truncate text-[11px] font-semibold">
            <BookOpen className="w-3 h-3 shrink-0" />
            <span className="truncate">{category}</span>
          </Badge>
          <div className="flex items-center gap-1 text-xs font-bold text-kth-slate-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-md shrink-0">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full h-28 sm:h-32 mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-kth-slate-900 via-kth-slate-800 to-kth-primary-950 border border-kth-slate-800 flex flex-col items-center justify-center p-3 text-center text-white shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center mb-1.5 text-cyan-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-mono text-[10px] tracking-wider text-cyan-200 font-bold uppercase">
              {format} • {pageCount} Pages
            </span>
          </div>

          <h3 className="font-display font-bold text-sm sm:text-base text-kth-slate-900 mb-1 leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-kth-slate-500 mb-1 truncate">Authored by {author}</p>
        </CardContent>
      </div>

      <CardFooter className="flex items-center justify-between border-t border-kth-slate-100 pt-3 mt-3 gap-2">
        <div className="min-w-0">
          <span className="font-mono text-xs font-bold text-kth-primary-700 bg-kth-primary-50 border border-kth-primary-100 px-2 py-0.5 rounded">
            {isFree ? 'FREE' : `₹${priceINR}`}
          </span>
          <span className="text-[10px] text-kth-slate-400 block truncate mt-1">
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
          {isFree ? 'Read Guide' : 'Get E-Book'}
        </Button>
      </CardFooter>
    </Card>
  );
};
