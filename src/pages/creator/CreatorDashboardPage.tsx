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
  ArrowUpRight,
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
  const [alertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    window.addEventListener('kth_resources_changed', handleDataChanged);
    window.addEventListener('kth_templates_changed', handleDataChanged);
    return () => {
      window.removeEventListener('kth_creator_data_changed', handleDataChanged);
      window.removeEventListener('kth_resources_changed', handleDataChanged);
      window.removeEventListener('kth_templates_changed', handleDataChanged);
    };
  }, [loadData]);

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
        {/* ── Top Executive Hero Banner ────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-kth-slate-900 via-kth-slate-800 to-[#0c182c] border border-kth-slate-800 p-6 sm:p-8 text-white shadow-md">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-kth-primary-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Monetization Active
                </span>
                <span className="text-xs text-kth-slate-300 font-medium">
                  Guaranteed Creator Commission:{' '}
                  <strong className="text-white font-bold">{stats?.commissionPercentage || 70}%</strong>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
                Welcome back, Creator
              </h1>
              <p className="text-xs sm:text-sm text-kth-slate-300 leading-relaxed">
                Publish e-books and ATS templates, track real customer purchases, inspect engagement metrics, and disburse bank withdrawals.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleNavigate('/creator/resources/new')}
                leftIcon={<UploadCloud className="w-4 h-4" />}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold cursor-pointer"
              >
                Upload Resource
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleNavigate('/creator/templates/new')}
                leftIcon={<FileText className="w-4 h-4" />}
                className="bg-kth-primary-600 hover:bg-kth-primary-500 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Add Template
              </Button>
            </div>
          </div>
        </div>

        {/* ── Transaction / Status Alert ───────────────────────────────────── */}
        {alertMessage && (
          <Alert
            variant={alertMessage.type === 'success' ? 'success' : 'error'}
            title={alertMessage.type === 'success' ? 'Transaction Complete' : 'Notice'}
          >
            <div className="flex items-center gap-2 text-xs">
              {alertMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{alertMessage.text}</span>
            </div>
          </Alert>
        )}

        {/* ── SECTION 1: CONTENT WORKFLOW LIFECYCLE ──────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-kth-slate-200 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-kth-slate-500">
              Content Pipeline
            </h2>
            <span className="text-[11px] text-kth-slate-400 font-medium">
              {(stats?.totalResources || 0) + (stats?.totalTemplates || 0)} Total Created Assets
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Published */}
            <button
              type="button"
              onClick={() => setActiveTab('resources')}
              className="p-4 rounded-xl bg-white border border-kth-slate-200/90 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50/10 transition-all text-left cursor-pointer"
            >
              <div className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Published</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-kth-slate-900 mt-1">
                {stats?.publishedCount || 0}
              </div>
              <p className="text-[10px] text-kth-slate-400 mt-0.5">Live & purchasable in market</p>
            </button>

            {/* Under Review */}
            <button
              type="button"
              onClick={() => setActiveTab('resources')}
              className="p-4 rounded-xl bg-white border border-kth-slate-200/90 shadow-2xs hover:border-amber-300 hover:bg-amber-50/10 transition-all text-left cursor-pointer"
            >
              <div className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Under Review</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-kth-slate-900 mt-1">
                {stats?.underReviewCount || 0}
              </div>
              <p className="text-[10px] text-kth-slate-400 mt-0.5">Submitted to Admin Desk</p>
            </button>

            {/* Action Required */}
            <button
              type="button"
              onClick={() => {
                const termsItem = [...resources, ...templates].find((i) => i.status === 'terms_pending');
                if (termsItem) {
                  const type = 'formats' in termsItem ? 'template' : 'resource';
                  handleNavigate(`/creator/terms/${type}/${termsItem.id}`);
                } else {
                  setActiveTab('resources');
                }
              }}
              className={`p-4 rounded-xl border shadow-2xs transition-all text-left cursor-pointer ${
                (stats?.actionRequiredCount || 0) > 0
                  ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-200'
                  : 'bg-white border-kth-slate-200/90'
              }`}
            >
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
                <span>Action Required</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-900 mt-1">
                {stats?.actionRequiredCount || 0}
              </div>
              <p className="text-[10px] text-amber-700 mt-0.5 font-medium">Review & accept terms</p>
            </button>

            {/* Drafts */}
            <button
              type="button"
              onClick={() => setActiveTab('resources')}
              className="p-4 rounded-xl bg-white border border-kth-slate-200/90 shadow-2xs hover:border-kth-slate-400 transition-all text-left cursor-pointer"
            >
              <div className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Drafts</span>
                <span className="w-2 h-2 rounded-full bg-kth-slate-300" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-kth-slate-900 mt-1">
                {stats?.draftCount || 0}
              </div>
              <p className="text-[10px] text-kth-slate-400 mt-0.5">Unsubmitted drafts</p>
            </button>
          </div>
        </div>

        {/* ── ACTION REQUIRED BANNER (Terms Awaiting Acceptance) ────────────────── */}
        {(() => {
          const pendingTermsItems = [
            ...resources.filter((r) => r.status === 'terms_pending').map((r) => ({ ...r, itemType: 'resource' as const })),
            ...templates.filter((t) => t.status === 'terms_pending').map((t) => ({ ...t, itemType: 'template' as const })),
          ];

          if (pendingTermsItems.length === 0) return null;

          return (
            <div className="space-y-3">
              {pendingTermsItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        <Sparkles className="w-3 h-3 text-amber-700" /> Action Required
                      </span>
                      <span className="text-xs font-bold text-kth-slate-700">Commercial Terms Approved</span>
                    </div>

                    <h3 className="text-base font-bold text-kth-slate-900">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-kth-slate-600 font-medium">
                      <span><strong>{formatINR(item.selling_price_inr || item.price_inr || 0)}</strong> selling price</span>
                      <span>•</span>
                      <span><strong>{item.creator_commission_pct || 70}%</strong> creator royalty</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">
                        {formatINR(item.creator_earnings_per_sale_inr || Math.round(((item.selling_price_inr || item.price_inr || 0) * (item.creator_commission_pct || 70)) / 100))} per sale
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleNavigate(`/creator/terms/${item.itemType}/${item.id}`)}
                    rightIcon={<ArrowUpRight className="w-4 h-4" />}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 shadow-xs shrink-0 cursor-pointer"
                  >
                    Review & Accept Terms
                  </Button>
                </div>
              ))}
            </div>
          );
        })()}

        {/* ── SECTION 2: EARNINGS & MONETIZATION ───────────────────────────── */}
        <div className="space-y-3 pt-2">
          <div className="border-b border-kth-slate-200 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-kth-slate-500">
              Earnings & Royalties
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Available Balance */}
            <Card className="p-5 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">
                  Available Balance
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-mono font-bold text-kth-slate-900 tracking-tight">
                  {formatINR(stats?.availableCommissionINR || 0)}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[11px] text-kth-slate-500 font-medium">Eligible for bank withdrawal</p>
                </div>
              </div>
            </Card>

            {/* Card 2: Gross Sales */}
            <Card className="p-5 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">
                  Gross Sales
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-mono font-bold text-kth-slate-900 tracking-tight">
                  {formatINR(stats?.totalRevenueINR || 0)}
                </div>
                <p className="text-[11px] text-kth-slate-500 font-medium mt-1">
                  {stats?.totalItemsSold || 0} total content units purchased
                </p>
              </div>
            </Card>

            {/* Card 3: Lifetime Commission */}
            <Card className="p-5 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">
                  Lifetime Commission
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-mono font-bold text-kth-slate-900 tracking-tight">
                  {formatINR(stats?.totalCommissionINR || 0)}
                </div>
                <p className="text-[11px] text-kth-slate-500 font-medium mt-1">
                  Calculated at {stats?.commissionPercentage || 70}% creator share
                </p>
              </div>
            </Card>

            {/* Card 4: Total Content Assets */}
            <Card className="p-5 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider">
                  Active Assets
                </span>
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-mono font-bold text-kth-slate-900 tracking-tight">
                  {(stats?.totalResources || 0) + (stats?.totalTemplates || 0)}
                </div>
                <p className="text-[11px] text-kth-slate-500 font-medium mt-1">
                  {stats?.totalResources || 0} resources • {stats?.totalTemplates || 0} templates
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* ── Payout Threshold & Withdrawal Suite ──────────────────────────── */}
        <Card className="p-6 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
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
                Platform minimum payout threshold is configured to <strong>₹{(stats?.minPayoutThresholdINR || 1500).toLocaleString()}</strong>.
                You currently have <strong>₹{(stats?.availableCommissionINR || 0).toLocaleString()}</strong> in available net commission.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              disabled={!stats?.isEligibleForPayout}
              onClick={() => handleNavigate('/creator/withdraw')}
              className={`text-xs font-bold shadow-xs shrink-0 ${
                stats?.isEligibleForPayout
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-kth-slate-100 text-kth-slate-400 cursor-not-allowed border border-kth-slate-200'
              }`}
              leftIcon={<IndianRupee className="w-4 h-4" />}
            >
              {stats?.isEligibleForPayout
                ? 'Withdraw Commission'
                : `Need ₹${Math.max(
                    0,
                    (stats?.minPayoutThresholdINR || 1500) - (stats?.availableCommissionINR || 0)
                  ).toLocaleString()} More`}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-medium text-kth-slate-600">
              <span>Threshold Progress</span>
              <span className="font-mono">
                {stats?.payoutProgressPercentage || 0}% (₹{(stats?.availableCommissionINR || 0).toLocaleString()} / ₹{(stats?.minPayoutThresholdINR || 1500).toLocaleString()})
              </span>
            </div>
            <div className="w-full h-2.5 bg-kth-slate-100 rounded-full overflow-hidden border border-kth-slate-200">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  stats?.isEligibleForPayout ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${stats?.payoutProgressPercentage || 0}%` }}
              />
            </div>
          </div>
        </Card>

        {/* ── Tabs Navigation ──────────────────────────────────────────────── */}
        <div className="border-b border-kth-slate-200 flex items-center gap-1 sm:gap-2 overflow-x-auto pb-px">
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
                  ? 'border-kth-primary-600 text-kth-primary-700 font-extrabold'
                  : 'border-transparent text-kth-slate-500 hover:text-kth-slate-900 hover:border-kth-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab 1: Overview & Insights ───────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Content Purchases */}
              <Card className="p-6 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-kth-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-kth-slate-900">Recent Content Purchases</h3>
                    <p className="text-[11px] text-kth-slate-500">Live transactions recorded for your assets</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sales')}
                    className="text-xs font-bold text-kth-primary-600 hover:text-kth-primary-700 cursor-pointer"
                  >
                    View All →
                  </button>
                </div>
                {sales.length === 0 ? (
                  <p className="text-xs text-kth-slate-500 py-6 text-center">No sales registered yet.</p>
                ) : (
                  <div className="divide-y divide-kth-slate-100">
                    {sales.slice(0, 5).map((sale) => (
                      <div key={sale.id} className="py-3 flex items-center justify-between text-xs gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-kth-slate-900 truncate">{sale.itemTitle}</p>
                          <div className="flex items-center gap-2 text-[11px] text-kth-slate-400 mt-0.5">
                            <span>{new Date(sale.purchasedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                            <span>•</span>
                            <span className="font-mono text-kth-slate-500">{sale.buyerEmail}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-emerald-700 block">+{formatINR(sale.commissionINR)}</span>
                          <span className="text-[10px] text-kth-slate-400 capitalize">{sale.commissionStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Monetization Hub & Growth Tips */}
              <Card className="p-6 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-4">
                <div className="border-b border-kth-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-kth-slate-900">
                    Monetization Hub & Resource Metrics
                  </h3>
                  <p className="text-[11px] text-kth-slate-500">How creator earnings and royalties work</p>
                </div>

                <p className="text-xs text-kth-slate-600 leading-relaxed">
                  Every guidebook, technical manual, and ATS template you publish earns a guaranteed <strong>{stats?.commissionPercentage || 70}%</strong> creator royalty on every transaction.
                </p>

                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-kth-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950">Boost Your Sales Conversion</h4>
                    <p className="text-[11px] text-indigo-800/90 mt-0.5 leading-relaxed">
                      Items with detailed outlines and sample PDF previews receive 3.4x more purchases than text-only listings.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleNavigate('/knowledge')}
                    className="p-3 rounded-xl border border-kth-slate-200 hover:border-kth-primary-300 hover:bg-kth-slate-50 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-kth-slate-900 group-hover:text-kth-primary-600">Knowledge Hub</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-kth-slate-400 group-hover:text-kth-primary-600" />
                    </div>
                    <span className="text-[10px] text-kth-slate-500">Explore public catalogue</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate('/templates')}
                    className="p-3 rounded-xl border border-kth-slate-200 hover:border-kth-primary-300 hover:bg-kth-slate-50 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-kth-slate-900 group-hover:text-kth-primary-600">Template Market</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-kth-slate-400 group-hover:text-kth-primary-600" />
                    </div>
                    <span className="text-[10px] text-kth-slate-500">Explore marketplace</span>
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── Tab 2: My Resources ──────────────────────────────────────────── */}
        {activeTab === 'resources' && (
          <Card className="p-6 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-kth-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-kth-slate-900">Knowledge Hub Resources</h3>
                <p className="text-xs text-kth-slate-500">Your published guidebooks, technical manuals, and research kits</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleNavigate('/creator/resources/new')}
                leftIcon={<UploadCloud className="w-4 h-4" />}
                className="bg-kth-primary-600 hover:bg-kth-primary-700 text-white font-bold text-xs cursor-pointer"
              >
                Upload Resource
              </Button>
            </div>

            <div className="divide-y divide-kth-slate-100">
              {resources.map((res) => (
                <div key={res.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-kth-slate-900">{res.title}</span>
                      <Badge variant={res.status === 'published' ? 'emerald' : 'slate'} className="text-[9px] uppercase">
                        {res.status}
                      </Badge>
                      <Badge variant="cyan" className="text-[9px]">
                        {res.format || 'PDF'}
                      </Badge>
                    </div>
                    <p className="text-xs text-kth-slate-500 max-w-2xl line-clamp-1">{res.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-kth-slate-400">
                      <span className="font-medium text-kth-slate-600">{res.category}</span>
                      <span>•</span>
                      <span>{res.downloads_count || 0} downloads</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-mono font-bold">{res.is_free ? 'Free' : formatINR(res.price_inr || 0)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {res.status === 'terms_pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleNavigate(`/creator/terms/resource/${res.id}`)}
                        leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                      >
                        Review Terms
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleNavigate(`/creator/resources/${res.id}/metrics`)}
                      leftIcon={<BarChart3 className="w-3.5 h-3.5 text-kth-primary-600" />}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      View Metrics
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigate(`/knowledge/${res.slug || res.id}`)}
                      leftIcon={<ExternalLink className="w-3.5 h-3.5 text-kth-slate-400" />}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Tab 3: My Templates ──────────────────────────────────────────── */}
        {activeTab === 'templates' && (
          <Card className="p-6 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-kth-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-kth-slate-900">Marketplace Templates</h3>
                <p className="text-xs text-kth-slate-500">Your ATS resume templates, audit toolkits, and assessment forms</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleNavigate('/creator/templates/new')}
                leftIcon={<UploadCloud className="w-4 h-4" />}
                className="bg-kth-primary-600 hover:bg-kth-primary-700 text-white font-bold text-xs cursor-pointer"
              >
                Add Template
              </Button>
            </div>

            <div className="divide-y divide-kth-slate-100">
              {templates.map((tpl) => (
                <div key={tpl.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-kth-slate-900">{tpl.title}</span>
                      <Badge variant={tpl.status === 'published' ? 'emerald' : 'slate'} className="text-[9px] uppercase">
                        {tpl.status}
                      </Badge>
                      <Badge variant="indigo" className="text-[9px]">
                        {tpl.formats?.[0] || 'DOCX'}
                      </Badge>
                    </div>
                    <p className="text-xs text-kth-slate-500 max-w-2xl line-clamp-1">{tpl.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-kth-slate-400">
                      <span className="font-medium text-kth-slate-600">{tpl.category}</span>
                      <span>•</span>
                      <span>{tpl.downloads_count || 0} downloads</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-mono font-bold">{tpl.is_free ? 'Free' : formatINR(tpl.price_inr || 0)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {tpl.status === 'terms_pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleNavigate(`/creator/terms/template/${tpl.id}`)}
                        leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                      >
                        Review Terms
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleNavigate(`/creator/templates/${tpl.id}/metrics`)}
                      leftIcon={<BarChart3 className="w-3.5 h-3.5 text-kth-primary-600" />}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      View Metrics
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigate(`/templates/${tpl.slug || tpl.id}`)}
                      leftIcon={<ExternalLink className="w-3.5 h-3.5 text-kth-slate-400" />}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Tab 4: Sales History Table ───────────────────────────────────── */}
        {activeTab === 'sales' && (
          <Card className="p-6 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-4">
            <div className="border-b border-kth-slate-100 pb-3">
              <h3 className="text-base font-bold text-kth-slate-900">
                Detailed Sales Transactions & Commission Ledger
              </h3>
              <p className="text-xs text-kth-slate-500">Historical transaction log with verified creator payout shares</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-kth-slate-200 bg-kth-slate-50/70 text-kth-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3.5">Item Title</th>
                    <th className="py-3 px-3.5">Type</th>
                    <th className="py-3 px-3.5">Customer</th>
                    <th className="py-3 px-3.5">Gross Sale</th>
                    <th className="py-3 px-3.5">Commission (70%)</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kth-slate-100">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-kth-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-kth-slate-900">{sale.itemTitle}</td>
                      <td className="py-3 px-3.5 capitalize font-medium text-kth-slate-600">{sale.itemType}</td>
                      <td className="py-3 px-3.5 font-mono text-kth-slate-600">{sale.buyerEmail}</td>
                      <td className="py-3 px-3.5 font-mono font-semibold text-kth-slate-800">{formatINR(sale.amountINR)}</td>
                      <td className="py-3 px-3.5 font-mono font-bold text-emerald-700">+{formatINR(sale.commissionINR)}</td>
                      <td className="py-3 px-3.5">
                        <Badge variant={sale.commissionStatus === 'available' ? 'emerald' : 'amber'} className="capitalize text-[10px]">
                          {sale.commissionStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-kth-slate-500">
                        {new Date(sale.purchasedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ── Tab 5: Payout History Table ──────────────────────────────────── */}
        {activeTab === 'payouts' && (
          <Card className="p-6 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-4">
            <div className="border-b border-kth-slate-100 pb-3">
              <h3 className="text-base font-bold text-kth-slate-900">
                Bank Withdrawal & Payout History
              </h3>
              <p className="text-xs text-kth-slate-500">All submitted and processed payout disbursements</p>
            </div>
            {payouts.length === 0 ? (
              <p className="text-xs text-kth-slate-500 py-8 text-center">No payout withdrawals requested yet.</p>
            ) : (
              <div className="divide-y divide-kth-slate-100">
                {payouts.map((po) => (
                  <div key={po.id} className="py-3.5 flex items-center justify-between text-xs gap-4">
                    <div>
                      <p className="font-mono font-bold text-kth-slate-900 text-sm">{formatINR(po.amountINR)} Disbursement</p>
                      <p className="text-[11px] text-kth-slate-500 font-mono mt-0.5">
                        Reference: {po.referenceNumber} • {new Date(po.requestedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </p>
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
