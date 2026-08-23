import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock } from 'lucide-react';

export interface BlogCardProps {
  title: string;
  excerpt: string;
  category: string;
  author: string;
  readingTime: string;
  date: string;
  imageUrl?: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  title,
  excerpt,
  category,
  author,
  readingTime,
  date,
}) => {
  return (
    <Card variant="interactive" className="flex flex-col justify-between h-full overflow-hidden p-4 sm:p-5 bg-white border border-kth-slate-200/90 hover:border-kth-primary-300 rounded-xl transition-all duration-200">
      <div>
        <div className="w-full h-28 sm:h-32 bg-gradient-to-br from-kth-slate-900 via-kth-slate-800 to-kth-primary-950 rounded-xl mb-3 sm:mb-4 flex items-center justify-between p-3.5 text-white border border-kth-slate-800 relative overflow-hidden">
          <Badge variant="cyan" className="text-[11px] font-bold truncate max-w-[180px] shadow-2xs">{category}</Badge>
          <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-200 bg-white/10 px-2 py-0.5 rounded backdrop-blur-xs">
            <Clock className="w-3 h-3 text-cyan-300" />
            <span>{readingTime}</span>
          </div>
        </div>

        <CardContent className="p-0">
          <h3 className="font-display text-sm sm:text-base font-bold text-kth-slate-900 mb-2 leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-kth-slate-600 line-clamp-2 leading-relaxed mb-2">
            {excerpt}
          </p>
        </CardContent>
      </div>

      <CardFooter className="pt-3 mt-3 border-t border-kth-slate-100 flex items-center justify-between gap-2 text-[11px] text-kth-slate-500">
        <span className="truncate font-medium">By {author}</span>
        <span className="shrink-0 text-kth-slate-400 font-mono text-[10px]">{date}</span>
      </CardFooter>
    </Card>
  );
};
