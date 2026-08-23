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
  description?: string;
  fileSize?: string;
  coverUrl?: string;
  onDownload?: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  title,
  category,
  author,
  format = 'PDF',
  pageCount = 48,
  rating = 4.9,
  downloadCount = '4.1k',
  isFree = true,
  priceINR = 0,
  description,
  fileSize = '2.4 MB',
  onDownload,
}) => {
  // Category specific accent subtle tints
  const getCategoryBadge = () => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('patent') || cat.includes('ipr')) {
      return (
        <Badge variant="indigo" className="gap-1 min-w-0 max-w-[170px] truncate text-[11px] font-semibold">
          <BookOpen className="w-3 h-3 shrink-0" />
          <span className="truncate">{category}</span>
        </Badge>
      );
    }
    if (cat.includes('environmental') || cat.includes('esg') || cat.includes('sustainability')) {
      return (
        <Badge variant="cyan" className="gap-1 min-w-0 max-w-[170px] truncate text-[11px] font-semibold">
          <BookOpen className="w-3 h-3 shrink-0" />
          <span className="truncate">{category}</span>
        </Badge>
      );
    }
    return (
      <Badge variant="cyan" className="gap-1 min-w-0 max-w-[170px] truncate text-[11px] font-semibold">
        <BookOpen className="w-3 h-3 shrink-0" />
        <span className="truncate">{category}</span>
      </Badge>
    );
  };

  const formattedDownloads =
    typeof downloadCount === 'number'
      ? downloadCount >= 1000
        ? `${(downloadCount / 1000).toFixed(1)}k`
        : downloadCount.toLocaleString('en-IN')
      : String(downloadCount || '1.2k');

  return (
    <Card
      variant="interactive"
      className="group flex flex-col justify-between h-full p-4 sm:p-5 bg-white border border-kth-slate-200/90 hover:border-cyan-400/80 rounded-2xl transition-all duration-200 hover:shadow-md relative overflow-hidden"
    >
      <div className="flex flex-col flex-1">
        {/* Card Header: Category Badge + Star Rating */}
        <CardHeader className="flex items-center justify-between gap-2 mb-3 sm:mb-3.5">
          {getCategoryBadge()}
          <div className="flex items-center gap-1 text-[11px] font-bold text-kth-slate-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md shrink-0 shadow-2xs">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{Number(rating).toFixed(1)}</span>
          </div>
        </CardHeader>

        {/* Card Visual Hero / Cover Graphic */}
        <CardContent className="p-0 flex flex-col flex-1">
          <div className="w-full h-28 sm:h-32 mb-3.5 sm:mb-4 rounded-xl bg-gradient-to-br from-kth-slate-900 via-kth-slate-800 to-kth-primary-950 border border-kth-slate-800/80 flex flex-col items-center justify-center p-3 text-center text-white shadow-xs group-hover:from-kth-slate-950 group-hover:to-cyan-950 transition-colors duration-300 relative overflow-hidden">
            {/* Subtle mesh background effect */}
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
            
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 backdrop-blur-xs flex items-center justify-center mb-1.5 text-cyan-300 group-hover:scale-105 transition-transform duration-200 shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            
            <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-cyan-200 font-bold uppercase z-10">
              <span>{format}</span>
              <span className="text-cyan-400/60">•</span>
              <span>{pageCount} Pages</span>
              {fileSize && (
                <>
                  <span className="text-cyan-400/60">•</span>
                  <span className="text-kth-slate-300 font-normal">{fileSize}</span>
                </>
              )}
            </div>
          </div>

          {/* Title & Author */}
          <h3 className="font-display font-bold text-sm sm:text-base text-kth-slate-900 mb-1 leading-snug line-clamp-2 group-hover:text-kth-primary-700 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-kth-slate-500 mb-2 truncate">
            Authored by <span className="text-kth-slate-700 font-medium">{author}</span>
          </p>

          {description && (
            <p className="text-xs text-kth-slate-500 line-clamp-2 leading-relaxed mb-2 font-normal hidden sm:block">
              {description}
            </p>
          )}
        </CardContent>
      </div>

      {/* Card Footer: Price / Downloads & Download CTA */}
      <CardFooter className="flex items-center justify-between border-t border-kth-slate-100 pt-3 mt-3 gap-2 shrink-0">
        <div className="min-w-0 flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                isFree
                  ? 'text-cyan-800 bg-cyan-50 border-cyan-200/80'
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
          {isFree ? 'Read Guide' : 'Get E-Book'}
        </Button>
      </CardFooter>
    </Card>
  );
};
