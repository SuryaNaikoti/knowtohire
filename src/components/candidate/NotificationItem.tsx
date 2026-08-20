import React from 'react';
import { Card } from '@/components/ui/Card';
import { CandidateNotification } from '@/data/candidateMockData';
import { Calendar, Sparkles, FileCheck, Info } from 'lucide-react';

export interface NotificationItemProps {
  notification: CandidateNotification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const getCategoryIcon = (cat: CandidateNotification['category']) => {
    switch (cat) {
      case 'interview': return <Calendar className="w-4 h-4 text-cyan-600" />;
      case 'recommendation': return <Sparkles className="w-4 h-4 text-kth-primary-600" />;
      case 'application': return <FileCheck className="w-4 h-4 text-emerald-600" />;
      default: return <Info className="w-4 h-4 text-kth-slate-500" />;
    }
  };

  return (
    <Card className={`p-4 transition-colors ${!notification.isRead ? 'bg-kth-primary-50/40 border-kth-primary-200' : 'bg-white'}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white border border-kth-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          {getCategoryIcon(notification.category)}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-display font-bold text-xs text-kth-slate-900">{notification.title}</h4>
            <span className="text-[10px] text-kth-slate-400 font-mono">{notification.timestamp}</span>
          </div>
          <p className="text-xs text-kth-slate-600 leading-relaxed">{notification.message}</p>
        </div>
      </div>
    </Card>
  );
};
