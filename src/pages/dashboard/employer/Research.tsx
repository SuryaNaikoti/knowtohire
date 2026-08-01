import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { TrendingUp, BarChart2, DollarSign, Award, Target, FileSpreadsheet } from 'lucide-react';

export const Research: React.FC = () => {
  const reports = [
    {
      title: 'Q2 India Tech Salary benchmarks',
      category: 'Compensation',
      views: 1205,
      downloadUrl: '#',
      desc: 'Compensation ranges across software development, data science, and product design roles in major hubs.'
    },
    {
      title: 'Full-Stack Developer Availability Indices',
      category: 'Talent Liquidity',
      views: 893,
      downloadUrl: '#',
      desc: 'Active job seeker volume metrics, average response rates, and offer acceptance curves.'
    },
    {
      title: 'ESG Compliance Professional Demand Curve',
      category: 'Sustainability',
      views: 541,
      downloadUrl: '#',
      desc: 'Hiring metrics updates matching carbon auditing, waste management, and regulatory compliance standards.'
    }
  ];

  const metrics = [
    { label: 'Avg Tech Salary (SE-3)', value: '₹22,50,000', change: '+4.2% YoY', icon: <DollarSign className="w-4 h-4 text-primary" /> },
    { label: 'Time-to-Hire benchmark', value: '18 Days', change: '-2 Days YoY', icon: <Target className="w-4 h-4 text-secondary" /> },
    { label: 'Match Ratio Average', value: '88.3%', change: 'Stable', icon: <Award className="w-4 h-4 text-accent" /> }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="border-b border-gray-200 border-solid pb-5">
        <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-primary" /> Market Intelligence
        </h1>
        <p className="text-xs text-gray-500 font-semibold mt-0.5">
          Access research reports, salary guides, talent liquidity charts, and hiring metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {metrics.map((m, idx) => (
          <Card key={idx} hoverEffect>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{m.label}</span>
              <div className="p-2 bg-gray-50 border border-gray-100 border-solid rounded-lg">
                {m.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-black font-heading text-gray-900 leading-none mb-1">{m.value}</div>
              <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> {m.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold font-heading text-gray-900 tracking-tight flex items-center gap-1.5">
          <FileSpreadsheet className="w-5 h-5 text-primary" /> Published Research Reports
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          {reports.map((r, idx) => (
            <Card key={idx} className="bg-white hover:border-gray-300 transition">
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 text-left">
                  <Badge variant="primary" size="sm">{r.category}</Badge>
                  <h3 className="font-heading font-black text-gray-900 text-sm leading-tight pt-1">
                    {r.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-2xl">
                    {r.desc}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => alert(`Report downloaded: "${r.title}".`)}
                  className="text-xs font-bold shrink-0 self-start sm:self-center"
                >
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Research;
