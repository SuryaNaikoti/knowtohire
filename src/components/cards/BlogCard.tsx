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
    <Card variant="interactive" className="flex flex-col justify-between h-full overflow-hidden">
      <div>
        <div className="w-full h-36 bg-gradient-to-br from-kth-slate-800 to-kth-primary-900 rounded-md mb-4 flex items-center justify-center p-4">
          <Badge variant="cyan">{category}</Badge>
        </div>

        <CardContent className="p-0">
          <h3 className="font-display text-base font-bold text-kth-slate-900 mb-2 leading-snug">
            {title}
          </h3>
          <p className="text-xs text-kth-slate-600 line-clamp-2 leading-relaxed mb-3">
            {excerpt}
          </p>
        </CardContent>
      </div>

      <CardFooter className="pt-3 mt-3 border-t border-kth-slate-100 flex items-center justify-between text-xs text-kth-slate-500">
        <span>By {author} • {date}</span>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{readingTime}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
