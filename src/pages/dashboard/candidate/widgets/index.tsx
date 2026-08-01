import type { DashboardWidget } from './widgetTypes';
import { 
  Award, Eye, FileText, CheckCircle, TrendingUp, Briefcase, 
  Brain, BookOpen, ShoppingBag, Bell, Compass, Clock, 
  DollarSign, CheckSquare, Calendar, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

// 1. Hero Widget
export const HeroWidget: DashboardWidget = {
  id: 'hero-widget',
  title: 'Career Summary',
  description: 'Displays basic profile headline, location and summary.',
  icon: 'User',
  category: 'Profile',
  priority: 1,
  permission: 'candidate',
  analyticsKey: 'hero_widget_opened',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const profile = actions?.profile || {};
    return (
      <div className="bg-gradient-to-r from-emerald-650 to-emerald-500 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center font-black text-xl">
            {profile.first_name?.[0] || 'C'}
          </div>
          <div>
            <h2 className="text-lg font-black font-heading flex items-center gap-1.5">
              Welcome back, {profile.first_name || 'Candidate'}!
              <span className="bg-white/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wide">
                Verified
              </span>
            </h2>
            <p className="text-xs text-emerald-100 font-semibold mt-0.5">
              {profile.headline || 'Senior Product Architect'} &bull; {profile.location || 'Mumbai, MH'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/candidate/profile">
            <button className="bg-white text-emerald-700 font-black text-xs px-4 py-2 rounded-xl shadow-sm hover:bg-emerald-50 transition cursor-pointer">
              Edit Career Profile
            </button>
          </Link>
        </div>
      </div>
    );
  }
};

// 2. Profile Strength Widget
export const ProfileStrengthWidget: DashboardWidget = {
  id: 'profile-strength-widget',
  title: 'Profile Progress',
  description: 'Deterministic calculator showing completeness scores.',
  icon: 'Award',
  category: 'Profile',
  priority: 2,
  permission: 'candidate',
  analyticsKey: 'profile_strength_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const result = actions?.scoreResult || {};
    const percent = result.completion?.completionPercentage || 40;
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-black text-gray-900 text-xs flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" /> PROFILE COMPLETENESS
          </h3>
          <span className="text-xs font-black text-emerald-600">{percent}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${percent}%` }} />
        </div>
        {result.completion?.missingSections?.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-solid border-slate-50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Suggested Actions</span>
            <ul className="space-y-1">
              {result.completion.priorityActions.slice(0, 2).map((act: string, idx: number) => (
                <li key={idx} className="text-[11px] font-bold text-gray-650 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                  {act}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
};

// 3. Career Score Widget
export const CareerScoreWidget: DashboardWidget = {
  id: 'career-score-widget',
  title: 'Overall Career Index',
  description: 'Calculates the overall Career Index score.',
  icon: 'Star',
  category: 'Career',
  priority: 3,
  permission: 'candidate',
  analyticsKey: 'career_score_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const result = actions?.scoreResult || {};
    const overall = result.overallCareerScore || 50;
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Overall Career Index</h4>
          <span className="text-2xl font-black text-gray-900 leading-none">{overall}</span>
          <p className="text-[10px] text-gray-450 font-semibold mt-1">Aggregated scoring profile</p>
        </div>
        <div className="w-12 h-12 rounded-full border-4 border-solid border-slate-100 flex items-center justify-center font-black text-sm text-primary">
          {overall}
        </div>
      </div>
    );
  }
};

// 4. Recruiter Visibility Widget
export const RecruiterVisibilityWidget: DashboardWidget = {
  id: 'recruiter-visibility-widget',
  title: 'Recruiter Visibility',
  description: 'Shows status of candidate searches.',
  icon: 'Eye',
  category: 'Career',
  priority: 4,
  permission: 'candidate',
  analyticsKey: 'recruiter_visibility_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const result = actions?.scoreResult || {};
    const score = result.recruiterScore || 40;
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-400">
          <Eye className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-wider">Recruiter Visibility</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-gray-900">{score}%</span>
          <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase">Active</span>
        </div>
        <p className="text-[11px] text-gray-500 font-medium">Your profile ranks high in local frontend searches.</p>
      </div>
    );
  }
};

// 5. Resume Health Widget
export const ResumeHealthWidget: DashboardWidget = {
  id: 'resume-health-widget',
  title: 'Resume Index',
  description: 'Displays formatting and structural strength index.',
  icon: 'FileText',
  category: 'Career',
  priority: 5,
  permission: 'candidate',
  analyticsKey: 'resume_health_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const result = actions?.scoreResult || {};
    const score = result.atsScore || 50;
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-400">
          <FileText className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-wider">Resume Parsing Index</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-gray-900">{score}/100</span>
          <span className="text-[10px] text-emerald-600 font-bold">Optimal</span>
        </div>
        <p className="text-[11px] text-gray-500 font-medium">Keywords optimized for standard ATS parsing rules.</p>
      </div>
    );
  }
};

// 6. Skills Gap Widget
export const SkillsGapWidget: DashboardWidget = {
  id: 'skills-gap-widget',
  title: 'Competency Analysis',
  description: 'Tracks pending skill acquisition goals.',
  icon: 'CheckCircle',
  category: 'Career',
  priority: 6,
  permission: 'candidate',
  analyticsKey: 'skills_gap_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const result = actions?.scoreResult || {};
    const gaps = result.skillsGapCount || 2;
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-slate-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-wider">Skills Gap Index</span>
        </div>
        <span className="text-2xl font-black text-gray-900">{gaps} Pending</span>
        <p className="text-[10px] text-slate-400 font-bold">Acquire recommended skills to boost matched scores.</p>
      </div>
    );
  }
};

// 7. Career Analytics Widget
export const CareerAnalyticsWidget: DashboardWidget = {
  id: 'career-analytics-widget',
  title: 'Engagement Performance',
  description: 'Visualizes click throughs and applications performance.',
  icon: 'TrendingUp',
  category: 'Analytics',
  priority: 7,
  permission: 'candidate',
  analyticsKey: 'career_analytics_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, _actions) {
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-4 col-span-full">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600" /> Platform Insights
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] font-black text-slate-400 uppercase">CV Downloads</span>
            <p className="text-lg font-black text-slate-800 mt-1">19</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] font-black text-slate-400 uppercase">Views</span>
            <p className="text-lg font-black text-slate-800 mt-1">142</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] font-black text-slate-400 uppercase">Response Rate</span>
            <p className="text-lg font-black text-slate-800 mt-1">94%</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[10px] font-black text-slate-400 uppercase">Applications</span>
            <p className="text-lg font-black text-slate-800 mt-1">1</p>
          </div>
        </div>
      </div>
    );
  }
};

// 8. Job Activity Widget
export const JobActivityWidget: DashboardWidget = {
  id: 'job-activity-widget',
  title: 'Active Job Openings',
  description: 'Shows status of submitted, short-listed applications.',
  icon: 'Briefcase',
  category: 'Jobs',
  priority: 8,
  permission: 'candidate',
  analyticsKey: 'job_activity_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, _actions) {
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-emerald-600" /> ACTIVE APPLICATIONS
        </h4>
        <div className="border border-solid border-slate-100 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <h5 className="text-xs font-black text-slate-800">Senior Frontend Architect</h5>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Tech Solutions Inc &bull; Mumbai, MH</p>
          </div>
          <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            Under Review
          </span>
        </div>
      </div>
    );
  }
};

// 9. AI Insights Widget
export const AIInsightsWidget: DashboardWidget = {
  id: 'ai-insights-widget',
  title: 'Gemini Copilot Insights',
  description: 'Lists automated suggestions from OpenAI or Gemini.',
  icon: 'Brain',
  category: 'AI',
  priority: 9,
  permission: 'candidate',
  analyticsKey: 'ai_insights_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const suggestions = actions?.insights?.suggestions || [
      'Detail your technical stack across projects.',
      'Quantify team leadership experiences.',
      'Improve headline to match primary role competencies.'
    ];
    return (
      <div className="bg-slate-900 border border-solid border-slate-800 rounded-2xl p-5 text-white space-y-4">
        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <Brain className="w-4 h-4" /> AI RECOMMENDATIONS
        </h4>
        <ul className="space-y-3">
          {suggestions.map((s: string, idx: number) => (
            <li key={idx} className="text-xs text-slate-300 font-medium flex items-start gap-2.5">
              <span className="text-emerald-400 font-black shrink-0">{idx + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
};

// 10. Knowledge Hub Widget
export const KnowledgeHubWidget: DashboardWidget = {
  id: 'knowledge-hub-widget',
  title: 'Career Resources',
  description: 'Career intelligence notes, template resources.',
  icon: 'BookOpen',
  category: 'Knowledge',
  priority: 10,
  permission: 'candidate',
  analyticsKey: 'knowledge_hub_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, _actions) {
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" /> STUDY HUB SUGGESTIONS
        </h4>
        <div className="space-y-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-solid border-slate-100 flex flex-col">
            <span className="text-[9px] font-black text-primary uppercase">Article</span>
            <span className="text-xs font-black text-slate-800 mt-1">Cracking the Technical Architecture Interview</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Read time: 5 mins</p>
          </div>
        </div>
      </div>
    );
  }
};

// 11. Marketplace Widget
export const MarketplaceWidget: DashboardWidget = {
  id: 'marketplace-widget',
  title: 'Monetized Career Services',
  description: 'Offers and purchases lists.',
  icon: 'ShoppingBag',
  category: 'Marketplace',
  priority: 11,
  permission: 'candidate',
  analyticsKey: 'marketplace_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, _actions) {
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-600" /> PREMIUM MARKETPLACE
        </h4>
        <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between gap-4">
          <div>
            <h5 className="text-xs font-black text-slate-800">Advanced Resume Review</h5>
            <p className="text-[10px] text-slate-400">Get detailed structural feedback from experts.</p>
          </div>
          <span className="text-xs font-black text-primary shrink-0">$49</span>
        </div>
      </div>
    );
  }
};

// 12. Notifications Widget
export const NotificationsWidget: DashboardWidget = {
  id: 'notifications-widget',
  title: 'Alerts Notifications',
  description: 'Shows unread notification counts.',
  icon: 'Bell',
  category: 'Notifications',
  priority: 12,
  permission: 'candidate',
  analyticsKey: 'notifications_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, _actions) {
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600" /> INBOX ALERTS
        </h4>
        <div className="p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-600">
          No new notifications.
        </div>
      </div>
    );
  }
};

// 13. Quick Actions Widget
export const QuickActionsWidget: DashboardWidget = {
  id: 'quick-actions-widget',
  title: 'Shortcut Dashboard Links',
  description: 'Quick link actions cards.',
  icon: 'Compass',
  category: 'System',
  priority: 13,
  permission: 'candidate',
  analyticsKey: 'quick_actions_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, _actions) {
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-4 col-span-full">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-emerald-600" /> QUICK SHORTCUTS
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/dashboard/candidate/profile" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-center transition">
            <span className="text-xs font-black text-slate-800">Edit Profile</span>
          </Link>
          <Link to="/dashboard/candidate/jobs" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-center transition">
            <span className="text-xs font-black text-slate-800">Find Jobs</span>
          </Link>
          <Link to="/dashboard/candidate/alerts" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-center transition">
            <span className="text-xs font-black text-slate-800">Job Alerts</span>
          </Link>
          <Link to="/dashboard/candidate/settings" className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-center transition">
            <span className="text-xs font-black text-slate-800">Account Settings</span>
          </Link>
        </div>
      </div>
    );
  }
};

// 14. Recent Activity Widget
export const RecentActivityWidget: DashboardWidget = {
  id: 'recent-activity-widget',
  title: 'Activity Chronology Feed',
  description: 'Recent candidate operations feed.',
  icon: 'Clock',
  category: 'System',
  priority: 14,
  permission: 'candidate',
  analyticsKey: 'recent_activity_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, _actions) {
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-4 col-span-full">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-600" /> RECENT ACTIVITY TIMELINE
        </h4>
        <div className="space-y-4 relative border-l-2 border-solid border-slate-100 pl-4 ml-2">
          <div className="relative">
            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-solid border-white" />
            <span className="text-[10px] text-slate-400 font-bold block">Just now</span>
            <span className="text-xs font-bold text-slate-700 block">Completed Candidate Onboarding Flow</span>
          </div>
        </div>
      </div>
    );
  }
};

// 15. New Widget: Resume Analyzer Widget
export const ResumeAnalyzerWidget: DashboardWidget = {
  id: 'resume-analyzer-widget',
  title: 'ATS Analyzer Engine',
  description: 'Evaluates ATS parsing score and missing keywords.',
  icon: 'FileText',
  category: 'AI',
  priority: 15,
  permission: 'candidate',
  analyticsKey: 'resume_widget_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const model = actions?.resumeModel || {
      healthScore: 82,
      atsScore: 78,
      missingKeywords: ['GraphQL', 'Next.js Router'],
      topRecommendations: ['Incorporate generic repositories definitions.']
    };
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-emerald-650" /> ATS RESUME HEALTH
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-650">Score Index</span>
          <span className="text-sm font-black text-emerald-650">{model.healthScore}/100</span>
        </div>
        {model.missingKeywords.length > 0 && (
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase">Missing Target Keywords</span>
            <div className="flex flex-wrap gap-1">
              {model.missingKeywords.map((kw: string) => (
                <span key={kw} className="bg-red-50 text-red-750 text-[9px] font-bold px-2 py-0.5 rounded">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
};

// 16. New Widget: Career Roadmap Widget
export const CareerRoadmapWidget: DashboardWidget = {
  id: 'career-roadmap-widget',
  title: 'Milestone Progress Tracker',
  description: 'Visualizes the next milestones in the target career path.',
  icon: 'Compass',
  category: 'AI',
  priority: 16,
  permission: 'candidate',
  analyticsKey: 'roadmap_widget_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const model = actions?.roadmapModel || {
      nextMilestone: 'Phase 1: React Contexts & Decorators',
      progress: 33,
      timeline: '2 Months',
      upcomingObjective: 'Align state with RLS boundaries'
    };
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-emerald-650" /> LEARNING PATH ROADMAP
        </h4>
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold block">Next Objective</span>
          <span className="text-xs font-black text-slate-800 block">{model.nextMilestone}</span>
          <span className="text-[10px] text-emerald-600 font-semibold block">{model.timeline} &bull; {model.upcomingObjective}</span>
        </div>
      </div>
    );
  }
};

// 17. New Widget: Weekly Goals Widget
export const WeeklyGoalWidget: DashboardWidget = {
  id: 'weekly-goal-widget',
  title: 'Personalized Goals Checklist',
  description: 'Displays the candidates weekly prioritized tasks list.',
  icon: 'CheckSquare',
  category: 'System',
  priority: 17,
  permission: 'candidate',
  analyticsKey: 'weekly_goal_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const model = actions?.weeklyModel || {
      goals: [
        { id: 'g1', title: 'Complete Supabase Repository', isCompleted: false, priority: 'High', dueDate: 'Friday' },
        { id: 'g2', title: 'Upload resume PDF', isCompleted: true, priority: 'Medium', dueDate: 'Sunday' }
      ]
    };
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <CheckSquare className="w-4 h-4 text-emerald-650" /> WEEKLY OBJECTIVES
        </h4>
        <ul className="space-y-2">
          {model.goals.map((g: any) => (
            <li key={g.id} className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-lg">
              <span className={`text-xs font-bold ${g.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {g.title}
              </span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${g.priority === 'High' ? 'bg-red-50 text-red-750' : 'bg-slate-100 text-slate-600'}`}>
                {g.dueDate}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
};

// 18. New Widget: Learning Progress Widget
export const LearningProgressWidget: DashboardWidget = {
  id: 'learning-progress-widget',
  title: 'Active Certifications and Hub Resources',
  description: 'Displays in progress and recommended studies.',
  icon: 'BookOpen',
  category: 'Knowledge',
  priority: 18,
  permission: 'candidate',
  analyticsKey: 'learning_progress_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const model = actions?.learningModel || {
      activeLearningTitle: 'Mastering Advanced React Systems',
      certificationsInProgress: ['AWS Certified Solutions Architect'],
      hubRecommendationsCount: 2
    };
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-emerald-650" /> ACTIVE STUDY PROGRESS
        </h4>
        <div className="p-3 bg-emerald-50/50 rounded-xl">
          <span className="text-[9px] font-black text-emerald-700 uppercase">Current Course</span>
          <h5 className="text-xs font-black text-slate-800 mt-1">{model.activeLearningTitle}</h5>
        </div>
      </div>
    );
  }
};

// 19. New Widget: Recommended Certifications Widget
export const RecommendedCertificationsWidget: DashboardWidget = {
  id: 'recommended-certs-widget',
  title: 'Curated Badges Recommendations',
  description: 'Certification paths mapped to target skills.',
  icon: 'Award',
  category: 'Knowledge',
  priority: 19,
  permission: 'candidate',
  analyticsKey: 'recommended_certs_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const model = actions?.certsModel || {
      certs: [
        { name: 'AWS Certified Solutions Architect', priority: 'High', expectedImpact: 'Boost matching probability' }
      ]
    };
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-650" /> SUGGESTED CERTIFICATIONS
        </h4>
        {model.certs.map((c: any, idx: number) => (
          <div key={idx} className="border border-solid border-slate-100 rounded-xl p-3 flex items-center justify-between gap-3">
            <div>
              <h5 className="text-xs font-black text-slate-800">{c.name}</h5>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{c.expectedImpact}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-350" />
          </div>
        ))}
      </div>
    );
  }
};

// 20. New Widget: Salary Insights Widget
export const SalaryInsightsWidget: DashboardWidget = {
  id: 'salary-insights-widget',
  title: 'Benchmarked Salary Estimates',
  description: 'Exposes local role salary indicators.',
  icon: 'DollarSign',
  category: 'Career',
  priority: 20,
  permission: 'candidate',
  analyticsKey: 'salary_insights_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const model = actions?.salaryModel || {
      currentEstimate: 110000,
      growthOpportunities: ['Upgrade key architecture skills.'],
      improvementFactors: ['Add TypeScript Generics Mastery']
    };
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-emerald-650" /> SALARY BENCHMARK INDEX
        </h4>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-gray-900">${model.currentEstimate.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-600 font-bold">Median Base</span>
        </div>
        <p className="text-[10px] text-slate-400 font-semibold">{model.growthOpportunities[0]}</p>
      </div>
    );
  }
};

// 21. New Widget: Interview Readiness Widget
export const InterviewReadinessWidget: DashboardWidget = {
  id: 'interview-readiness-widget',
  title: 'Mock Interview Prep Readiness',
  description: 'Readiness checklists, topic outlines.',
  icon: 'CheckCircle',
  category: 'AI',
  priority: 21,
  permission: 'candidate',
  analyticsKey: 'interview_readiness_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const model = actions?.interviewModel || {
      readinessScore: 78,
      checklist: ['React Contexts', 'TypeScript Generics'],
      practiceRecommendations: ['How do you resolve casing errors?']
    };
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-650" /> INTERVIEW READINESS
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-650">Score Index</span>
          <span className="text-sm font-black text-emerald-600">{model.readinessScore}%</span>
        </div>
      </div>
    );
  }
};

// 22. New Widget: Trending Skills Widget
export const TrendingSkillsWidget: DashboardWidget = {
  id: 'trending-skills-widget',
  title: 'Trending Industry Skills Registry',
  description: 'Exposes in-demand skills mapped to local roles.',
  icon: 'TrendingUp',
  category: 'AI',
  priority: 22,
  permission: 'candidate',
  analyticsKey: 'trending_skills_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const model = actions?.trendingModel || {
      skills: [
        { name: 'TypeScript', demand: 'high' },
        { name: 'Supabase RLS', demand: 'high' }
      ]
    };
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-650" /> TRENDING SKILLS
        </h4>
        <div className="flex flex-wrap gap-2">
          {model.skills.map((s: any) => (
            <span key={s.name} className="bg-slate-50 text-slate-700 text-[10px] font-black px-2 py-1 rounded-lg border border-solid border-slate-100 flex items-center gap-1">
              {s.name}
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            </span>
          ))}
        </div>
      </div>
    );
  }
};

// 23. New Widget: Career Timeline Widget
export const CareerTimelineWidget: DashboardWidget = {
  id: 'career-timeline-widget',
  title: 'Milestones Activity Timeline',
  description: 'Roadmaps timeline list.',
  icon: 'Calendar',
  category: 'System',
  priority: 23,
  permission: 'candidate',
  analyticsKey: 'timeline_widget_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const model = actions?.timelineModel || {
      milestones: [
        { title: 'Core Tooling Phase', date: '2 Months', status: 'in-progress' }
      ]
    };
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-650" /> CAREER MILESTONES FEED
        </h4>
        <div className="space-y-3 border-l-2 border-solid border-slate-100 pl-4 ml-2">
          {model.milestones.map((m: any, idx: number) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-solid border-white" />
              <span className="text-[10px] text-slate-400 font-bold block">{m.date}</span>
              <span className="text-xs font-bold text-slate-750 block">{m.title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
};

// 24. New Widget: Upcoming Deadlines Widget
export const UpcomingDeadlinesWidget: DashboardWidget = {
  id: 'upcoming-deadlines-widget',
  title: 'Task and application deadlines tracker',
  description: 'Lists dates for certification goals and applications.',
  icon: 'Clock',
  category: 'System',
  priority: 24,
  permission: 'candidate',
  analyticsKey: 'deadlines_widget_viewed',
  isEnabled: true,
  async load() { return {}; },
  render(_data, actions) {
    const model = actions?.deadlinesModel || {
      deadlines: [
        { title: 'Resume Review Upload', date: 'Friday', category: 'goals' }
      ]
    };
    return (
      <div className="bg-white border border-gray-150 border-solid rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-650" /> PENDING DEADLINES
        </h4>
        <ul className="space-y-2">
          {model.deadlines.map((d: any, idx: number) => (
            <li key={idx} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase block">{d.category}</span>
                <span className="text-xs font-bold text-slate-750 block mt-0.5">{d.title}</span>
              </div>
              <span className="text-[10px] font-black text-slate-500 bg-white border border-solid border-slate-100 px-2 py-0.5 rounded">
                {d.date}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
};
export default HeroWidget;
