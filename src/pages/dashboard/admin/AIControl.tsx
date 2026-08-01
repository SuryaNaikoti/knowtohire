import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { Cpu, DollarSign, Activity, Zap, RefreshCw } from 'lucide-react';

interface AIModelStats {
  provider: 'gemini' | 'openai' | 'claude';
  name: string;
  requestsCount: number;
  tokensUsed: number;
  costEstimate: number;
  avgLatency: string;
}

export const AIControl: React.FC = () => {
  const [stats, setStats] = useState<AIModelStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAIStats = async () => {
    try {
      setLoading(true);
      setError('');
      // Simulate real-time logs fetch
      await new Promise(r => setTimeout(r, 600));

      const mockStats: AIModelStats[] = [
        {
          provider: 'gemini',
          name: 'Gemini 1.5 Flash',
          requestsCount: 1420,
          tokensUsed: 4208000,
          costEstimate: 0.35,
          avgLatency: '420ms',
        },
        {
          provider: 'openai',
          name: 'GPT-4o Mini',
          requestsCount: 890,
          tokensUsed: 1890000,
          costEstimate: 1.15,
          avgLatency: '680ms',
        },
        {
          provider: 'claude',
          name: 'Claude 3.5 Sonnet',
          requestsCount: 410,
          tokensUsed: 980000,
          costEstimate: 4.85,
          avgLatency: '1.2s',
        },
      ];

      setStats(mockStats);
    } catch (err) {
      console.error(err);
      setError('Could not query AI models middleware stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIStats();
  }, []);

  const handleResetMetrics = () => {
    setSuccess('AI requests counter successfully refreshed.');
    fetchAIStats();
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) return <Loading label="Connecting AI middleware nodes..." />;

  const tableHeaders = [
    { key: 'model', label: 'AI LLM Model Engine' },
    { key: 'req', label: 'Requests' },
    { key: 'tokens', label: 'Tokens' },
    { key: 'cost', label: 'Estimated cost' },
    { key: 'latency', label: 'Latency' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" /> AI Intelligence Control Center
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Monitor API token usage metrics, cost boundaries, response latencies, and prompts performance.
          </p>
        </div>
        <Button size="sm" onClick={handleResetMetrics} className="text-xs font-bold self-start">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Period Metrics
        </Button>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Model Stats summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Tokens Consumed', value: '7,078,000', icon: <Zap className="w-5 h-5 text-primary" />, desc: 'This billing cycle' },
          { label: 'Est. Cumulative Cost', value: '$6.35', icon: <DollarSign className="w-5 h-5 text-emerald-600" />, desc: '98% efficiency rate' },
          { label: 'Rate-Limit Breaches', value: '0 Warnings', icon: <Activity className="w-5 h-5 text-accent" />, desc: 'All API keys fully active' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
              <div className="p-2 bg-gray-50 border border-gray-100 border-solid rounded-lg">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black font-heading text-gray-900 leading-none mb-1">{stat.value}</div>
              <p className="text-[10px] text-gray-400 font-bold">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Models Breakdown Table */}
      <Card>
        <CardContent className="p-0">
          <Table headers={tableHeaders}>
            {stats.map((model) => (
              <TableRow key={model.name}>
                <TableCell>
                  <div className="font-bold text-gray-900 text-xs sm:text-sm">{model.name}</div>
                  <div className="text-[10px] text-gray-450 font-bold uppercase mt-0.5">{model.provider}</div>
                </TableCell>
                <TableCell className="text-xs text-gray-600 font-semibold">
                  {model.requestsCount} reqs
                </TableCell>
                <TableCell className="text-xs text-gray-600 font-semibold">
                  {model.tokensUsed.toLocaleString()} tokens
                </TableCell>
                <TableCell className="text-xs text-emerald-800 font-extrabold">
                  ${model.costEstimate.toFixed(2)} USD
                </TableCell>
                <TableCell className="text-xs text-gray-500 font-semibold">
                  {model.avgLatency}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIControl;
