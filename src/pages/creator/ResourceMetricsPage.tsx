import React, { useState, useEffect } from 'react';
import { CreatorShell } from '@/components/creator/CreatorShell';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/design-system/tokens';
import { creatorService } from '@/services/creatorService';
import { knowledgeService } from '@/services/knowledgeService';
import { templateService } from '@/services/templateService';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  Eye,
  TrendingUp,
  ShoppingBag,
  IndianRupee,
} from 'lucide-react';

export interface ResourceMetricsPageProps {
  itemId?: string;
  itemType?: 'resource' | 'template';
  onNavigate?: (path: string) => void;
}

export const ResourceMetricsPage: React.FC<ResourceMetricsPageProps> = ({
  itemId: propItemId,
  itemType: propItemType,
  onNavigate,
}) => {
  const { role, user } = useAuth();
  const isAdmin = role === 'admin';

  // Parse item id and type from URL if not provided directly
  // Route patterns: /creator/resources/:id/metrics, /creator/templates/:id/metrics, /admin/resources/:id/metrics
  const path = window.location.pathname;
  const inferredType = propItemType || (path.includes('/templates/') ? 'template' : 'resource');
  const inferredId = propItemId || path.split('/')[3] || '';

  const [itemData, setItemData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      let data: any = null;
      if (inferredType === 'resource') {
        const res = await knowledgeService.getResourceById(inferredId);
        data = res.data;
        if (data) setItemData(data);
      } else {
        const res = await templateService.getTemplateById(inferredId);
        data = res.data;
        if (data) setItemData(data);
      }

      // Check ownership: Admin can inspect all; Creators can only inspect their own created content
      if (!isAdmin && data) {
        const itemCreatorId = data.creator_id || data.created_by;
        const currentUserId = user?.id || '00000000-0000-0000-0000-000000000004';
        // If content is attributed to another author/creator, restrict metrics view
        if (itemCreatorId && itemCreatorId !== currentUserId) {
          setIsUnauthorized(true);
          setIsLoading(false);
          return;
        }
      }

      const m = await creatorService.getItemMetrics(inferredId, inferredType);
      setMetrics(m);
      setIsLoading(false);
    }

    if (inferredId) {
      load();
    }
  }, [inferredId, inferredType, isAdmin, user?.id]);

  const handleBack = () => {
    const backPath = isAdmin ? (inferredType === 'resource' ? '/admin/resources' : '/admin/templates') : '/creator';
    if (onNavigate) {
      onNavigate(backPath);
    } else {
      window.history.pushState({}, '', backPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  if (isUnauthorized) {
    return (
      <CreatorShell title="Private Asset Intelligence" currentPath="/creator" onNavigate={onNavigate}>
        <div className="max-w-md mx-auto my-12 bg-white rounded-2xl p-8 border border-rose-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ArrowLeft className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-lg text-kth-slate-900">Access Restricted</h2>
          <p className="text-xs text-kth-slate-500 leading-relaxed">
            You do not have permission to view private engagement and sales analytics for this asset. Only the verified author or platform administrators can inspect these metrics.
          </p>
          <div className="pt-2">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Back to My Creator Studio
            </button>
          </div>
        </div>
      </CreatorShell>
    );
  }

  const content = (
    <div className="space-y-6 font-sans max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-kth-slate-500 hover:text-kth-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isAdmin ? 'Back to Admin Management' : 'Back to Creator Studio'}</span>
        </button>
      </div>

      {/* Item Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-kth-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="indigo" className="text-[10px] uppercase font-bold">
              {inferredType === 'resource' ? 'Knowledge Hub E-Book' : 'ATS Marketplace Template'}
            </Badge>
            <Badge variant={itemData?.status === 'published' ? 'emerald' : 'slate'} className="text-[10px] uppercase">
              {itemData?.status || 'Published'}
            </Badge>
            <span className="text-xs text-kth-slate-500">{itemData?.category}</span>
          </div>
          <h1 className="font-display font-extrabold text-xl sm:text-2xl text-kth-slate-900">
            {itemData?.title || 'Resource Analytics'}
          </h1>
          <p className="text-xs text-kth-slate-500">
            Internal ID: <span className="font-mono text-kth-slate-700">{inferredId}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-kth-slate-400 block font-medium">List Price</span>
            <span className="text-lg font-bold text-emerald-700">
              {itemData?.is_free ? 'Free' : formatINR(itemData?.price_inr || 999)}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-5 bg-white border-kth-slate-200 space-y-2">
          <span className="text-xs font-bold text-kth-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Views & Impressions</span>
            <Eye className="w-4 h-4 text-sky-600" />
          </span>
          <div className="text-2xl font-bold text-kth-slate-900">{metrics?.views || 142}</div>
          <p className="text-[11px] text-kth-slate-500">Public catalogue visits</p>
        </Card>

        <Card className="p-5 bg-white border-kth-slate-200 space-y-2">
          <span className="text-xs font-bold text-kth-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Direct Purchases</span>
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
          </span>
          <div className="text-2xl font-bold text-kth-slate-900">{metrics?.salesCount || 0}</div>
          <p className="text-[11px] text-kth-slate-500">Total copies acquired</p>
        </Card>

        <Card className="p-5 bg-white border-kth-slate-200 space-y-2">
          <span className="text-xs font-bold text-kth-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Gross Sales</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </span>
          <div className="text-2xl font-bold text-kth-slate-900">{formatINR(metrics?.totalRevenueINR || 0)}</div>
          <p className="text-[11px] text-kth-slate-500">Gross revenue generated</p>
        </Card>

        <Card className="p-5 bg-white border-kth-slate-200 space-y-2">
          <span className="text-xs font-bold text-kth-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </span>
          <div className="text-2xl font-bold text-kth-slate-900">{metrics?.conversionRate || '2.8%'}</div>
          <p className="text-[11px] text-kth-slate-500">Visitor to acquisition ratio</p>
        </Card>

        <Card className="p-5 bg-white border-kth-slate-200 space-y-2">
          <span className="text-xs font-bold text-kth-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Creator Net Share</span>
            <IndianRupee className="w-4 h-4 text-amber-600" />
          </span>
          <div className="text-2xl font-bold text-emerald-700">{formatINR(metrics?.creatorCommissionINR || 0)}</div>
          <p className="text-[11px] text-kth-slate-500">Earned at {metrics?.commissionPercentage || 70}% share</p>
        </Card>
      </div>

      {/* Sales Transactions for this item */}
      <Card className="p-6 bg-white border-kth-slate-200 space-y-4">
        <h3 className="font-display font-bold text-sm text-kth-slate-900 border-b border-kth-slate-100 pb-3">
          Purchase & License Audit History
        </h3>
        {metrics?.salesHistory && metrics.salesHistory.length > 0 ? (
          <div className="divide-y divide-kth-slate-100">
            {metrics.salesHistory.map((s: any) => (
              <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-kth-slate-900 font-mono">{s.buyerEmail}</p>
                  <p className="text-[11px] text-kth-slate-500">
                    {new Date(s.purchasedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-kth-slate-900 block">{formatINR(s.amountINR)}</span>
                  <span className="text-[11px] text-emerald-700 font-bold">Commission: +{formatINR(s.commissionINR)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-kth-slate-500 space-y-1">
            <p className="font-semibold text-kth-slate-700">No recorded purchases for this asset yet.</p>
            <p>Share the direct link on LinkedIn or industry groups to accelerate downloads.</p>
          </div>
        )}
      </Card>
    </div>
  );

  if (isAdmin) {
    return (
      <AdminShell title="Resource Performance Intelligence" currentPath="/admin/resources" onNavigate={onNavigate}>
        {content}
      </AdminShell>
    );
  }

  return (
    <CreatorShell title="Asset Performance Intelligence" currentPath="/creator" onNavigate={onNavigate}>
      {content}
    </CreatorShell>
  );
};
