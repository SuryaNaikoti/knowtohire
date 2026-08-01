import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  MapPin, 
  Search, 
  ArrowRight,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

interface SalaryData {
  role: string;
  industry: string;
  minSalary: string;
  medianSalary: string;
  maxSalary: string;
  yoyGrowth: string;
  demand: 'Extreme' | 'High' | 'Moderate';
  topLocations: string[];
}

const SALARY_BENCHMARKS: SalaryData[] = [
  {
    role: 'Senior Frontend Engineer (React/Next.js)',
    industry: 'Technology',
    minSalary: '₹18,00,000',
    medianSalary: '₹24,50,000',
    maxSalary: '₹36,00,000',
    yoyGrowth: '+18.4%',
    demand: 'Extreme',
    topLocations: ['Bengaluru', 'Hyderabad', 'Pune']
  },
  {
    role: 'Financial Risk & Quantitative Analyst',
    industry: 'Finance',
    minSalary: '₹14,00,000',
    medianSalary: '₹19,80,000',
    maxSalary: '₹30,00,000',
    yoyGrowth: '+14.2%',
    demand: 'High',
    topLocations: ['Mumbai', 'Delhi NCR', 'Bengaluru']
  },
  {
    role: 'AI / Machine Learning Engineer',
    industry: 'Technology',
    minSalary: '₹22,00,000',
    medianSalary: '₹32,00,000',
    maxSalary: '₹50,00,000',
    yoyGrowth: '+28.6%',
    demand: 'Extreme',
    topLocations: ['Bengaluru', 'Hyderabad', 'Delhi NCR']
  },
  {
    role: 'Clinical Data Manager',
    industry: 'Healthcare',
    minSalary: '₹11,00,000',
    medianSalary: '₹16,50,000',
    maxSalary: '₹24,00,000',
    yoyGrowth: '+12.5%',
    demand: 'High',
    topLocations: ['Hyderabad', 'Mumbai', 'Chennai']
  },
  {
    role: 'ESG & Corporate Sustainability Specialist',
    industry: 'ESG & Sustainability',
    minSalary: '₹13,50,000',
    medianSalary: '₹18,00,000',
    maxSalary: '₹28,00,000',
    yoyGrowth: '+22.1%',
    demand: 'Extreme',
    topLocations: ['Mumbai', 'Delhi NCR', 'Bengaluru']
  },
  {
    role: 'Product Marketing Manager',
    industry: 'Marketing',
    minSalary: '₹12,00,000',
    medianSalary: '₹17,50,000',
    maxSalary: '₹26,00,000',
    yoyGrowth: '+15.8%',
    demand: 'Moderate',
    topLocations: ['Bengaluru', 'Mumbai', 'Pune']
  }
];

export const SalaryBenchmarkGuide: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const filteredData = SALARY_BENCHMARKS.filter((item) => {
    const matchesSearch = item.role.toLowerCase().includes(search.toLowerCase()) || 
                          item.topLocations.some(loc => loc.toLowerCase().includes(search.toLowerCase()));
    const matchesIndustry = selectedIndustry === 'All' || item.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
            <BarChart3 className="w-96 h-96" />
          </div>
          <div className="relative z-10 max-w-3xl space-y-4 text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> 2026 Compensation Data
            </span>
            <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-tight">
              India Compensation & Salary Benchmark Report
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
              Real-time compensation analytics aggregated across tech, finance, healthcare, and sustainability sectors. Plan your next compensation review with verified benchmarks.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8">
              <Input
                placeholder="Search by job title or city..."
                leftIcon={<Search className="w-5 h-5 text-slate-400" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border-slate-200 text-slate-900"
              />
            </div>
            <div className="md:col-span-4 flex gap-2">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="ESG & Sustainability">ESG & Sustainability</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Salary Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item, idx) => (
            <Card key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    {item.industry}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    item.demand === 'Extreme' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {item.demand} Demand
                  </span>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{item.role}</h3>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{item.yoyGrowth} YoY Salary Growth</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Min</span>
                    <span className="text-slate-900 font-bold">Median</span>
                    <span>Max</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-black text-slate-900">
                    <span className="text-xs text-slate-400 font-semibold">{item.minSalary}</span>
                    <span className="text-base text-emerald-700 font-black">{item.medianSalary}</span>
                    <span className="text-xs text-slate-400 font-semibold">{item.maxSalary}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-2/3 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.topLocations.join(', ')}</span>
                </div>
                <Link to={`/jobs?search=${encodeURIComponent(item.role)}`} className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1">
                  View Jobs <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
};

export default SalaryBenchmarkGuide;
