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
    <Card variant="interactive" className="flex flex-col justify-between h-full">
      <div>
        <CardHeader>
          <Badge variant="indigo" className="gap-1">
            <FileText className="w-3 h-3" />
            {category}
          </Badge>
          <Badge variant="mono">{format}</Badge>
        </CardHeader>

        <CardContent>
          <div className="w-full h-24 mb-3 rounded-md bg-kth-slate-100 border border-kth-slate-200 flex items-center justify-center text-kth-slate-400">
            <FileText className="w-8 h-8 opacity-40" />
          </div>

          <h3 className="font-display font-bold text-sm text-kth-slate-900 mb-1 leading-snug line-clamp-2">
            {title}
          </h3>
        </CardContent>
      </div>

      <CardFooter className="flex items-center justify-between border-t border-kth-slate-100 pt-3 mt-2">
        <div>
          <div className="font-mono text-xs font-bold text-kth-primary-600">
            {isFree ? 'FREE' : `₹${priceINR}`}
          </div>
          <span className="text-[10px] text-kth-slate-400">
            {typeof downloads === 'number' ? downloads.toLocaleString() : downloads} downloads
          </span>
        </div>
        <Button
          variant={isFree ? 'secondary' : 'primary'}
          size="sm"
          leftIcon={<Download className="w-3 h-3" />}
          onClick={onDownload}
        >
          {isFree ? 'Download' : 'Purchase'}
        </Button>
      </CardFooter>
    </Card>
  );
};
