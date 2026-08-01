import type { ResumeAnalysis } from '../resume/resumeTypes';
import type { CareerCoachResponse } from '../ai/careerCoachTypes';

// 1. View Model Declarations
export interface ResumeAnalyzerWidgetModel {
  healthScore: number;
  atsScore: number;
  missingKeywords: string[];
  topRecommendations: string[];
}

export interface CareerRoadmapWidgetModel {
  nextMilestone: string;
  progress: number;
  timeline: string;
  upcomingObjective: string;
}

export interface WeeklyGoalsWidgetModel {
  goals: { id: string; title: string; isCompleted: boolean; priority: string; dueDate: string }[];
  completionPercentage: number;
}

export interface LearningProgressWidgetModel {
  activeLearningTitle: string;
  certificationsInProgress: string[];
  hubRecommendationsCount: number;
}

export interface RecommendedCertificationsWidgetModel {
  certs: { name: string; priority: string; expectedImpact: string }[];
}

export interface SalaryInsightsWidgetModel {
  currentEstimate: number;
  growthOpportunities: string[];
  improvementFactors: string[];
}

export interface InterviewReadinessWidgetModel {
  readinessScore: number;
  checklist: string[];
  practiceRecommendations: string[];
}

export interface TrendingSkillsWidgetModel {
  skills: { name: string; demand: 'high' | 'medium' | 'low'; learningUrl?: string }[];
}

export interface CareerTimelineWidgetModel {
  milestones: { title: string; date: string; status: string }[];
}

export interface UpcomingDeadlinesWidgetModel {
  deadlines: { title: string; date: string; category: string }[];
}

// 2. Adapters
export class ResumeWidgetAdapter {
  static adapt(analysis: ResumeAnalysis): ResumeAnalyzerWidgetModel {
    return {
      healthScore: analysis.health.score,
      atsScore: analysis.ats.score,
      missingKeywords: analysis.keywords.filter(k => !k.found).map(k => k.keyword),
      topRecommendations: analysis.recommendations.map(r => r.suggestion)
    };
  }
}

export class CareerCoachWidgetAdapter {
  static adapt(coachRes: CareerCoachResponse): {
    roadmap: CareerRoadmapWidgetModel;
    weekly: WeeklyGoalsWidgetModel;
    learning: LearningProgressWidgetModel;
    certs: RecommendedCertificationsWidgetModel;
    salary: SalaryInsightsWidgetModel;
    interview: InterviewReadinessWidgetModel;
    trending: TrendingSkillsWidgetModel;
    timeline: CareerTimelineWidgetModel;
    deadlines: UpcomingDeadlinesWidgetModel;
  } {
    const nextMilestone = coachRes.roadmap.milestones[0]?.phase || 'Phase 1';
    const upcomingObjective = coachRes.roadmap.milestones[0]?.focus || 'Start Initial Learning';

    return {
      roadmap: {
        nextMilestone,
        progress: 33,
        timeline: coachRes.roadmap.milestones[0]?.duration || '2 Months',
        upcomingObjective
      },
      weekly: {
        goals: coachRes.weeklyGoals.map(g => ({
          id: g.id,
          title: g.title,
          isCompleted: g.isCompleted,
          priority: g.dueDate === 'Friday' ? 'High' : 'Medium',
          dueDate: g.dueDate
        })),
        completionPercentage: 50
      },
      learning: {
        activeLearningTitle: coachRes.learningRecommendations[0]?.title || 'Mastering Advanced React',
        certificationsInProgress: coachRes.certificationRecommendations.map(c => c.name),
        hubRecommendationsCount: coachRes.learningRecommendations.length
      },
      certs: {
        certs: coachRes.certificationRecommendations.map(c => ({
          name: c.name,
          priority: c.relevanceScore >= 90 ? 'High' : 'Medium',
          expectedImpact: `Increase matching potential by ${c.relevanceScore}%`
        }))
      },
      salary: {
        currentEstimate: coachRes.salaryInsight.percentile50,
        growthOpportunities: [coachRes.salaryInsight.advice],
        improvementFactors: ['Add TypeScript Generics Mastery', 'Obtain AWS Certified Solutions Architect']
      },
      interview: {
        readinessScore: 78,
        checklist: coachRes.interviewPlan.technicalTopics.concat(coachRes.interviewPlan.hrTopics),
        practiceRecommendations: coachRes.interviewPlan.mockQuestions
      },
      trending: {
        skills: [
          { name: 'TypeScript', demand: 'high' },
          { name: 'Supabase RLS', demand: 'high' },
          { name: 'React Server Components', demand: 'high' }
        ]
      },
      timeline: {
        milestones: coachRes.roadmap.milestones.map(m => ({
          title: m.phase,
          date: m.duration,
          status: m.status
        }))
      },
      deadlines: {
        deadlines: [
          { title: 'Resume Review Upload', date: 'Friday', category: 'goals' },
          { title: 'Tech Solutions Application Review', date: '10 Days', category: 'applications' }
        ]
      }
    };
  }
}
