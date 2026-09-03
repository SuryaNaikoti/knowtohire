import React, { useState, useEffect, useCallback } from 'react';
import { CreatorShell } from '@/components/creator/CreatorShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { formatINR } from '@/design-system/tokens';
import {
  creatorService,
  CreatorStats,
  CreatorSaleItem,
  CreatorPayoutRecord,
  knowledgeService,
  KnowledgeResource,
  templateService,
  MarketplaceTemplate,
} from '@/services';
import {
  BookOpen,
  IndianRupee,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BarChart3,
  Sparkles,
  UploadCloud,
  FileText,
} from 'lucide-react';

export interface CreatorDashboardPageProps {
  onNavigate?: (path: string) => void;
}

export const CreatorDashboardPage: React.FC<CreatorDashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [sales, setSales] = useState<CreatorSaleItem[]>([]);
  const [payouts, setPayouts] = useState<CreatorPayoutRecord[]>([]);
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);

  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'templates' | 'sales' | 'payouts'>('overview');
  const [, setIsLoading] = useState(true);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [statsRes, salesRes, payoutsRes, resList, tplList] = await Promise.all([
      creatorService.getCreatorStats(),
      creatorService.getSales(),
      creatorService.getPayouts(),
      knowledgeService.getResources({ status: 'all' }),
      templateService.getTemplates({ status: 'all' }),
    ]);

    if (statsRes.data) setStats(statsRes.data);
    if (salesRes.data) setSales(salesRes.data);
    if (payoutsRes.data) setPayouts(payoutsRes.data);
    if (resList.data) setResources(resList.data);
    if (tplList.data) setTemplates(tplList.data);

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();

    const handleDataChanged = () => {
      loadData();
    };

    window.addEventListener('kth_creator_data_changed', handleDataChanged);
    return () => {
      window.removeEventListener('kth_creator_data_changed', handleDataChanged);
    };
  }, [loadData]);

  const handleRequestPayout = async () => {
    if (!stats || !stats.isEligibleForPayout || isRequestingPayout) return;

    setIsRequestingPayout(true);
    setAlertMessage(null);

    const res = await creatorService.requestPayout();
    setIsRequestingPayout(false);

    if (res.error) {
      setAlertMessage({ type: 'error', text: res.error.message });
    } else if (res.data) {
      setAlertMessage({
        type: 'success',
        text: `Payout request of ₹${res.data.amountINR.toLocaleString()} submitted successfully! Ref: ${res.data.referenceNumber}`,
      });
      loadData();
    }
  };

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <CreatorShell title="Creator Studio & Monetization" currentPath="/creator" onNavigate={onNavigate}>
      <div className="space-y-6 font-sans">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-2xl p-6 sm:p-8 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3 h-3 text-amber-400" /> Monetization Active
              </span>
              <span className="text-xs text-slate-300">Commission Share: <strong className="text-white">{stats?.commissionPercentage || 70}%</strong></span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Welcome back, Creator
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Track real sales, resource engagement, and withdrawal thresholds across your uploaded Knowledge Hub books and ATS Marketplace templates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleNavigate('/knowledge')}
              leftIcon={<UploadCloud className="w-4 h-4" />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold"
            >
              Upload Resource
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => handleNavigate('/templates')}
              leftIcon={<FileText className="w-4 h-4" />}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-xs"
            >
              Add Template
            </Button>
          </div>
        </div>

        {alertMessage && (
          <Alert variant={alertMessage.type === 'success' ? 'success' : 'error'} title={alertMessage.type === 'success' ? 'Transaction Complete' : 'Notice'}>
            <div className="flex items-center gap-2 text-xs">
              {alertMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{alertMessage.text}</span>
            </div>
          </Alert>
        )}

        {/* ── KPI Grid ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Available Commission */}
          <Card className="p-5 bg-white border-kth-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-kth-slate-500 uppercase tracking-wider">Available Balance</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-display font-extrabold text-kth-slate-900">
                {formatINR(stats?.availableCommissionINR || 0)}
              </div>
              <p className="text-[11px] text-kth-slate-500 mt-0.5">
                Eligible for direct bank withdrawal
              </p>
            </div>
          </Card>

          {/* Card 2: Total Gross Sales */}
          <Card className="p-5 bg-white border-kth-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-kth-slate-500 uppercase tracking-wider">Gross Sales</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-display font-extrabold text-kth-slate-900">
                {formatINR(stats?.totalRevenueINR || 0)}
              </div>
              <p className="text-[11px] text-kth-slate-500 mt-0.5">
                {stats?.totalItemsSold || 0} total content units purchased
              </p>
            </div>
          </Card>

          {/* Card 3: Commission Earned */}
          <Card className="p-5 bg-white border-kth-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-kth-slate-500 uppercase tracking-wider">Lifetime Commission</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-display font-extrabold text-kth-slate-900">
                {formatINR(stats?.totalCommissionINR || 0)}
              </div>
              <p className="text-[11px] text-kth-slate-500 mt-0.5">
                Calculated at {stats?.commissionPercentage || 70}% creator share
              </p>
            </div>
          </Card>

          {/* Card 4: Total Content Assets */}
          <Card className="p-5 bg-white border-kth-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-kth-slate-500 uppercase tracking-wider">Active Assets</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-display font-extrabold text-kth-slate-900">
                {(stats?.totalResources || 0) + (stats?.totalTemplates || 0)}
              </div>
              <p className="text-[11px] text-kth-slate-500 mt-0.5">
                {stats?.totalResources || 0} resources • {stats?.totalTemplates || 0} templates
              </p>
            </div>
          </Card>
        </div>

        {/* ── Payout Threshold & Progress Card ──────────────────────────────── */}
        <Card className="p-6 bg-white border-kth-slate-200 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-display font-bold text-kth-slate-900">
                  Payout Eligibility & Withdrawal
                </h3>
                {stats?.isEligibleForPayout ? (
                  <Badge variant="emerald" className="font-bold text-xs" hasPulse>
                    Threshold Met — Ready for Payout
                  </Badge>
                ) : (
                  <Badge variant="amber" className="font-bold text-xs">
                    Threshold Pending (₹{(stats?.minPayoutThresholdINR || 1500).toLocaleString()} Required)
                  </Badge>
                )}
              </div>
              <p className="text-xs text-kth-slate-500 mt-1">
                Admin configurable payout threshold is set to <strong>₹{(stats?.minPayoutThresholdINR || 1500).toLocaleString()}</strong>.
                You currently have <strong>₹{(stats?.availableCommissionINR || 0).toLocaleString()}</strong> in available commission.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              disabled={!stats?.isEligibleForPayout || isRequestingPayout}
              onClick={handleRequestPayout}
              isLoading={isRequestingPayout}
              className={`text-xs font-bold shadow-xs shrink-0 ${
                stats?.isEligibleForPayout
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-kth-slate-200 text-kth-slate-500 cursor-not-allowed opacity-75'
              }`}
              leftIcon={<IndianRupee className="w-4 h-4" />}
            >
              {stats?.isEligibleForPayout ? 'Withdraw Commission' : `Need ₹${Math.max(0, (stats?.minPayoutThresholdINR || 1500) - (stats?.availableCommissionINR || 0)).toLocaleString()} More`}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-kth-slate-700">
              <span>Threshold Progress</span>
              <span>{stats?.payoutProgressPercentage || 0}% (₹{(stats?.availableCommissionINR || 0).toLocaleString()} / ₹{(stats?.minPayoutThresholdINR || 1500).toLocaleString()})</span>
            </div>
            <div className="w-full h-3 bg-kth-slate-100 rounded-full overflow-hidden border border-kth-slate-200">
              <div
                className={`h-full transition-all duration-500 ${
                  stats?.isEligibleForPayout ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${stats?.payoutProgressPercentage || 0}%` }}
              />
            </div>
          </div>
        </Card>

        {/* ── Tabs Navigation ──────────────────────────────────────────────── */}
        <div className="border-b border-kth-slate-200 flex items-center gap-2 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Overview & Insights' },
            { id: 'resources', label: `My Resources (${resources.length})` },
            { id: 'templates', label: `My Templates (${templates.length})` },
            { id: 'sales', label: `Sales History (${sales.length})` },
            { id: 'payouts', label: `Payout History (${payouts.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-700 font-extrabold'
                  : 'border-transparent text-kth-slate-600 hover:text-kth-slate-900 hover:border-kth-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab 1: Overview ──────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Sales List */}
              <Card className="p-6 bg-white border-kth-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-kth-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-kth-slate-900">Recent Content Purchases</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sales')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700"
                  >
                    View All →
                  </button>
                </div>
                {sales.length === 0 ? (
                  <p className="text-xs text-kth-slate-500 py-6 text-center">No sales registered yet.</p>
                ) : (
                  <div className="divide-y divide-kth-slate-100">
                    {sales.slice(0, 5).map((sale) => (
                      <div key={sale.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="font-bold text-kth-slate-900 truncate">{sale.itemTitle}</p>
                          <p className="text-[11px] text-kth-slate-500">{new Date(sale.purchasedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })} • {sale.buyerEmail}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-emerald-700 block">+{formatINR(sale.commissionINR)}</span>
                          <span className="text-[10px] text-kth-slate-400 capitalize">{sale.commissionStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Quick Actions & Content Management */}
              <Card className="p-6 bg-white border-kth-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-kth-slate-900 border-b border-kth-slate-100 pb-3">
                  Monetization Hub & Resource Metrics
                </h3>
                <p className="text-xs text-kth-slate-600 leading-relaxed">
                  Every book, research handbook, and ATS template you upload earns a guaranteed <strong>{stats?.commissionPercentage || 70}%</strong> commission on every transaction.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-950">Boost Your Sales Conversion</h4>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Items with detailed previews and sample PDF downloads receive 3.4x more purchases than text-only listings.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleNavigate('/knowledge')}
                      className="p-3 rounded-xl border border-kth-slate-200 hover:border-amber-400 hover:bg-amber-50/20 text-left transition-all"
                    >
                      <span className="text-xs font-bold text-kth-slate-900 block">Knowledge Hub</span>
                      <span className="text-[10px] text-kth-slate-500">Manage uploaded e-books</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate('/templates')}
                      className="p-3 rounded-xl border border-kth-slate-200 hover:border-amber-400 hover:bg-amber-50/20 text-left transition-all"
                    >
                      <span className="text-xs font-bold text-kth-slate-900 block">Template Marketplace</span>
                      <span className="text-[10px] text-kth-slate-500">Manage ATS doc kits</span>
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── Tab 2: Resources ─────────────────────────────────────────────── */}
        {activeTab === 'resources' && (
          <Card className="p-6 bg-white border-kth-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-kth-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-kth-slate-900">Knowledge Hub Resources</h3>
                <p className="text-xs text-kth-slate-500">Your published guidebooks, technical manuals, and research kits</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleNavigate('/knowledge')}
                leftIcon={<UploadCloud className="w-4 h-4" />}
                className="bg-kth-primary-600 hover:bg-kth-primary-700 text-white font-bold text-xs"
              >
                Upload Resource
              </Button>
            </div>

            <div className="divide-y divide-kth-slate-100">
              {resources.map((res) => (
                <div key={res.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-kth-slate-900">{res.title}</span>
                      <Badge variant={res.status === 'published' ? 'emerald' : 'slate'} className="text-[9px] uppercase">
                        {res.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-kth-slate-500 max-w-xl line-clamp-1">{res.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-kth-slate-400 font-mono">
                      <span>{res.category}</span>
                      <span>•</span>
                      <span>{res.downloads_count || 0} downloads</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">{res.is_free ? 'Free' : formatINR(res.price_inr || 0)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleNavigate(`/creator/resources/${res.id}/metrics`)}
                      leftIcon={<BarChart3 className="w-3.5 h-3.5 text-amber-600" />}
                      className="text-xs font-bold"
                    >
                      View Metrics
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigate(`/knowledge/${res.slug || res.id}`)}
                      leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Tab 3: Templates ─────────────────────────────────────────────── */}
        {activeTab === 'templates' && (
          <Card className="p-6 bg-white border-kth-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-kth-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-kth-slate-900">Marketplace Templates</h3>
                <p className="text-xs text-kth-slate-500">Your ATS resume templates, audit toolkits, and assessment forms</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleNavigate('/templates')}
                leftIcon={<UploadCloud className="w-4 h-4" />}
                className="bg-kth-primary-600 hover:bg-kth-primary-700 text-white font-bold text-xs"
              >
                Add Template
              </Button>
            </div>

            <div className="divide-y divide-kth-slate-100">
              {templates.map((tpl) => (
                <div key={tpl.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-kth-slate-900">{tpl.title}</span>
                      <Badge variant={tpl.status === 'published' ? 'emerald' : 'slate'} className="text-[9px] uppercase">
                        {tpl.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-kth-slate-500 max-w-xl line-clamp-1">{tpl.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-kth-slate-400 font-mono">
                      <span>{tpl.category}</span>
                      <span>•</span>
                      <span>{tpl.downloads_count || 0} downloads</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">{tpl.is_free ? 'Free' : formatINR(tpl.price_inr || 0)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleNavigate(`/creator/templates/${tpl.id}/metrics`)}
                      leftIcon={<BarChart3 className="w-3.5 h-3.5 text-amber-600" />}
                      className="text-xs font-bold"
                    >
                      View Metrics
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigate(`/templates/${tpl.slug || tpl.id}`)}
                      leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Tab 4: Sales ─────────────────────────────────────────────────── */}
        {activeTab === 'sales' && (
          <Card className="p-6 bg-white border-kth-slate-200 space-y-4">
            <h3 className="text-base font-bold text-kth-slate-900 border-b border-kth-slate-100 pb-3">
              Detailed Sales Transactions & Commission Ledger
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-kth-slate-200 text-kth-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item Title</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Gross Sale</th>
                    <th className="py-2.5 px-3">Commission (70%)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kth-slate-100 font-sans">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-kth-slate-50/50">
                      <td className="py-3 px-3 font-bold text-kth-slate-900">{sale.itemTitle}</td>
                      <td className="py-3 px-3 capitalize">{sale.itemType}</td>
                      <td className="py-3 px-3 font-mono text-kth-slate-600">{sale.buyerEmail}</td>
                      <td className="py-3 px-3 font-semibold text-kth-slate-800">{formatINR(sale.amountINR)}</td>
                      <td className="py-3 px-3 font-bold text-emerald-700">+{formatINR(sale.commissionINR)}</td>
                      <td className="py-3 px-3">
                        <Badge variant={sale.commissionStatus === 'available' ? 'emerald' : 'amber'} className="capitalize text-[10px]">
                          {sale.commissionStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 font-mono text-kth-slate-500">{new Date(sale.purchasedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ── Tab 5: Payouts ───────────────────────────────────────────────── */}
        {activeTab === 'payouts' && (
          <Card className="p-6 bg-white border-kth-slate-200 space-y-4">
            <h3 className="text-base font-bold text-kth-slate-900 border-b border-kth-slate-100 pb-3">
              Bank Withdrawal & Payout History
            </h3>
            {payouts.length === 0 ? (
              <p className="text-xs text-kth-slate-500 py-8 text-center">No payout withdrawals requested yet.</p>
            ) : (
              <div className="divide-y divide-kth-slate-100">
                {payouts.map((po) => (
                  <div key={po.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-kth-slate-900">{formatINR(po.amountINR)} Payout Request</p>
                      <p className="text-[11px] text-kth-slate-500 font-mono">Reference: {po.referenceNumber} • {new Date(po.requestedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                    </div>
                    <Badge variant="emerald" className="font-bold text-[10px] uppercase">
                      {po.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </CreatorShell>
  );
};
