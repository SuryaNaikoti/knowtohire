import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  BookOpen, 
  ArrowRight, 
  TrendingUp, 
  ChevronRight,
  Globe,
  Building,
  Star,
  Users,
  Award,
  ShieldCheck,
  Layers,
  Bookmark,
  Mail,
  Heart,
  CheckCircle,
  FileSpreadsheet,
  Play,
  Sparkles,
  GraduationCap,
  Target,
  BarChart3,
  Clock,
  Download,
  ExternalLink,
  Cpu,
  HeartPulse,
  Landmark,
  Megaphone,
  Factory,
  Leaf,
  FlaskConical,
  Lightbulb,
  Code2,
  DollarSign
} from 'lucide-react';

/* ── Reusable SVG Wave Divider Component ── */
const WaveDivider: React.FC<{ position: 'top' | 'bottom'; fill: string; className?: string }> = ({ position, fill, className = '' }) => (
  <div className={`kth-wave-divider ${position} ${className}`}>
    <svg viewBox="0 0 1440 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      {position === 'bottom' ? (
        <path d="M0,0 C360,48 1080,0 1440,32 L1440,48 L0,48 Z" fill={fill} />
      ) : (
        <path d="M0,48 C360,0 1080,48 1440,16 L1440,0 L0,0 Z" fill={fill} />
      )}
    </svg>
  </div>
);

/* ── Decorative Dot Grid Background ── */
const DotGrid: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotgrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotgrid)" />
    </svg>
  </div>
);

export const Home: React.FC = () => {
  const navigate = useNavigate();
  
  // Search Form State
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Saved Jobs State mockup
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (keyword) queryParams.set('search', keyword);
    if (location) queryParams.set('location', location);
    if (category) queryParams.set('category', category);
    navigate(`/jobs?${queryParams.toString()}`);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  const toggleSaveJob = (id: number) => {
    if (savedJobs.includes(id)) {
      setSavedJobs(savedJobs.filter((item) => item !== id));
    } else {
      setSavedJobs([...savedJobs, id]);
    }
  };

  return (
    <div className="flex flex-col w-full animate-fade-in-up bg-white">
      
      {/* ════════════════════════════════════════════════════════════════════
          1. HERO SECTION
         ════════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-white pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_-20%,rgba(16,185,129,0.08),transparent),radial-gradient(ellipse_50%_80%_at_80%_50%,rgba(13,148,136,0.05),transparent)] pointer-events-none" />
        
        {/* Subtle dot grid pattern */}
        <DotGrid className="text-slate-400 opacity-30 [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_60%,transparent_100%)]" />
        
        {/* Animated floating orbs */}
        <div className="absolute top-16 right-[15%] w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none kth-animate-float-slow" />
        <div className="absolute bottom-20 left-[10%] w-64 h-64 bg-teal-200/15 rounded-full blur-3xl pointer-events-none kth-animate-float-rev" />
        <div className="absolute top-1/3 left-[60%] w-40 h-40 bg-cyan-200/10 rounded-full blur-2xl pointer-events-none kth-animate-float" />
        
        {/* Abstract network/connections SVG illustration */}
        <div className="absolute right-0 bottom-0 opacity-[0.06] pointer-events-none hidden lg:block">
          <svg width="500" height="500" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-900">
            {/* Network nodes */}
            <circle cx="50" cy="60" r="4" fill="currentColor" opacity="0.6" />
            <circle cx="120" cy="40" r="3" fill="currentColor" opacity="0.5" />
            <circle cx="150" cy="100" r="5" fill="currentColor" opacity="0.6" />
            <circle cx="80" cy="130" r="3.5" fill="currentColor" opacity="0.5" />
            <circle cx="170" cy="160" r="4" fill="currentColor" opacity="0.4" />
            <circle cx="40" cy="150" r="3" fill="currentColor" opacity="0.4" />
            <circle cx="100" cy="80" r="6" fill="currentColor" opacity="0.3" />
            {/* Connection lines */}
            <line x1="50" y1="60" x2="120" y2="40" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            <line x1="120" y1="40" x2="150" y2="100" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            <line x1="50" y1="60" x2="100" y2="80" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            <line x1="100" y1="80" x2="150" y2="100" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            <line x1="100" y1="80" x2="80" y2="130" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            <line x1="80" y1="130" x2="170" y2="160" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            <line x1="40" y1="150" x2="80" y2="130" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            <line x1="150" y1="100" x2="170" y2="160" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            {/* Outer orbit ring */}
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="4 6" opacity="0.15" />
          </svg>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column — 7/12 */}
            <div className="lg:col-span-7 space-y-8 text-left">
              {/* Animated badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/80 text-emerald-800 text-xs font-black tracking-widest uppercase shadow-sm kth-animate-pulse-glow">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Career Intelligence Platform</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-[72px] font-black font-heading tracking-tight leading-[1.05] text-slate-900">
                Build Your Future.<br />
                <span className="kth-gradient-text">Learn. Get Hired. Grow.</span>
              </h1>

              <p className="text-lg md:text-xl font-medium leading-[1.7] text-slate-500 max-w-[640px]">
                Discover careers across every industry, access premium learning resources, professional templates, and connect with top employers — all in one intelligent platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <RouterLink to="/jobs">
                  <Button className="w-full sm:w-auto bg-emerald-650 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/15 h-[56px] px-8 rounded-2xl text-base font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-emerald-500/25 inline-flex items-center justify-center gap-2.5">
                    <span>Find Jobs</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </RouterLink>
                <RouterLink to="/resources">
                  <Button variant="outline" className="w-full sm:w-auto bg-white border-slate-200 text-slate-700 hover:bg-slate-50 h-[56px] px-8 rounded-2xl text-base font-semibold shadow-sm hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center justify-center gap-2.5">
                    <BookOpen className="w-5 h-5 text-slate-500" />
                    <span>Explore Resources</span>
                  </Button>
                </RouterLink>
              </div>

              {/* Trust indicators */}
              <div className="pt-8 border-t border-slate-100/80 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Employers</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-500" /> 80,000+ Professionals</span>
                <span className="flex items-center gap-1.5 bg-emerald-50/60 px-2.5 py-1 rounded-lg text-emerald-800 border border-emerald-100/50">
                  <TrendingUp className="w-3.5 h-3.5" /> +24% Active Openings
                </span>
              </div>
            </div>

            {/* Right Column — 5/12 — Dashboard Mockup */}
            <div className="lg:col-span-5 flex flex-col gap-6 justify-end w-full">
              <div className="relative w-full max-w-[480px] mx-auto">
                
                {/* Floating Candidate Card — top left */}
                <div className="absolute -top-8 -left-8 glass-card-light p-4 rounded-2xl shadow-xl z-20 hidden sm:flex items-center gap-3 kth-animate-float" style={{ animationDelay: '-2s' }}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-inner">RS</div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900">Rahul Sharma</p>
                    <p className="text-[10px] text-slate-450 font-semibold">Product Manager • Hired</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full ml-1">✓ Verified</span>
                </div>

                {/* Floating Job Match — bottom right */}
                <div className="absolute -right-4 -bottom-4 glass-card-dark text-white p-4 rounded-2xl shadow-2xl z-20 hidden sm:flex flex-col gap-2 kth-animate-float-rev text-left" style={{ animationDelay: '-4s' }}>
                  <div className="flex justify-between items-center gap-6">
                    <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">AI MATCH SCORE</p>
                    <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">98%</span>
                  </div>
                  <p className="text-xs font-bold">Senior Software Engineer</p>
                  <p className="text-[9px] text-slate-400">TechNova Labs • Bengaluru</p>
                </div>

                {/* Floating sparkle decoration */}
                <div className="absolute -top-4 right-8 text-emerald-400 kth-animate-float-slow z-20 hidden lg:block">
                  <Sparkles className="w-6 h-6 opacity-40" />
                </div>

                {/* Main Dashboard Widget */}
                <Card overflowVisible={true} className="bg-white p-6 shadow-elevated border border-slate-150 rounded-[24px] relative z-10 overflow-visible space-y-6">
                  {/* Dashboard Header */}
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div className="text-left">
                      <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Career Dashboard</p>
                      <h4 className="text-sm font-black text-slate-900">Profile Completeness</h4>
                    </div>
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="24" cy="24" r="18" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                        <circle cx="24" cy="24" r="18" stroke="url(#progressGradient)" strokeWidth="4" fill="transparent" strokeDasharray="113" strokeDashoffset="28" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#0d9488" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="absolute text-[10px] font-black text-slate-800">75%</span>
                    </div>
                  </div>

                  {/* Search Form */}
                  <form onSubmit={handleSearch} className="space-y-3">
                    <Input
                      placeholder="Job title, skill, or keyword..."
                      leftIcon={<Search className="w-4 h-4 text-slate-455" />}
                      value={keyword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
                      className="text-xs border-slate-200 focus:border-emerald-500 focus:ring-1 bg-slate-50/50 h-[44px] rounded-xl"
                      aria-label="Keyword"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Location"
                        leftIcon={<MapPin className="w-4 h-4 text-slate-455" />}
                        value={location}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
                        className="text-xs border-slate-200 focus:border-emerald-500 focus:ring-1 bg-slate-50/50 h-[44px] rounded-xl"
                        aria-label="Location"
                      />
                      <Select
                        value={category}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
                        className="text-xs border-slate-200 focus:border-emerald-500 focus:ring-1 bg-slate-50/50 h-[44px] rounded-xl"
                        aria-label="Category dropdown"
                      >
                        <option value="">All Industries</option>
                        <option value="technology">Technology</option>
                        <option value="finance">Finance</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="engineering">Engineering</option>
                        <option value="marketing">Marketing</option>
                        <option value="esg">ESG & Sustainability</option>
                      </Select>
                    </div>

                    <Button type="submit" variant="primary" className="w-full text-xs font-bold h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md inline-flex items-center justify-center gap-1.5">
                      <Search className="w-4 h-4" />
                      <span>Search Opportunities</span>
                    </Button>
                  </form>

                  {/* Application Analytics */}
                  <div className="space-y-2 pt-4 border-t border-slate-100 text-left">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Application Analytics</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center hover:bg-slate-100/50 transition-colors">
                        <p className="text-base font-black text-slate-900 leading-none">12</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1">Applied</p>
                      </div>
                      <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50 text-center hover:bg-emerald-50 transition-colors">
                        <p className="text-base font-black text-emerald-700 leading-none">4</p>
                        <p className="text-[9px] text-emerald-600 font-bold mt-1">Shortlist</p>
                      </div>
                      <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50 text-center hover:bg-blue-50 transition-colors">
                        <p className="text-base font-black text-blue-700 leading-none">2</p>
                        <p className="text-[9px] text-blue-600 font-bold mt-1">Offers</p>
                      </div>
                    </div>
                  </div>

                </Card>
              </div>
            </div>

          </div>
        </div>
        
        <WaveDivider position="bottom" fill="#022c22" />
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          2. TRUST BAR — Platform statistics
         ════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-emerald-950 text-white relative overflow-hidden kth-noise-overlay">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.12),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(13,148,136,0.1),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(6,78,59,0.3)_25%,transparent_25%,transparent_50%,rgba(6,78,59,0.3)_50%,rgba(6,78,59,0.3)_75%,transparent_75%,transparent)] bg-[size:20px_20px] opacity-10 pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {[
              { num: '50,000+', label: 'Active Job Listings', detail: 'Across 15+ industries', icon: Briefcase },
              { num: '2,000+', label: 'Hiring Companies', detail: 'From startups to MNCs', icon: Building },
              { num: '80,000+', label: 'Registered Professionals', detail: 'Growing every day', icon: Users },
              { num: '95%', label: 'Placement Success', detail: 'Verified match rate', icon: Award }
            ].map((stat, i) => {
              const IconComp = stat.icon;
              return (
                <div key={i} className="glass-card-dark rounded-[20px] p-6 shadow-xl hover:scale-[1.04] transition-all duration-300 text-center space-y-3 group cursor-default">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/25 group-hover:scale-110 transition-all duration-300">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <p className="text-3xl md:text-4xl lg:text-5xl font-black font-heading text-emerald-400 leading-none tracking-tight">{stat.num}</p>
                  <p className="text-[11px] uppercase tracking-widest font-extrabold text-slate-300">{stat.label}</p>
                  <p className="text-[10px] text-emerald-300/70 font-bold flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {stat.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          3. EXPLORE BY CAREER CATEGORY
         ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-emerald-50 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute right-0 top-10 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-30 pointer-events-none" />
        <DotGrid className="text-slate-300 opacity-20" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mx-auto">
              <Target className="w-3.5 h-3.5" />
              <span>Career Paths</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 font-heading">
              Explore by Career Category
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Discover opportunities across every major industry and professional discipline.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Technology & Software', desc: 'Software engineering, cloud architecture, DevOps, full-stack development, and product management roles.', count: '12,400 Jobs', activeRate: '+28% Active', icon: Code2, color: 'from-blue-500 to-indigo-600', trend: 'Highest demand sector' },
              { title: 'Finance & Banking', desc: 'Investment banking, financial analysis, risk management, fintech, and compliance advisory positions.', count: '8,920 Jobs', activeRate: '+18% Active', icon: DollarSign, color: 'from-emerald-500 to-emerald-600', trend: 'Strong hiring momentum' },
              { title: 'Healthcare & Life Sciences', desc: 'Medical research, pharmaceutical development, hospital administration, and biotech engineering.', count: '6,750 Jobs', activeRate: '+15% Active', icon: HeartPulse, color: 'from-rose-500 to-pink-600', trend: 'Growing rapidly' },
              { title: 'Engineering & Manufacturing', desc: 'Mechanical, civil, electrical engineering, industrial automation, and quality assurance.', count: '7,300 Jobs', activeRate: '+12% Active', icon: Factory, color: 'from-amber-500 to-orange-600', trend: 'Infrastructure growth' },
              { title: 'Marketing & Creative', desc: 'Digital marketing, brand strategy, content creation, UI/UX design, and growth hacking.', count: '5,100 Jobs', activeRate: '+22% Active', icon: Megaphone, color: 'from-purple-500 to-pink-600', trend: 'Digital-first demand' },
              { title: 'ESG & Sustainability', desc: 'Corporate sustainability strategies, carbon management, climate risk advisory, and environmental compliance.', count: '4,210 Jobs', activeRate: '+14% Active', icon: Leaf, color: 'from-teal-500 to-emerald-600', trend: 'High CSRD demand' }
            ].map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <Card key={idx} hoverEffect className="bg-white border border-slate-200/80 p-0 rounded-[24px] shadow-[0_4px_24px_rgba(15,23,42,0.06)] flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-premium hover:border-emerald-500/35 group relative overflow-hidden">
                  <div className={`h-1.5 w-full bg-gradient-to-r ${cat.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform duration-300 z-10 relative">
                            <IconComp className="w-7 h-7 text-slate-800 group-hover:text-emerald-650 transition-colors" />
                          </div>
                          <div className={`absolute -inset-1.5 rounded-2xl bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-15 blur-sm transition-opacity duration-300`} />
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-lg">
                            {cat.activeRate}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold">{cat.trend}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-left">
                        <h3 className="text-[20px] font-bold text-slate-900 leading-snug group-hover:text-emerald-755 transition-colors">{cat.title}</h3>
                        <p className="text-[15px] text-slate-500 font-normal leading-[1.7]">{cat.desc}</p>
                      </div>
                    </div>
                    
                    <div className="pt-6 mt-auto border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-600">
                      <span className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl font-extrabold">{cat.count}</span>
                      <button className="text-emerald-655 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer font-bold bg-transparent border-none group-hover:gap-1.5 transition-all">
                        <span>Explore Category</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
        
        <WaveDivider position="bottom" fill="#F8FAFC" />
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          4. FEATURED JOBS — Multi-industry
         ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#F8FAFC] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.04),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-16 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b border-slate-200">
            <div className="space-y-3 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Handpicked Opportunities</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black font-heading text-slate-900 tracking-tight">Featured Jobs</h2>
              <p className="text-base text-slate-500 font-medium">Top-tier companies across industries with AI-powered match scores.</p>
            </div>
            <RouterLink to="/jobs">
              <Button className="bg-emerald-650 hover:bg-emerald-700 text-white font-bold h-12 px-6 rounded-xl shadow-md shadow-emerald-500/10 flex items-center gap-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                <span>View All Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </RouterLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: 1, title: 'Senior Frontend Engineer', company: 'TechNova Labs', location: 'Bengaluru, India', salary: '₹18,00,000 - ₹28,00,000', score: '98% Match', tag: 'Full-time', logoColor: 'bg-blue-50 text-blue-600 border-blue-100', logoIcon: Code2, applicants: '62 applicants', trend: 'Trending upward', posted: '2 hours ago' },
              { id: 2, title: 'Financial Risk Analyst', company: 'CapitalWise Partners', location: 'Mumbai, India', salary: '₹14,00,000 - ₹22,00,000', score: '95% Match', tag: 'Full-time', logoColor: 'bg-emerald-50 text-emerald-600 border-emerald-100', logoIcon: DollarSign, applicants: '38 applicants', trend: 'High demand', posted: '1 day ago' },
              { id: 3, title: 'Product Marketing Manager', company: 'BrightPath Digital', location: 'Pune, India', salary: '₹12,00,000 - ₹18,00,000', score: '92% Match', tag: 'Full-time', logoColor: 'bg-purple-50 text-purple-600 border-purple-100', logoIcon: Megaphone, applicants: '24 applicants', trend: 'Steady hiring', posted: '5 hours ago' }
            ].map((job) => {
              const LogoIcon = job.logoIcon;
              const isSaved = savedJobs.includes(job.id);
              return (
                <Card key={job.id} hoverEffect className="bg-white border border-slate-200 p-0 rounded-[24px] shadow-[0_4px_24px_rgba(15,23,42,0.06)] flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-premium hover:border-emerald-500/30 group relative overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div className={`w-14 h-14 rounded-2xl ${job.logoColor} border flex items-center justify-center font-extrabold group-hover:scale-105 transition-transform shadow-sm`}>
                          <LogoIcon className="w-7 h-7" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-100/50 text-xs font-black px-2.5 py-1 rounded-lg">
                            {job.score}
                          </span>
                          <button
                            onClick={() => toggleSaveJob(job.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isSaved
                                ? 'bg-red-50 border-red-100 text-red-500 scale-105'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50/30'
                            }`}
                            aria-label="Save Job"
                          >
                            <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500' : ''}`} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-left">
                        <h3 className="text-[20px] font-bold text-slate-900 leading-snug group-hover:text-emerald-650 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-base text-slate-500 font-semibold">{job.company}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{job.location}</span>
                          </div>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{job.posted}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/30 font-bold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> {job.trend}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-600">
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase text-slate-400 tracking-wider">
                          <Users className="w-3.5 h-3.5 text-slate-350" />
                          <span>{job.applicants}</span>
                        </div>
                        <p className="text-sm font-extrabold text-slate-900">{job.salary}</p>
                      </div>
                      <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-extrabold">{job.tag}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
        
        <WaveDivider position="bottom" fill="#ffffff" />
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          5. TOP EMPLOYERS HIRING — Multi-industry
         ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-10 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-30 pointer-events-none" />
        <DotGrid className="text-emerald-300 opacity-10" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest mx-auto">
              <Building className="w-3.5 h-3.5" />
              <span>Employer Network</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 font-heading">
              Trusted by Top Employers
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              We partner with industry leaders from technology to healthcare, finance to manufacturing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'TechNova LABS', activeBadge: '24 Openings', rating: '4.8', desc: 'Leading SaaS company building AI-powered enterprise solutions across global markets.', logoInit: 'TN', logoBg: 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700', industry: 'Technology' },
              { name: 'CapitalWise PARTNERS', activeBadge: '18 Openings', rating: '4.7', desc: 'Premier financial advisory firm specializing in wealth management and risk analytics.', logoInit: 'CW', logoBg: 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700', industry: 'Finance' },
              { name: 'MedPulse HEALTH', activeBadge: '15 Openings', rating: '4.9', desc: 'Healthcare technology platform connecting hospitals with specialist professionals.', logoInit: 'MP', logoBg: 'bg-gradient-to-br from-rose-100 to-rose-50 text-rose-700', industry: 'Healthcare' },
              { name: 'BrightPath DIGITAL', activeBadge: '12 Openings', rating: '4.6', desc: 'Full-service digital marketing agency driving growth for Fortune 500 brands.', logoInit: 'BP', logoBg: 'bg-gradient-to-br from-purple-100 to-purple-50 text-purple-700', industry: 'Marketing' }
            ].map((company, idx) => (
              <Card key={idx} className="bg-white border border-slate-200 p-0 rounded-[24px] flex flex-col justify-between hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 text-left group overflow-hidden">
                <div className="bg-slate-50/80 px-8 pt-8 pb-6 border-b border-slate-100/80">
                  <div className="flex justify-between items-start">
                    <div className={`w-14 h-14 rounded-2xl ${company.logoBg} font-black flex items-center justify-center text-base border border-slate-100 shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
                      {company.logoInit}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100/50 px-2 py-1 rounded-lg shrink-0">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{company.rating}</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] uppercase font-black tracking-wider text-slate-800 line-clamp-1">{company.name}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[7px] font-black px-1 py-0.5 rounded shrink-0">✓ VERIFIED</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{company.industry}</span>
                  </div>
                </div>
                
                <div className="px-8 py-6 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">{company.desc}</p>
                  <div className="mt-6 pt-4 border-t border-slate-100/60 flex justify-between items-center text-xs font-bold">
                    <span className="text-emerald-655 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/50">{company.activeBadge}</span>
                    <RouterLink to="/coming-soon?feature=Employers" className="text-slate-400 hover:text-slate-700 flex items-center font-bold gap-0.5 transition-colors">
                      <span>View Profile</span>
                      <ChevronRight className="w-4 h-4" />
                    </RouterLink>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          6. JOBS BY LOCATION
         ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#F0FDF4] relative overflow-hidden">
        <WaveDivider position="top" fill="#ffffff" />
        
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full text-emerald-800" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 200 Q 300 100, 600 250 T 1200 150" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="100" cy="200" r="5" fill="currentColor" opacity="0.4" />
            <circle cx="600" cy="250" r="7" fill="currentColor" opacity="0.3" />
            <circle cx="1200" cy="150" r="6" fill="currentColor" opacity="0.35" />
          </svg>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-widest mx-auto">
              <MapPin className="w-3.5 h-3.5" />
              <span>Regional Hubs</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 font-heading">
              Jobs by Location
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Find opportunities across India's top hiring regions and metro cities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { city: 'Maharashtra', count: '8,420 Jobs', growth: '+18% YoY', bgGradient: 'from-emerald-800 to-emerald-950', details: 'Tech, Finance & Consulting hub' },
              { city: 'Delhi NCR', count: '7,105 Jobs', growth: '+22% YoY', bgGradient: 'from-teal-800 to-teal-950', details: 'Government, IT & Marketing' },
              { city: 'Karnataka', count: '9,800 Jobs', growth: '+25% YoY', bgGradient: 'from-indigo-850 to-indigo-950', details: "India's Silicon Valley" },
              { city: 'Tamil Nadu', count: '5,870 Jobs', growth: '+14% YoY', bgGradient: 'from-emerald-900 to-slate-950', details: 'Manufacturing & Healthcare' }
            ].map((loc, idx) => (
              <Card key={idx} hoverEffect className="relative bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(15,23,42,0.06)] flex flex-col justify-between h-full p-0 transition-all duration-300 hover:-translate-y-2 hover:shadow-premium hover:border-emerald-500/30 group">
                <div className={`w-full h-36 bg-gradient-to-br ${loc.bgGradient} p-5 flex flex-col justify-between text-white relative overflow-hidden`}>
                  <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20 flex items-end justify-around px-3">
                    <div className="w-5 h-10 bg-white/40 rounded-t" />
                    <div className="w-7 h-16 bg-white/40 rounded-t" />
                    <div className="w-4 h-7 bg-white/40 rounded-t" />
                    <div className="w-8 h-12 bg-white/40 rounded-t" />
                    <div className="w-5 h-18 bg-white/40 rounded-t" />
                    <div className="w-6 h-9 bg-white/40 rounded-t" />
                  </div>
                  <div className="flex justify-between items-center z-10">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                      <MapPin className="w-4 h-4 text-emerald-300" />
                    </div>
                    <span className="text-[9px] font-black uppercase text-emerald-200 bg-emerald-900/50 border border-emerald-700/40 px-2 py-0.5 rounded">Active Hub</span>
                  </div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-200 z-10 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {loc.growth} Growth
                  </span>
                </div>
                <div className="p-6 space-y-2 text-left flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-snug">{loc.city}</h3>
                    <p className="text-base text-emerald-700 font-extrabold mt-1">{loc.count}</p>
                    <p className="text-xs text-slate-450 leading-relaxed font-normal mt-1">{loc.details}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <button onClick={() => navigate(`/jobs?search=${encodeURIComponent(loc.city)}`)} className="text-xs font-bold text-emerald-655 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer w-full text-left bg-transparent border-none group-hover:gap-1.5 transition-all">
                      <span>View Opportunities</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <WaveDivider position="bottom" fill="#ffffff" />
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          7. JOBS BY INDUSTRY — Multi-industry verticals
         ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-white relative overflow-hidden">
        <div className="absolute top-10 right-10 w-80 h-80 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest mx-auto">
              <Layers className="w-3.5 h-3.5" />
              <span>Industry Verticals</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 font-heading">
              Browse by Industry
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Every major industry vertical, from AI to government, all on one platform.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { title: 'Artificial Intelligence', desc: 'ML engineering, NLP, computer vision, and data science roles.', icon: Cpu, count: '3,200+', iconBg: 'bg-violet-50 text-violet-600 border-violet-100' },
              { title: 'Education & EdTech', desc: 'Teaching, curriculum design, ed-tech product, and research.', icon: GraduationCap, count: '2,800+', iconBg: 'bg-blue-50 text-blue-600 border-blue-100' },
              { title: 'Government & PSU', desc: 'Civil services, public sector units, and policy advisory.', icon: Landmark, count: '4,500+', iconBg: 'bg-amber-50 text-amber-600 border-amber-100' },
              { title: 'Research & Science', desc: 'Academic research, R&D labs, and scientific publications.', icon: FlaskConical, count: '1,900+', iconBg: 'bg-teal-50 text-teal-600 border-teal-100' },
              { title: 'ESG & Environment', desc: 'Carbon management, sustainability consulting, and compliance.', icon: Leaf, count: '2,400+', iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
            ].map((ind, idx) => {
              const IconComp = ind.icon;
              return (
                <div key={idx} className="bg-white border border-slate-200/80 rounded-[20px] p-6 flex flex-col justify-between space-y-5 hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 text-left group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="space-y-4 relative z-10">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${ind.iconBg} group-hover:scale-110 transition-transform shadow-sm`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">{ind.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">{ind.desc}</p>
                  </div>
                  <div className="pt-3 relative z-10">
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" /> {ind.count} Jobs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          8. STUDY HUB — Multi-industry learning resources
         ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#F8FAFC] relative overflow-hidden">
        <WaveDivider position="top" fill="#ffffff" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.03),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-16 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b border-slate-200">
            <div className="space-y-3 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Knowledge Hub</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-extrabold font-heading text-slate-900 tracking-tight">Study Hub Marketplace</h3>
              <p className="text-base text-slate-500 font-medium">Premium e-books, certification guides, and professional study materials across industries.</p>
            </div>
            <RouterLink to="/resources">
              <Button className="bg-emerald-650 hover:bg-emerald-700 text-white font-bold h-12 px-6 rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:-translate-y-0.5">
                <span>View All Study Materials</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </RouterLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Data Science Handbook', price: '₹499', rating: '4.9', downloads: '3.2k', bg: 'from-indigo-900 to-indigo-750', author: 'Dr. P. Kumar', detail: 'Complete guide covering Python, ML algorithms, statistics, and real-world case studies.', badge: 'BEST SELLER' },
              { title: 'Financial Modeling Guide', price: '₹399', rating: '4.8', downloads: '1.8k', bg: 'from-emerald-900 to-emerald-750', author: 'CA R. Mehta', detail: 'Excel-based financial modeling, DCF valuation, and investment analysis techniques.', badge: 'TRENDING' },
              { title: 'Digital Marketing Playbook', price: '₹299', rating: '4.7', downloads: '2.1k', bg: 'from-purple-900 to-purple-750', author: 'BrightPath Academy', detail: 'SEO, content marketing, paid ads, analytics, and growth hacking strategies.', badge: 'NEW' }
            ].map((item, index) => (
              <Card key={index} hoverEffect className="bg-white border border-slate-200 p-6 rounded-[24px] flex flex-col justify-between shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-2 hover:shadow-premium hover:border-emerald-500/30 group relative">
                <div className="space-y-6 text-left">
                  <div className="flex gap-4 items-center">
                    <div 
                      className={`w-28 h-36 bg-gradient-to-br ${item.bg} rounded-lg p-3 flex flex-col justify-between text-white shadow-xl shrink-0 border-l-4 border-black/30 transform transition-transform duration-500 group-hover:[transform:perspective(800px)_rotateY(-8deg)_scale(1.03)]`}
                      style={{ boxShadow: '5px 5px 15px rgba(0,0,0,0.15), inset 0 0 20px rgba(255,255,255,0.05)' }}
                    >
                      <div className="flex justify-between items-start">
                        <BookOpen className="w-4 h-4 text-white/70" />
                        <span className="text-[7px] font-black bg-white/20 px-1 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">{item.badge}</span>
                      </div>
                      <span className="text-[10px] font-black leading-tight line-clamp-3 uppercase tracking-wider">{item.title}</span>
                    </div>
                    <div className="space-y-2 flex flex-col justify-center">
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded self-start">{item.badge}</span>
                      <p className="text-base font-bold text-slate-900 leading-snug line-clamp-2">{item.title}</p>
                      <p className="text-xs text-slate-400 font-semibold">By {item.author}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 font-normal line-clamp-2 leading-relaxed">{item.detail}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{item.rating}</span>
                    <span className="text-slate-300">•</span>
                    <Download className="w-3 h-3 text-slate-400" />
                    <span>{item.downloads}</span>
                  </div>
                  <span className="text-base font-black text-emerald-650">{item.price}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          9. PROFESSIONAL TEMPLATES
         ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-30 pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-16 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-3 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Template Store</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-extrabold font-heading text-slate-900 tracking-tight">Professional Templates</h3>
              <p className="text-base text-slate-500 font-medium">Ready-to-use resumes, business reports, and professional document templates.</p>
            </div>
            <RouterLink to="/templates">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-6 rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:-translate-y-0.5">
                <span>View Templates Marketplace</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </RouterLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Modern Tech Resume', price: '₹149', rating: '4.9', sales: '4.8k', type: 'Word / PDF', accentColor: 'border-t-blue-500', details: 'Clean, ATS-optimized resume for software engineers, data scientists, and product managers.' },
              { title: 'Business Case Template', price: '₹299', rating: '4.8', sales: '2.1k', type: 'PPT / Excel', accentColor: 'border-t-emerald-500', details: 'Professional business case with financial projections, market analysis, and executive summary.' },
              { title: 'Project Management Kit', price: '₹199', rating: '4.7', sales: '1.6k', type: 'PDF / Sheet', accentColor: 'border-t-indigo-500', details: 'Complete project tracking, risk assessment, and stakeholder reporting templates.' }
            ].map((item, index) => (
              <Card key={index} hoverEffect className={`bg-white border border-slate-200 p-6 rounded-[24px] flex flex-col justify-between shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-2 hover:shadow-premium hover:border-indigo-400/30 group ${item.accentColor} border-t-4`}>
                <div className="space-y-6 text-left">
                  <div className="w-full h-40 bg-gradient-to-b from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group-hover:bg-white transition-colors">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="w-20 h-2.5 bg-slate-300/60 rounded" />
                        <span className="text-[8px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-extrabold">{item.type}</span>
                      </div>
                      <div className="w-28 h-2 bg-slate-200/80 rounded" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="w-full h-1.5 bg-slate-200/40 rounded" />
                      <div className="w-full h-1.5 bg-slate-200/40 rounded" />
                      <div className="w-3/5 h-1.5 bg-slate-200/40 rounded" />
                      <div className="w-4/5 h-1.5 bg-slate-200/40 rounded" />
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <span className="text-[9px] uppercase font-black text-slate-400">Ready to Edit</span>
                      <FileSpreadsheet className="w-4 h-4 text-slate-350" />
                    </div>
                    <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs font-bold text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-3 h-3" /> Preview Template
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-lg font-bold text-slate-900 line-clamp-1 leading-snug group-hover:text-indigo-700 transition-colors" title={item.title}>{item.title}</p>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">{item.details}</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{item.rating}</span>
                    <span className="text-slate-300">•</span>
                    <span>{item.sales} downloads</span>
                  </div>
                  <span className="text-base font-black text-indigo-600">{item.price}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          10. CAREER PLANNING — Industry-agnostic guides
         ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#F8FAFC] relative overflow-hidden">
        <WaveDivider position="top" fill="#ffffff" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.03),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mx-auto">
              <Target className="w-3.5 h-3.5" />
              <span>Career Roadmap</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 font-heading">
              Career Planning Guides
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Plan your professional growth with structured roadmaps, benchmarks, and preparation kits.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
            {[
              { title: 'Salary Benchmark Report', desc: 'Explore detailed earnings ranges across technology, finance, healthcare, and 10+ more industries.', link: '/coming-soon?feature=SalaryReport', step: 'Stage 1: Benchmark', rate: '85%' },
              { title: 'Interview Preparation Kit', desc: 'Industry-specific mock questions, technical assessments, and behavioral interview guides.', link: '/coming-soon?feature=InterviewKit', step: 'Stage 2: Preparation', rate: '92%' },
              { title: 'Career Growth Roadmap', desc: 'A step-by-step path from entry-level to leadership — customized for your industry and role.', link: '/coming-soon?feature=Roadmap', step: 'Stage 3: Growth', rate: '98%' }
            ].map((res, idx) => (
              <Card key={idx} className="bg-white border border-slate-200 p-8 rounded-[24px] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-premium hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-6 text-left max-w-2xl">
                  <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" stroke="#f1f5f9" strokeWidth="5" fill="transparent" />
                      <circle cx="32" cy="32" r="26" stroke="url(#roadmapGradient)" strokeWidth="5" fill="transparent" strokeDasharray="163" strokeDashoffset={163 - (163 * parseInt(res.rate)) / 100} strokeLinecap="round" />
                      <defs>
                        <linearGradient id="roadmapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#0d9488" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute text-xs font-black text-slate-800">{res.rate}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-655">{res.step}</span>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{res.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-normal">{res.desc}</p>
                  </div>
                </div>
                <div className="shrink-0 w-full md:w-auto">
                  <RouterLink to={res.link}>
                    <Button variant="outline" className="w-full md:w-auto text-xs font-bold text-emerald-655 border-slate-200 hover:bg-emerald-50 h-11 px-5 rounded-xl inline-flex items-center justify-center gap-1.5 transition-all">
                      <span>Explore Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </RouterLink>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          11. RESEARCH & WHITEPAPERS
         ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-16 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200">
            <div className="space-y-3 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Publications</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 font-heading tracking-tight">Research & Whitepapers</h2>
              <p className="text-base text-slate-500 font-medium">Industry reports, academic papers, and market intelligence publications.</p>
            </div>
            <button className="text-sm font-bold text-emerald-650 hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-none">
              <span>Browse All Research</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: 'India Tech Talent Report 2026: Hiring Trends & Salary Benchmarks', author: 'KnowToHire Research Team', tags: ['Industry Report', 'Technology'], details: 'Comprehensive analysis of technology hiring trends, skill demand, and compensation benchmarks across Indian metros.', downloads: '3,420 downloads', color: 'from-indigo-950 to-slate-900', stats: [30, 50, 70, 90] },
              { title: 'Future of Work: AI, Automation & the Evolving Job Market', author: 'Dr. S. Krishnan, IIM Bangalore', tags: ['Research Paper', 'AI & Workforce'], details: 'How artificial intelligence and automation are reshaping employment across finance, healthcare, and manufacturing.', downloads: '2,150 downloads', color: 'from-emerald-950 to-slate-900', stats: [40, 55, 48, 85] }
            ].map((paper, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-8 rounded-[24px] flex flex-col justify-between hover:shadow-premium hover:-translate-y-1 transition-all duration-300 group">
                <div className="space-y-6 text-left flex flex-col sm:flex-row gap-6 items-start">
                  <div className={`w-24 h-32 bg-gradient-to-br ${paper.color} rounded-lg shadow-lg flex flex-col justify-between p-2.5 text-white shrink-0 border-r-4 border-emerald-500/30 transform group-hover:scale-105 group-hover:[transform:perspective(600px)_rotateY(-5deg)_scale(1.05)] transition-transform`} style={{ boxShadow: '4px 4px 12px rgba(0,0,0,0.15)' }}>
                    <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[8px] font-bold uppercase tracking-wider line-clamp-3 leading-snug">{paper.title}</span>
                  </div>
                  
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap gap-2">
                      {paper.tags.map((tag) => (
                        <span key={tag} className="text-[10px] uppercase tracking-wider font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 cursor-pointer transition-colors leading-snug">{paper.title}</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Author: {paper.author}</p>
                      <p className="text-sm text-slate-500 font-normal leading-relaxed mt-3">{paper.details}</p>
                    </div>

                    <div className="pt-4 flex items-end gap-2 h-16">
                      {paper.stats.map((val, key) => (
                        <div key={key} className="flex-1 bg-slate-100 rounded-t h-full flex items-end">
                          <div 
                            className="bg-gradient-to-t from-emerald-600 to-emerald-400 w-full rounded-t transition-all duration-500 group-hover:from-emerald-700 group-hover:to-emerald-500" 
                            style={{ height: `${val}%` }} 
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest pt-1">Quarterly Growth Trends</p>
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-200/65 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-emerald-500" /> {paper.downloads}</span>
                  <button className="text-emerald-655 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer font-bold bg-transparent border-none">
                    <span>Read Full Paper</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          12. INSIGHTS BLOG
         ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#F8FAFC] relative overflow-hidden">
        <WaveDivider position="top" fill="#ffffff" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.02),transparent)] pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-16 relative z-10">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Industry Insights</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-extrabold font-heading text-slate-900 tracking-tight">Insights Blog</h3>
              <p className="text-base text-slate-500 font-medium">Career advice, industry analysis, and hiring trends from experts.</p>
            </div>
            <RouterLink to="/blog" className="text-sm font-bold text-emerald-655 hover:underline flex items-center gap-0.5 shrink-0">
              <span>View All Articles</span>
              <ChevronRight className="w-4 h-4" />
            </RouterLink>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7">
              <Card className="bg-white border border-slate-200 rounded-[24px] overflow-hidden h-full flex flex-col justify-between hover:shadow-premium hover:-translate-y-1 transition-all group">
                <div className="w-full h-72 overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&h=600&q=80" alt="Career Trends" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <span className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider shadow-lg">FEATURED ARTICLE</span>
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">
                    <Play className="w-3 h-3" /> 5 min read
                  </div>
                </div>
                <div className="p-8 space-y-4 text-left flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Careers</span>
                    <span className="text-xs text-slate-400 font-semibold">• May 10, 2026</span>
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    Top 10 Skills Employers Will Pay Premium For in 2026
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-normal">
                    From AI engineering to strategic leadership — discover the skills driving the highest salary premiums across technology, finance, and healthcare industries.
                  </p>
                </div>
                <div className="px-8 pb-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-[9px] font-black">KH</div>
                    <span>KnowToHire Editorial</span>
                  </div>
                  <RouterLink to="/blog" className="text-emerald-600 hover:underline flex items-center gap-0.5">
                    Read Article <ArrowRight className="w-3 h-3 ml-0.5" />
                  </RouterLink>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
              {[
                { title: 'How AI Is Transforming the Hiring Process for Both Sides', date: 'May 06, 2026', cat: 'Technology', readTime: '4 min', img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=240&h=180&q=80' },
                { title: 'Remote vs Hybrid vs Office: What the Data Says About Productivity', date: 'May 02, 2026', cat: 'Workplace', readTime: '6 min', img: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=240&h=180&q=80' }
              ].map((item, index) => (
                <div key={index} className="bg-white border border-slate-200 p-5 rounded-[24px] flex gap-4 items-center group cursor-pointer hover:shadow-premium hover:-translate-y-0.5 transition-all">
                  <div className="w-28 h-28 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="min-w-0 flex-1 text-left space-y-2">
                    <span className="text-[9px] uppercase font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">{item.cat}</span>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {item.readTime} read <span className="text-slate-200">|</span> {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          13. HOW KNOWTOHIRE WORKS
         ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-white relative overflow-hidden">
        <WaveDivider position="top" fill="#F8FAFC" />
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-slate-50 rounded-full blur-3xl opacity-30 pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mx-auto">
              <Play className="w-3.5 h-3.5" />
              <span>Getting Started</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 font-heading">
              How KnowToHire Works
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              From sign-up to success — your career journey in four simple steps.
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-16 left-[calc(12.5%+32px)] right-[calc(12.5%+32px)] hidden md:block z-0">
              <svg className="w-full h-4" preserveAspectRatio="none">
                <line x1="0" y1="8" x2="100%" y2="8" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="8 4" />
              </svg>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {[
                { step: '01', title: 'Create Profile', desc: 'Build your professional profile with skills, experience, and career preferences.', badge: 'All Professionals', icon: Users },
                { step: '02', title: 'Learn & Upskill', desc: 'Access study materials, certification guides, and industry-specific resources.', badge: 'Knowledge Hub', icon: GraduationCap },
                { step: '03', title: 'Apply to Jobs', desc: 'Get AI-powered job matches and apply directly to companies across every industry.', badge: 'Smart Matches', icon: Target },
                { step: '04', title: 'Get Hired & Grow', desc: 'Land your dream role and access salary reports, roadmaps, and career tools.', badge: 'Career Growth', icon: Award }
              ].map((step, idx) => {
                const StepIcon = step.icon;
                return (
                  <div key={idx} className="bg-white border border-slate-200 p-8 rounded-[24px] shadow-[0_4px_24px_rgba(15,23,42,0.04)] relative text-left hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-emerald-500/20 mb-6 group-hover:scale-110 transition-transform">
                      {step.step}
                    </div>
                    
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/50">{step.badge}</span>
                    
                    <div className="space-y-2 pt-5">
                      <div className="flex items-center gap-2">
                        <StepIcon className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-755 transition-colors">{step.title}</h3>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed font-normal">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          14. SUCCESS STORIES — Multi-industry testimonials
         ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#F8FAFC] relative overflow-hidden">
        <WaveDivider position="top" fill="#ffffff" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.02),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest mx-auto">
              <Star className="w-3.5 h-3.5" />
              <span>Testimonials</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 font-heading">
              Success Stories
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Professionals across industries share how KnowToHire accelerated their careers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: 'I used the Data Science Handbook and interview prep kit to prepare for technical rounds. Within three weeks, I accepted a Senior ML Engineer position at a top-tier product company.', author: 'Priya M.', role: 'ML Engineer', company: 'TechNova Labs', hike: '+55% salary hike', before: 'Junior Developer', after: 'Senior ML Engineer', avatarBg: 'from-blue-400 to-blue-600' },
              { quote: 'KnowToHire is the only platform where I found finance roles, learning resources, and resume templates in one place. The AI matching was incredibly accurate.', author: 'Arjun T.', role: 'Financial Analyst', company: 'CapitalWise Partners', hike: 'Hired in 10 days', before: 'Banking Associate', after: 'Senior Analyst', avatarBg: 'from-emerald-400 to-emerald-600' },
              { quote: 'We hired five engineers and two product managers within three weeks of posting on KnowToHire. The quality of candidates exceeded all our other sourcing channels.', author: 'Dr. Neha K.', role: 'VP of Talent', company: 'BrightPath Digital', hike: '100% Match accuracy', before: '45 Days Avg Cycle', after: '18 Days Avg Cycle', avatarBg: 'from-purple-400 to-purple-600' }
            ].map((story, idx) => (
              <Card key={idx} className="bg-white border border-slate-200 p-0 rounded-[24px] flex flex-col justify-between shadow-sm hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 text-left relative overflow-hidden group">
                <div className="absolute top-6 right-6 text-6xl font-serif text-slate-100 leading-none pointer-events-none select-none">"</div>
                
                <div className="p-8 space-y-5 flex-1">
                  <div className="flex justify-between items-center">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">{story.hike}</span>
                  </div>
                  <p className="text-[15px] italic text-slate-600 leading-relaxed font-normal relative z-10">"{story.quote}"</p>
                  
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">Before</p>
                      <p className="text-slate-800 font-extrabold mt-0.5">{story.before}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-0.5 bg-slate-200" />
                      <ArrowRight className="w-4 h-4 text-emerald-500" />
                      <div className="w-8 h-0.5 bg-emerald-200" />
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-wider text-slate-400">After</p>
                      <p className="text-emerald-700 font-extrabold mt-0.5">{story.after}</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-8 pb-8 pt-6 border-t border-slate-100 flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${story.avatarBg} flex items-center justify-center text-white font-black text-xs shadow-md shrink-0`}>
                    {story.author.split(' ')[0][0]}{story.author.split(' ')[1]?.[0] || ''}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-slate-900 leading-none">{story.author}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-1">{story.role} • <span className="text-emerald-650 font-bold">{story.company}</span></p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          15. PRICING PLANS
         ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-white relative overflow-hidden">
        <WaveDivider position="top" fill="#F8FAFC" />
        <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-40 pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mx-auto">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pricing</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 font-heading">
              Flexible Plans
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Upgrade to unlock premium resources, templates, and career intelligence tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            <Card className="bg-white border border-slate-200 p-8 rounded-[24px] flex flex-col justify-between shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Candidate Basic</h3>
                  <p className="text-xs text-slate-450 mt-1">Free job search & alert updates</p>
                </div>
                <div className="pt-2 flex items-baseline">
                  <span className="text-4xl font-black text-slate-900">₹0</span>
                  <span className="text-xs text-slate-400 ml-1">/ lifetime</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-500 pt-4 text-left border-t border-slate-100">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Apply to basic listings</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Standard dashboard access</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Basic newsletter updates</li>
                </ul>
              </div>
              <div className="pt-8">
                <RouterLink to="/register" className="w-full block">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold h-12 border-slate-200 hover:bg-slate-50 rounded-xl">Get Started Free</Button>
                </RouterLink>
              </div>
            </Card>

            <Card overflowVisible={true} className="bg-white border-2 border-emerald-500 p-8 rounded-[24px] flex flex-col justify-between shadow-premium relative hover:-translate-y-2 transition-all duration-300 kth-animate-pulse-glow">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] uppercase tracking-wider font-extrabold px-4 py-1.5 rounded-full shadow-lg z-10">Most Popular</span>
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Candidate Pro</h3>
                    <p className="text-xs text-slate-450 mt-1">Full access to all resources & tools</p>
                  </div>
                  <span className="text-[9px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">Save 20%</span>
                </div>
                <div className="pt-2 flex items-baseline">
                  <span className="text-4xl font-black text-slate-900">₹999</span>
                  <span className="text-xs text-slate-400 ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-emerald-700 pt-4 text-left border-t border-emerald-100">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Access all e-books & guides</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Download unlimited templates</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Featured candidate badge</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Direct message to employers</li>
                </ul>
              </div>
              <div className="pt-8">
                <RouterLink to="/pricing" className="w-full block">
                  <Button variant="primary" className="w-full text-xs font-bold h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 rounded-xl">Upgrade to Pro</Button>
                </RouterLink>
              </div>
            </Card>

            <Card className="bg-white border border-slate-200 p-8 rounded-[24px] flex flex-col justify-between shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Employer Standard</h3>
                  <p className="text-xs text-slate-450 mt-1">For teams hiring across industries</p>
                </div>
                <div className="pt-2 flex items-baseline">
                  <span className="text-4xl font-black text-slate-900">₹4,999</span>
                  <span className="text-xs text-slate-400 ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-500 pt-4 text-left border-t border-slate-100">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Post up to 5 jobs simultaneously</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Resume database filtering</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Applicant tracking dashboard</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Premium email support</li>
                </ul>
              </div>
              <div className="pt-8">
                <RouterLink to="/pricing" className="w-full block">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold h-12 border-slate-200 hover:bg-slate-50 rounded-xl">View Options</Button>
                </RouterLink>
              </div>
            </Card>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[10px] uppercase font-extrabold tracking-wider text-slate-400 pt-4">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> SSL Encrypted</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Cancel Anytime</span>
            <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-emerald-500" /> 30-Day Money Back</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          16. NEWSLETTER
         ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#F8FAFC] relative overflow-hidden">
        <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl opacity-30 pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <Card className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white p-0 rounded-[24px] relative overflow-hidden shadow-elevated text-left kth-noise-overlay">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent),radial-gradient(circle_at_bottom_left,rgba(13,148,136,0.08),transparent)] pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 p-10 md:p-12">
              <div className="lg:col-span-7 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                  <Mail className="w-7 h-7" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-4xl font-black font-heading tracking-tight">Stay Ahead of Industry Trends</h3>
                  <p className="text-base text-slate-300 max-w-xl leading-relaxed">
                    Join 40,000+ professionals receiving weekly updates on hiring trends, career resources, and exclusive job opportunities across all industries.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-300 pt-2">
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Weekly Career Digests</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Exclusive Job Alerts</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Industry Trend Reports</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Free Learning Resources</span>
                </div>
              </div>

              <div className="lg:col-span-5 w-full">
                {newsletterSubscribed ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-emerald-400 text-sm font-bold text-center">
                    ✓ Subscribed successfully! Thank you for joining our newsletter.
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="glass-card-dark p-6 rounded-2xl space-y-4">
                    <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Join our professional network</p>
                    <Input
                      type="email"
                      placeholder="Enter your professional email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-12 w-full rounded-xl text-sm"
                    />
                    <Button type="submit" variant="primary" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold h-12 w-full rounded-xl transition-all shadow-lg shadow-emerald-500/20 inline-flex items-center justify-center gap-1.5">
                      <span>Subscribe to Newsletter</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          17. FINAL CTA
         ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06),transparent)] pointer-events-none" />
        <DotGrid className="text-emerald-300 opacity-10" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-10 relative z-10">
          <div className="flex flex-wrap justify-center gap-6 text-xs font-extrabold text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100"><Briefcase className="w-4 h-4 text-emerald-500" /> 50,000+ Jobs</span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100"><Users className="w-4 h-4 text-emerald-500" /> 80,000+ Members</span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100"><Building className="w-4 h-4 text-emerald-500" /> 2,000+ Employers</span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100"><Globe className="w-4 h-4 text-emerald-500" /> 15+ Industries</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-heading text-slate-900 leading-tight">
            Ready to Take Your<br />
            <span className="kth-gradient-text">Career to the Next Level?</span>
          </h2>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Join thousands of professionals who found their dream roles through KnowToHire. Access jobs, learning resources, templates, and career intelligence — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <RouterLink to="/register">
              <Button className="bg-emerald-650 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/15 h-14 px-8 rounded-2xl text-base font-bold transition-all transform hover:-translate-y-1 hover:shadow-emerald-500/25 inline-flex items-center justify-center gap-2.5">
                <span>Join as Candidate</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </RouterLink>
            <RouterLink to="/coming-soon?feature=PostJob">
              <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm h-14 px-8 rounded-2xl text-base font-semibold transition-all transform hover:-translate-y-1 inline-flex items-center justify-center gap-2">
                <span>Join as Employer</span>
              </Button>
            </RouterLink>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          18. FOOTER
         ════════════════════════════════════════════════════════════════════ */}
      <footer className="bg-slate-900 text-white pt-20 pb-12 border-t border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.04),transparent)] pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-12 text-left relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-5">
              <span className="text-2xl font-black font-heading tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent uppercase">KNOWTOHIRE</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Career intelligence for every professional. Connecting talent with opportunity across technology, finance, healthcare, and 15+ industries.
              </p>
              <div className="flex gap-2 pt-2">
                {[
                  { name: 'LinkedIn', letter: 'in' },
                  { name: 'Twitter', letter: 'X' },
                  { name: 'Instagram', letter: 'Ig' },
                  { name: 'YouTube', letter: 'Yt' }
                ].map((social) => (
                  <span key={social.name} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-900/50 text-slate-400 hover:text-emerald-400 flex items-center justify-center transition-all cursor-pointer border border-slate-700/50 hover:border-emerald-700/50" aria-label={social.name}>
                    <span className="text-[9px] uppercase font-black">{social.letter}</span>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-4">Platform</h4>
              <ul className="space-y-2.5 text-xs font-bold text-slate-400">
                <li><RouterLink to="/jobs" className="hover:text-emerald-400 transition-colors">Browse Jobs</RouterLink></li>
                <li><RouterLink to="/resources" className="hover:text-emerald-400 transition-colors">Study Hub</RouterLink></li>
                <li><RouterLink to="/templates" className="hover:text-emerald-400 transition-colors">Templates Marketplace</RouterLink></li>
                <li><RouterLink to="/pricing" className="hover:text-emerald-400 transition-colors">Pricing Plans</RouterLink></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-4">Resources</h4>
              <ul className="space-y-2.5 text-xs font-bold text-slate-400">
                <li><RouterLink to="/blog" className="hover:text-emerald-400 transition-colors">Insights Blog</RouterLink></li>
                <li><RouterLink to="/coming-soon?feature=Research" className="hover:text-emerald-400 transition-colors">Research & Reports</RouterLink></li>
                <li><RouterLink to="/coming-soon?feature=SalaryReport" className="hover:text-emerald-400 transition-colors">Salary Benchmarks</RouterLink></li>
                <li><RouterLink to="/about" className="hover:text-emerald-400 transition-colors">About Us</RouterLink></li>
              </ul>
            </div>
            <div className="space-y-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-4">Trust & Security</h4>
              <div className="flex flex-wrap gap-2">
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[8px] font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> SSL SECURED</span>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-[8px] font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1"><Award className="w-3 h-3" /> VERIFIED PLATFORM</span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold leading-normal">
                Trusted by 80,000+ professionals and 2,000+ employers across India.
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-bold">
            <p>KnowToHire.com © 2026. All rights reserved.</p>
            <p className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-emerald-500" /> Career Intelligence for Every Professional</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
