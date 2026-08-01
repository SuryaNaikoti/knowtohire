import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Loading } from '../../../components/ui/Loading';
import { careerIntelligenceService } from '../../../lib/services/CareerIntelligenceService';
import { aiCareerCoachService } from '../../../lib/services/ai/AICareerCoachService';
import { resumeAnalyzerService } from '../../../lib/services/resume/ResumeAnalyzerService';
import { candidateService } from '../../../lib/services/candidateService';
import { projectsService } from '../../../lib/services/projectsService';
import { analyticsService } from '../../../lib/services/analyticsService';
import { ResumeWidgetAdapter, CareerCoachWidgetAdapter } from '../../../lib/services/dashboard/dashboardAdapters';
import { ROUTES } from '../../../constants/routes';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Award, FileText, CheckCircle, TrendingUp, Briefcase, 
  Brain, Compass, CheckSquare, Calendar, ChevronRight, 
  User, Star, Sparkles, Check, Bookmark, ArrowRight, Zap, X
} from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [scoreResult, setScoreResult] = useState<any>(null);
  const [widgetModels, setWidgetModels] = useState<any>({});
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D' | '1Y'>('7D');
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  
  // Interactive checklist state for AI Today's Priorities
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Improve ATS Resume Score to 85+', completed: true, route: '/dashboard/candidate/resume-analyzer', impact: '+12% ATS', time: '10m' },
    { id: 2, text: 'Add 2 high-impact Portfolio Projects', completed: false, route: ROUTES.DASHBOARD.CANDIDATE.PROJECTS, impact: '+15% Views', time: '20m' },
    { id: 3, text: 'Complete Docker & Kubernetes Basics', completed: false, route: ROUTES.RESOURCES, impact: '+8% Salary', time: '45m' },
    { id: 4, text: 'Apply to top 3 matched Senior Architect roles', completed: false, route: ROUTES.DASHBOARD.CANDIDATE.JOBS, impact: 'High Priority', time: '15m' }
  ]);

  const toggleTask = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile) return;
      try {
        setLoading(true);

        analyticsService.track({
          event_type: 'click',
          event_category: 'auth',
          properties: { action: 'Dashboard Opened' }
        });

        const [education, experience, certifications, projects] = await Promise.all([
          candidateService.getEducation(profile.id),
          candidateService.getExperience(profile.id),
          candidateService.getCertifications(profile.id),
          projectsService.getProjects(profile.id)
        ]);

        const mockSkills = [
          { skill_name: 'React', years_of_experience: 8, competency_level: 'Expert' },
          { skill_name: 'TypeScript', years_of_experience: 6, competency_level: 'Expert' },
          { skill_name: 'Next.js', years_of_experience: 4, competency_level: 'Intermediate' }
        ];

        const score = careerIntelligenceService.computeCareerScore(
          profile,
          education,
          experience,
          certifications,
          projects,
          mockSkills
        );
        setScoreResult(score);

        const analysis = await resumeAnalyzerService.analyzeResume(
          'resume.pdf',
          204800,
          'application/pdf',
          '',
          (profile as any).title || 'Senior Software Engineer'
        );
        const resumeModel = ResumeWidgetAdapter.adapt(analysis);

        const coachAdvice = await aiCareerCoachService.getCoachAdvice(
          profile.id,
          (profile as any).title || 'Senior Software Engineer',
          5,
          ['React', 'TypeScript'],
          '',
          score.completion.completionPercentage
        );
        const coachModels = CareerCoachWidgetAdapter.adapt(coachAdvice);

        setWidgetModels({
          resumeModel,
          roadmapModel: coachModels.roadmap,
          weeklyModel: coachModels.weekly,
          learningModel: coachModels.learning,
          certsModel: coachModels.certs,
          salaryModel: coachModels.salary,
          interviewModel: coachModels.interview,
          trendingModel: coachModels.trending,
          timelineModel: coachModels.timeline,
          deadlinesModel: coachModels.deadlines
        });
      } catch (err) {
        console.error('Failed to load candidate dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile]);

  if (loading || !scoreResult) {
    return <Loading label="Initializing AI Career Operating System..." />;
  }

  const resumeModel = widgetModels.resumeModel || { healthScore: 80, atsScore: 82, missingKeywords: ['GraphQL', 'Kubernetes'], topRecommendations: ['Quantify metrics in past work experiences'] };
  const certsModel = widgetModels.certsModel || { certs: [{ name: 'AWS Cloud Solutions Architect', priority: 'High', expectedImpact: '+18% Recruiters Match' }] };
  const interviewModel = widgetModels.interviewModel || { readinessScore: 78, checklist: ['React Contexts', 'Supabase RLS'], practiceRecommendations: [] };
  const trendingModel = widgetModels.trendingModel || { skills: [{ name: 'TypeScript', demand: 'high' }, { name: 'Next.js', demand: 'high' }, { name: 'Docker', demand: 'medium' }] };

  const careerScoreValue = scoreResult.overallCareerScore || 72;
  const visibilityScoreValue = scoreResult.recruiterScore || 15;
  const candidateStage = (profile as any)?.title?.toLowerCase().includes('senior') ? 'Senior Professional' : 'Mid-Level Specialist';

  // Timeframe chart datasets
  const chartDatasets = {
    '7D': [
      { label: 'Mon', value: 12 }, { label: 'Tue', value: 18 }, { label: 'Wed', value: 28 },
      { label: 'Thu', value: 24 }, { label: 'Fri', value: 36 }, { label: 'Sat', value: 20 }, { label: 'Sun', value: 42 }
    ],
    '30D': [
      { label: 'W1', value: 85 }, { label: 'W2', value: 110 }, { label: 'W3', value: 142 }, { label: 'W4', value: 168 }
    ],
    '90D': [
      { label: 'Month 1', value: 240 }, { label: 'Month 2', value: 380 }, { label: 'Month 3', value: 490 }
    ],
    '1Y': [
      { label: 'Q1', value: 820 }, { label: 'Q2', value: 1140 }, { label: 'Q3', value: 1480 }, { label: 'Q4', value: 1920 }
    ]
  };

  const activeDataset = chartDatasets[timeframe];

  return (
    <div className="space-y-6 sm:space-y-8 bg-[#F9FAFB] dark:bg-slate-950 min-h-screen p-2 sm:p-6 font-sans text-slate-900 dark:text-slate-100 transition-colors animate-fade-in relative">
      
      {/* 1. EXECUTIVE COMMAND CENTER HERO */}
      <div className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Good Morning, {profile?.first_name || 'Surya'} 👋
              </h1>
              <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-solid border-emerald-200 dark:border-emerald-800">
                {candidateStage} Profile
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xl">
              Your AI Career OS has generated 4 strategic actions to accelerate your job search target today.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to={ROUTES.DASHBOARD.CANDIDATE.PORTFOLIO}>
              <button 
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Navigate to profile completion page"
              >
                <User className="w-3.5 h-3.5" /> Complete Profile
              </button>
            </Link>
            <Link to="/candidate/resume-builder">
              <button 
                className="bg-white dark:bg-slate-800 border border-solid border-slate-250 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
                aria-label="Navigate to resume upload page"
              >
                <FileText className="w-3.5 h-3.5" /> Upload Resume
              </button>
            </Link>
          </div>
        </div>

        {/* Executive Status Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-solid border-slate-100 dark:border-slate-800">
          <Link to="/dashboard/candidate/assistant" className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 rounded-xl border border-solid border-slate-100/80 dark:border-slate-700/60 transition group">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Career Score</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 block">{careerScoreValue} Index</span>
          </Link>
          <Link to="/dashboard/candidate/resume-analyzer" className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 rounded-xl border border-solid border-slate-100/80 dark:border-slate-700/60 transition group">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block group-hover:text-blue-700 dark:group-hover:text-blue-400">Resume Health</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{resumeModel.healthScore}/100</span>
          </Link>
          <Link to="/dashboard/candidate/interview-prep" className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 rounded-xl border border-solid border-slate-100/80 dark:border-slate-700/60 transition group">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block group-hover:text-blue-700 dark:group-hover:text-blue-400">Next Interview</span>
            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 block">Tomorrow 10 AM</span>
          </Link>
          <Link to={ROUTES.DASHBOARD.CANDIDATE.JOBS} className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-solid border-slate-100/80 dark:border-slate-700/60 transition">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Applications</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 block">1 Active</span>
          </Link>
          <Link to="/dashboard/candidate/assistant" className="p-2.5 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 rounded-xl border border-solid border-slate-100/80 dark:border-slate-700/60 transition col-span-2 sm:col-span-1 group">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Today's Forecast</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">+₹4.2L Salary Impact</span>
          </Link>
        </div>
      </div>

      {/* 2. TOP KPI ROW WITH MICRO VISUALIZATIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* KPI 1: Career Score */}
        <Link 
          to="/dashboard/candidate/assistant"
          className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 relative overflow-hidden transition-all hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md block group cursor-pointer"
          aria-label="View Career Intelligence Assistant report"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-700 dark:group-hover:text-slate-200">Career Score</span>
            <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">Top 12%</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{careerScoreValue}</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              ▲ +8 <span className="text-[10px] text-slate-400 font-medium">this mo</span>
            </span>
          </div>
          <div className="h-6 w-full flex items-end gap-1 pt-1">
            {[40, 52, 48, 62, 58, 70, 72].map((v, i) => (
              <div key={i} className="flex-1 bg-emerald-100 dark:bg-emerald-950 group-hover:bg-emerald-500 rounded-t transition-all" style={{ height: `${(v / 80) * 100}%` }} />
            ))}
          </div>
        </Link>

        {/* KPI 2: Resume Health */}
        <Link 
          to="/dashboard/candidate/resume-analyzer"
          className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 transition-all hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md block group cursor-pointer"
          aria-label="View detailed Resume Health report"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-700 dark:group-hover:text-slate-200">Resume Health</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{resumeModel.healthScore}/100</span>
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100 dark:text-slate-800" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-blue-600 dark:text-blue-400" strokeDasharray={`${resumeModel.healthScore}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Optimal ATS Parsing Format</p>
        </Link>

        {/* KPI 3: Job Match % */}
        <Link 
          to="/dashboard/candidate/job-matches"
          className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 transition-all hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-md block group cursor-pointer"
          aria-label="View Job Match Report"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-700 dark:group-hover:text-slate-200">Job Match %</span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">92%</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">High</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full" style={{ width: '92%' }} />
          </div>
        </Link>

        {/* KPI 4: Recruiter Visibility */}
        <Link 
          to={ROUTES.DASHBOARD.CANDIDATE.PORTFOLIO}
          className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 transition-all hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md block group cursor-pointer"
          aria-label="View Recruiter Visibility report"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-700 dark:group-hover:text-slate-200">Recruiter Visibility</span>
            <User className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{visibilityScoreValue}%</span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">142 views</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Active in local search queries</p>
        </Link>

        {/* KPI 5: Applications */}
        <Link 
          to={ROUTES.DASHBOARD.CANDIDATE.JOBS}
          className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md block group cursor-pointer"
          aria-label="View Active Job Applications"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-700 dark:group-hover:text-slate-200">Applications</span>
            <Briefcase className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">1 Active</span>
            <span className="text-[9px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold px-1.5 py-0.5 rounded uppercase">In Review</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 flex-1 bg-blue-600 rounded-full" />
            <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
            <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
          </div>
        </Link>

        {/* KPI 6: Interview Readiness */}
        <Link 
          to="/dashboard/candidate/interview-prep"
          className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 transition-all hover:border-rose-300 dark:hover:border-rose-600 hover:shadow-md block group cursor-pointer"
          aria-label="View Interview Readiness Details"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-700 dark:group-hover:text-slate-200">Interview Readiness</span>
            <CheckCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{interviewModel.readinessScore}%</span>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">Ready</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full" style={{ width: `${interviewModel.readinessScore}%` }} />
          </div>
        </Link>

      </div>

      {/* 3. MAIN DASHBOARD GRID (12 Columns Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">

          {/* THE HERO CENTERPIECE: AI CAREER INTELLIGENCE */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-solid border-emerald-500/30 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-solid border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-solid border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
                    AI CAREER INTELLIGENCE OPERATING SYSTEM
                  </h2>
                  <p className="text-xs text-slate-400">Personalized real-time daily career execution directives</p>
                </div>
              </div>

              <div className="bg-emerald-950/80 border border-solid border-emerald-500/40 px-3 py-1.5 rounded-xl text-right">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">Role Readiness</span>
                <span className="text-xs font-black text-white">82% Match Senior React Architect</span>
              </div>
            </div>

            {/* Today's Actionable Tasks */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Today's Recommended Execution Tasks
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => navigate(task.route)}
                    className={`p-3 rounded-xl border border-solid text-left flex items-center justify-between transition cursor-pointer ${
                      task.completed
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <button 
                        onClick={(e) => toggleTask(task.id, e)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition cursor-pointer ${
                          task.completed ? 'bg-emerald-500 border-emerald-500 text-slate-900' : 'border-slate-500'
                        }`}
                        aria-label={`Toggle completion for task ${task.text}`}
                      >
                        {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <div>
                        <span className={`text-xs font-semibold block ${task.completed ? 'line-through opacity-70' : ''}`}>
                          {task.text}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold">{task.impact} &bull; {task.time}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Banner & Primary Action */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-solid border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                <span>Estimated Compensation Growth Potential: <strong className="text-white">+₹4.2L / +$15,000</strong></span>
              </div>
              <Link to="/dashboard/candidate/assistant">
                <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  Execute Recommended Directives <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* WIDGET 2: RICHER TOP JOB MATCHES */}
          <div className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Highly Compatible Job Matches
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Filtered by your skill graph and experience benchmarks</p>
              </div>
              <Link to="/dashboard/candidate/job-matches" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                View All Matches <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {/* Job Card 1 */}
              <div className="border border-solid border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600 rounded-xl p-4 transition bg-white dark:bg-slate-900 hover:shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0">
                      G
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Senior Frontend Engineer</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Google &bull; Hyderabad &bull; ₹18–24 LPA</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-solid border-emerald-200 dark:border-emerald-800">
                      92% Match
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                      Remote
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-solid border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold mr-1 uppercase">Matched Skills:</span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">React</span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">Next.js</span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">TypeScript</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={ROUTES.DASHBOARD.CANDIDATE.SAVED}>
                      <button className="bg-white dark:bg-slate-800 border border-solid border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5" /> Save
                      </button>
                    </Link>
                    <Link to={ROUTES.DASHBOARD.CANDIDATE.JOBS}>
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition shadow-xs cursor-pointer">
                        Quick Apply
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Job Card 2 */}
              <div className="border border-solid border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600 rounded-xl p-4 transition bg-white dark:bg-slate-900 hover:shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                      TS
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Lead Full Stack Architect</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tech Solutions Inc &bull; Mumbai &bull; ₹22–28 LPA</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-solid border-emerald-200 dark:border-emerald-800">
                      88% Match
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                      Hybrid
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-solid border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold mr-1 uppercase">Matched Skills:</span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">Node.js</span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">Supabase RLS</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={ROUTES.DASHBOARD.CANDIDATE.SAVED}>
                      <button className="bg-white dark:bg-slate-800 border border-solid border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5" /> Save
                      </button>
                    </Link>
                    <Link to={ROUTES.DASHBOARD.CANDIDATE.JOBS}>
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition shadow-xs cursor-pointer">
                        Quick Apply
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WIDGET 3: RESUME HEALTH VISUALIZATION */}
          <div className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Resume Health & ATS Diagnostic
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Automated structural keyword analysis</p>
              </div>
              <Link to="/dashboard/candidate/resume-analyzer" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                Improve Resume
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/dashboard/candidate/resume-analyzer" className="p-4 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50/50 rounded-xl flex flex-col items-center justify-center text-center space-y-2 border border-solid border-slate-100 dark:border-slate-700 transition group">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-200 dark:text-slate-700" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-emerald-600 dark:text-emerald-400" strokeDasharray={`${resumeModel.atsScore}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="absolute text-lg font-black text-slate-900 dark:text-white">{resumeModel.atsScore}</span>
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">ATS Parsing Index</span>
              </Link>

              <div className="md:col-span-2 space-y-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-solid border-slate-100 dark:border-slate-700">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Found Core Keywords</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">React</span>
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">TypeScript</span>
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">Tailwind CSS</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-solid border-slate-200/60 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Missing Keywords To Add</span>
                  <div className="flex flex-wrap gap-1">
                    {resumeModel.missingKeywords.map((kw: string) => (
                      <span key={kw} className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded">{kw}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WIDGET 4: INTERACTIVE CAREER ANALYTICS CHARTS WITH TIMEFRAME SELECTOR */}
          <div className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Advanced Career Analytics Center
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Weekly candidate activity and recruiter engagement trends</p>
              </div>

              {/* Interactive Timeframe Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
                {(['7D', '30D', '90D', '1Y'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                      timeframe === tf
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-solid border-slate-100 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span>Profile Views & Recruiter Clicks ({timeframe})</span>
                <span className="text-emerald-600 dark:text-emerald-400">+24% vs prior period</span>
              </div>
              
              <div className="h-32 w-full flex items-end gap-3 pt-4 border-b border-solid border-slate-200 dark:border-slate-700 pb-2">
                {activeDataset.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group cursor-pointer">
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all group-hover:from-emerald-500 group-hover:to-emerald-300" 
                      style={{ height: `${(item.value / Math.max(...activeDataset.map(d => d.value))) * 100}%` }}
                    />
                    <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-100">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Views</span>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">142 Views</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Shortlists</span>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">8 Recruiters</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Response Rate</span>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">94% Optimal</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">

          {/* RIGHT WIDGET 1: AI COACH DAILY ADVICE */}
          <Link to="/dashboard/candidate/assistant" className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs border border-solid border-slate-800 space-y-3 block transition group cursor-pointer">
            <div className="flex items-center gap-2 text-emerald-400">
              <Brain className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">AI Daily Advice Directive</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium group-hover:text-white">
              "Focus your weekend study hours on relational schemas and Supabase RLS row-level policies to maximize backend alignment for architect positions."
            </p>
          </Link>

          {/* RIGHT WIDGET 2: UPCOMING INTERVIEWS */}
          <div className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Next Interview
            </h3>
            <Link to="/dashboard/candidate/interview-prep" className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50/50 rounded-xl flex items-center justify-between gap-3 border border-solid border-slate-100 dark:border-slate-700 transition block group">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Tech Solutions Panel</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Tomorrow &bull; 10:00 AM</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </Link>
          </div>

          {/* RIGHT WIDGET 3: PENDING ACTION ITEMS CHECKLIST */}
          <div className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Action Items Checklist
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/candidate/resume-builder" className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                  Upload Resume PDF
                </Link>
              </li>
              <li>
                <Link to={ROUTES.DASHBOARD.CANDIDATE.PROJECTS} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                  Add Technical Portfolio Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* RIGHT WIDGET 4: TRENDING SKILLS */}
          <div className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> In-Demand Skills Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {trendingModel.skills.map((s: any) => (
                <Link key={s.name} to={ROUTES.DASHBOARD.CANDIDATE.SKILLS} className="bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 hover:border-emerald-200 border border-solid border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg transition">
                  {s.name}
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT WIDGET 5: RECOMMENDED CERTIFICATIONS */}
          <div className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Recommended Badges
            </h3>
            <div className="space-y-2">
              {certsModel.certs.map((c: any, idx: number) => (
                <Link key={idx} to={ROUTES.DASHBOARD.CANDIDATE.CERTIFICATIONS} className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50/50 rounded-xl border border-solid border-slate-100 dark:border-slate-700 transition block group">
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{c.name}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{c.expectedImpact}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT WIDGET 6: QUICK ACTIONS SHORTCUTS */}
          <div className="bg-white dark:bg-slate-900 border border-solid border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link to={ROUTES.DASHBOARD.CANDIDATE.JOBS} className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-solid border-slate-100 dark:border-slate-700 rounded-xl text-center transition block">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Find Jobs</span>
              </Link>
              <Link to="/dashboard/candidate/assistant" className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-solid border-slate-100 dark:border-slate-700 rounded-xl text-center transition block">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Ask AI Coach</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* FLOATING AI ASSISTANT BUTTON & OVERLAY PANEL */}
      <div className="fixed bottom-6 right-6 z-40">
        {!aiAssistantOpen ? (
          <button
            onClick={() => setAiAssistantOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-xl transition-all cursor-pointer flex items-center gap-2 font-bold text-xs group"
            aria-label="Open Floating AI Assistant"
          >
            <Brain className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Ask AI Career Assistant</span>
          </button>
        ) : (
          <div className="bg-slate-900 text-white border border-solid border-slate-800 rounded-2xl p-5 shadow-2xl w-80 sm:w-96 space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-solid border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-extrabold uppercase tracking-wider">AI Assistant Quick Commands</span>
              </div>
              <button 
                onClick={() => setAiAssistantOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button onClick={() => navigate('/dashboard/candidate/resume-analyzer')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition">
                ⚡ Optimize Resume
              </button>
              <button onClick={() => navigate(ROUTES.DASHBOARD.CANDIDATE.JOBS)} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition">
                🎯 Top Jobs Match
              </button>
              <button onClick={() => navigate('/dashboard/candidate/interview-prep')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition">
                🗣️ Practice Interview
              </button>
              <button onClick={() => navigate('/dashboard/candidate/assistant')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-left transition">
                💬 Open AI Chat
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default CandidateDashboard;
