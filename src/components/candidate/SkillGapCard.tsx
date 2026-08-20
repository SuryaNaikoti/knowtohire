import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Zap, BookOpen, ArrowRight } from 'lucide-react';

export interface SkillGapCardProps {
  skillName: string;
  currentPercentage: number;
  targetPercentage: number;
  recommendedResource: string;
}

export const SkillGapCard: React.FC<SkillGapCardProps> = ({
  skillName = "Data Analytics & GHG Modeling",
  currentPercentage = 58,
  targetPercentage = 75,
  recommendedResource = "Excel & Carbon Data Modeling for ESG Professionals",
}) => {
  return (
    <Card className="p-5 border-l-4 border-l-kth-accent-cyan">
      <div className="flex items-center justify-between mb-3">
        <Badge variant="cyan" className="gap-1">
          <Zap className="w-3 h-3" /> Skill Gap Identified
        </Badge>
        <span className="text-xs font-mono font-bold text-kth-slate-500">
          Target Role: ESG Lead
        </span>
      </div>

      <h4 className="font-display font-bold text-base text-kth-slate-900 mb-1">{skillName}</h4>
      <p className="text-xs text-kth-slate-500 mb-4">
        Your current rating is <strong className="text-kth-slate-800">{currentPercentage}%</strong>. Target role requires <strong className="text-kth-slate-800">{targetPercentage}%</strong> mastery.
      </p>

      <Progress value={currentPercentage} showValue label="Current Proficiency" color="cyan" className="mb-4" />

      <div className="bg-kth-slate-50 p-3.5 rounded-lg border border-kth-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <BookOpen className="w-4 h-4 text-kth-primary-600 shrink-0" />
          <span className="font-medium text-kth-slate-800 truncate">{recommendedResource}</span>
        </div>
        <Button variant="ghost" size="sm" className="text-xs shrink-0" onClick={() => window.location.href = '/knowledge'}>
          Explore Resource <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
};
