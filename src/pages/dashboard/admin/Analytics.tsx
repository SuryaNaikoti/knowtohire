import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Loading } from '../../../components/ui/Loading';
import { TrendingUp, DollarSign, Briefcase, Award, Landmark } from 'lucide-react';

interface MetricBreakdown {
  label: string;
  count: number;
  percentage: number;
}

export const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [funnel, setFunnel] = useState<MetricBreakdown[]>([]);

  useEffect(() => {
    // Simulating analytics database query
    const loadAnalytics = async () => {
      await new Promise(r => setTimeout(r, 600));
      setFunnel([
        { label: 'Platform Registrations', count: 1840, percentage: 100 },
        { label: 'Completed Profiles', count: 1290, percentage: 70 },
        { label: 'Job Applications Submitted', count: 980, percentage: 53 },
        { label: 'Interviews Booked', count: 320, percentage: 17 },
        { label: 'Placements & Job Offers', count: 110, percentage: 6 },
      ]);
      setLoading(false);
    };
    loadAnalytics();
  }, []);

  if (loading) return <Loading label="Compiling platform business telemetry..." />;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Enterprise Growth Analytics
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Audit conversion pipelines, subscriber acquisitions, template order values, and funnel health.
          </p>
        </div>
      </div>

      {/* Main Grid KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Hiring Conversion Rate', value: '6.2%', icon: Award, color: 'text-amber-500' },
          { label: 'Monthly Recurring Rev', value: '$3,396', icon: DollarSign, color: 'text-emerald-600' },
          { label: 'Average Transaction Val', value: '$18.90', icon: Landmark, color: 'text-blue-500' },
          { label: 'Total active vacancies', value: '42 listings', icon: Briefcase, color: 'text-purple-500' },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-white">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{kpi.label}</span>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-black font-heading text-gray-950">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Funnel section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Hiring Funnel Vetting */}
        <Card className="bg-white">
          <CardHeader className="pb-3 border-b border-solid border-gray-100">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hiring Funnel Vetting</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {funnel.map((item, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="text-gray-900 font-extrabold">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Acquisition channels */}
        <Card className="bg-white">
          <CardHeader className="pb-3 border-b border-solid border-gray-100">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">User Acquisition breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {[
              { label: 'Organic Search Engine', pct: 45 },
              { label: 'Linked In Recommendations', pct: 28 },
              { label: 'Direct Referrals', pct: 15 },
              { label: 'GitHub Integrations', pct: 12 },
            ].map((channel, i) => (
              <div key={i} className="flex items-center justify-between text-xs border-b border-solid border-gray-50 pb-2.5 last:border-none last:pb-0">
                <span className="text-gray-600 font-semibold">{channel.label}</span>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-800 border-emerald-250">
                  {channel.pct}% Traffic
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
