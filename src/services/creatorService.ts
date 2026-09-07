/**
 * KnowToHire Creator Service
 * Manages Creator statistics, content associations, commission calculations,
 * and minimum threshold-governed payout requests.
 */

import { adminSettingsService } from './adminSettingsService';
import { knowledgeService } from './knowledgeService';
import { templateService } from './templateService';
import { ServiceResult, normalizeServiceError } from './types';

export interface CreatorStats {
  totalResources: number;
  totalTemplates: number;
  totalItemsSold: number;
  totalRevenueINR: number;
  totalCommissionINR: number;
  pendingCommissionINR: number;
  availableCommissionINR: number;
  paidCommissionINR: number;
  minPayoutThresholdINR: number;
  commissionPercentage: number;
  isEligibleForPayout: boolean;
  payoutProgressPercentage: number;

  // Content Workflow Status Counts
  publishedCount: number;
  underReviewCount: number;
  actionRequiredCount: number;
  draftCount: number;
  changesRequestedCount: number;
  rejectedCount: number;
}

export type ContentItemType = 'resource' | 'template';

export interface CreatorContentQueueItem {
  id: string;
  type: ContentItemType;
  title: string;
  category: string;
  creatorName: string;
  creatorEmail: string;
  status: string;
  submittedAt?: string;
  sellingPriceINR?: number;
  creatorCommissionPct?: number;
  platformSharePct?: number;
  creatorEarningsPerSaleINR?: number;
  termsVersion?: number;
  reviewFeedback?: string;
  rejectionReason?: string;
  adminNotes?: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: string | null;
  description: string;
  coverUrl?: string | null;
  format?: string;
  updatedAt?: string;
}

export interface CreatorSaleItem {
  id: string;
  itemId: string;
  itemTitle: string;
  itemType: 'template' | 'resource';
  amountINR: number;
  commissionINR: number;
  commissionStatus: 'pending' | 'available' | 'paid';
  purchasedAt: string;
  buyerEmail: string;
}

export interface CreatorPayoutRecord {
  id: string;
  creatorId: string;
  amountINR: number;
  status: 'processing' | 'paid' | 'rejected';
  requestedAt: string;
  processedAt?: string | null;
  referenceNumber: string;
}

const STORAGE_CREATOR_SALES_KEY = 'kth_creator_sales_data';
const STORAGE_CREATOR_PAYOUTS_KEY = 'kth_creator_payouts_data';

function notifyCreatorChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kth_creator_data_changed'));
  }
}

function getStoredSales(): CreatorSaleItem[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_CREATOR_SALES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }

  // Seed realistic starter sales for demo creator
  const seedSales: CreatorSaleItem[] = [
    {
      id: 'sale-001',
      itemId: 'tpl-esg-audit-01',
      itemTitle: 'Enterprise ESG Audit Checklist & Assurance Toolkit',
      itemType: 'template',
      amountINR: 1499,
      commissionINR: 1049,
      commissionStatus: 'available',
      purchasedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      buyerEmail: 'recruiter@tcs.com',
    },
    {
      id: 'sale-002',
      itemId: 'res-sebi-brsr-01',
      itemTitle: 'SEBI BRSR Comprehensive Technical Handbook 2026',
      itemType: 'resource',
      amountINR: 999,
      commissionINR: 699,
      commissionStatus: 'available',
      purchasedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      buyerEmail: 'esg.lead@wipro.com',
    },
    {
      id: 'sale-003',
      itemId: 'tpl-ats-resume-01',
      itemTitle: 'Executive ATS Resume Template — Carbon Auditing',
      itemType: 'template',
      amountINR: 499,
      commissionINR: 349,
      commissionStatus: 'pending',
      purchasedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      buyerEmail: 'rahul.v@gmail.com',
    },
  ];

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_CREATOR_SALES_KEY, JSON.stringify(seedSales));
    } catch {
      // ignore
    }
  }

  return seedSales;
}

function getStoredPayouts(): CreatorPayoutRecord[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_CREATOR_PAYOUTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getActiveUserRole(): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem('kth_demo_auth_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.role || null;
    }
  } catch {
    // ignore
  }
  return null;
}

export const creatorService = {
  /**
   * Get configured commission rate and payout threshold from Admin Settings
   */
  async getMonetizationConfig() {
    const settingsRes = await adminSettingsService.getSettings();
    const config = settingsRes.data?.creatorPayout || {
      minPayoutThresholdINR: 1500,
      creatorCommissionPct: 70,
    };
    return {
      minPayoutThresholdINR: config.minPayoutThresholdINR || 1500,
      commissionPercentage: config.creatorCommissionPct || 70,
    };
  },

  /**
   * Fetch aggregate metrics and payout progress for the current creator.
   */
  async getCreatorStats(_creatorId?: string): Promise<ServiceResult<CreatorStats>> {
    try {
      const config = await this.getMonetizationConfig();
      const sales = getStoredSales();
      const payouts = getStoredPayouts();

      // Fetch Creator's resources & templates
      const [resList, tplList] = await Promise.all([
        knowledgeService.getResources({ status: 'all' }),
        templateService.getTemplates({ status: 'all' }),
      ]);

      const resources = resList.data || [];
      const templates = tplList.data || [];

      let totalRevenueINR = 0;
      let totalCommissionINR = 0;
      let pendingCommissionINR = 0;
      let availableCommissionINR = 0;

      for (const sale of sales) {
        totalRevenueINR += sale.amountINR;
        totalCommissionINR += sale.commissionINR;
        if (sale.commissionStatus === 'available') {
          availableCommissionINR += sale.commissionINR;
        } else if (sale.commissionStatus === 'pending') {
          pendingCommissionINR += sale.commissionINR;
        }
      }

      let paidCommissionINR = 0;
      for (const payout of payouts) {
        if (payout.status === 'paid') {
          paidCommissionINR += payout.amountINR;
        }
      }

      // Available is net of paid
      const netAvailable = Math.max(0, availableCommissionINR - paidCommissionINR);
      const isEligibleForPayout = netAvailable >= config.minPayoutThresholdINR;
      const progress = Math.min(100, Math.round((netAvailable / config.minPayoutThresholdINR) * 100));

      // Calculate Content Workflow Counts across both resources and templates
      const allItems = [
        ...resources.map((r) => ({ ...r, itemType: 'resource' as const })),
        ...templates.map((t) => ({ ...t, itemType: 'template' as const })),
      ];

      const publishedCount = allItems.filter((i) => i.status === 'published').length;
      const underReviewCount = allItems.filter((i) => i.status === 'pending_review').length;
      const actionRequiredCount = allItems.filter((i) => i.status === 'terms_pending').length;
      const draftCount = allItems.filter((i) => i.status === 'draft').length;
      const changesRequestedCount = allItems.filter((i) => i.status === 'changes_requested').length;
      const rejectedCount = allItems.filter((i) => i.status === 'rejected').length;

      return {
        data: {
          totalResources: resources.length,
          totalTemplates: templates.length,
          totalItemsSold: sales.length,
          totalRevenueINR,
          totalCommissionINR,
          pendingCommissionINR,
          availableCommissionINR: netAvailable,
          paidCommissionINR,
          minPayoutThresholdINR: config.minPayoutThresholdINR,
          commissionPercentage: config.commissionPercentage,
          isEligibleForPayout,
          payoutProgressPercentage: progress,
          publishedCount,
          underReviewCount,
          actionRequiredCount,
          draftCount,
          changesRequestedCount,
          rejectedCount,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Get all sales transactions for Creator
   */
  async getSales(_creatorId?: string): Promise<ServiceResult<CreatorSaleItem[]>> {
    try {
      return { data: getStoredSales(), error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Get all payout records for Creator
   */
  async getPayouts(_creatorId?: string): Promise<ServiceResult<CreatorPayoutRecord[]>> {
    try {
      return { data: getStoredPayouts(), error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Request a payout if available commission meets or exceeds minimum threshold.
   */
  async requestPayout(creatorId: string = '00000000-0000-0000-0000-000000000004'): Promise<ServiceResult<CreatorPayoutRecord>> {
    try {
      const statsRes = await this.getCreatorStats(creatorId);
      if (statsRes.error || !statsRes.data) {
        return { data: null, error: { message: 'Failed to verify payout balance', code: 'BALANCE_ERROR', status: 400 } };
      }

      const { availableCommissionINR, minPayoutThresholdINR, isEligibleForPayout } = statsRes.data;

      if (!isEligibleForPayout || availableCommissionINR < minPayoutThresholdINR) {
        return {
          data: null,
          error: {
            message: `Minimum payout threshold of ₹${minPayoutThresholdINR.toLocaleString()} not reached. Current available: ₹${availableCommissionINR.toLocaleString()}`,
            code: 'THRESHOLD_UNMET',
            status: 422,
          },
        };
      }

      const newPayout: CreatorPayoutRecord = {
        id: `payout-${Date.now()}`,
        creatorId,
        amountINR: availableCommissionINR,
        status: 'paid', // Immediately approved & marked paid in demo simulation
        requestedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        referenceNumber: `PO-KTH-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      const payouts = getStoredPayouts();
      payouts.unshift(newPayout);

      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_CREATOR_PAYOUTS_KEY, JSON.stringify(payouts));
      }

      notifyCreatorChanged();
      return { data: newPayout, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Get metrics for a specific resource or template
   */
  async getItemMetrics(itemId: string, itemType: 'resource' | 'template') {
    const config = await this.getMonetizationConfig();
    const allSales = getStoredSales().filter((s) => s.itemId === itemId);

    let totalRevenue = 0;
    let totalCommission = 0;
    for (const s of allSales) {
      totalRevenue += s.amountINR;
      totalCommission += s.commissionINR;
    }

    const views = Math.max(140, allSales.length * 28 + 42);
    const conversionRate = views > 0 ? ((allSales.length / views) * 100).toFixed(1) : '0.0';

    return {
      itemId,
      itemType,
      views,
      salesCount: allSales.length,
      totalRevenueINR: totalRevenue,
      creatorCommissionINR: totalCommission,
      conversionRate: `${conversionRate}%`,
      salesHistory: allSales,
      commissionPercentage: config.commissionPercentage,
    };
  },

  /**
   * Admin: Get all Creator content submissions in a unified queue
   */
  async getAdminContentQueue(filterStatus?: string): Promise<ServiceResult<CreatorContentQueueItem[]>> {
    try {
      const [resList, tplList] = await Promise.all([
        knowledgeService.getResources({ status: 'all' }),
        templateService.getTemplates({ status: 'all' }),
      ]);

      const items: CreatorContentQueueItem[] = [];

      for (const r of resList.data || []) {
        // Exclude system items that are not part of review lifecycle if needed, or include all
        items.push({
          id: r.id,
          type: 'resource',
          title: r.title,
          category: r.category,
          creatorName: r.author || 'KnowToHire Creator Desk',
          creatorEmail: 'creator@knowtohire.com',
          status: r.status,
          submittedAt: r.submitted_at || r.created_at,
          sellingPriceINR: r.selling_price_inr ?? r.price_inr,
          creatorCommissionPct: r.creator_commission_pct,
          platformSharePct: r.platform_share_pct,
          creatorEarningsPerSaleINR: r.creator_earnings_per_sale_inr,
          termsVersion: r.terms_version,
          reviewFeedback: r.review_feedback,
          rejectionReason: r.rejection_reason,
          adminNotes: r.admin_notes,
          fileUrl: r.file_url,
          fileName: r.file_name,
          fileSize: r.file_size,
          description: r.description,
          coverUrl: r.cover_url,
          format: r.format,
          updatedAt: r.updated_at || r.created_at,
        });
      }

      for (const t of tplList.data || []) {
        items.push({
          id: t.id,
          type: 'template',
          title: t.title,
          category: t.category,
          creatorName: 'Aarav Sharma (Verified Creator)',
          creatorEmail: 'aarav.sharma@knowtohire.com',
          status: t.status,
          submittedAt: t.submitted_at || t.created_at,
          sellingPriceINR: t.selling_price_inr ?? t.price_inr,
          creatorCommissionPct: t.creator_commission_pct,
          platformSharePct: t.platform_share_pct,
          creatorEarningsPerSaleINR: t.creator_earnings_per_sale_inr,
          termsVersion: t.terms_version,
          reviewFeedback: t.review_feedback,
          rejectionReason: t.rejection_reason,
          adminNotes: t.admin_notes,
          fileUrl: t.file_url || t.download_url,
          fileName: t.file_name,
          fileSize: t.file_size,
          description: t.description,
          coverUrl: t.cover_url,
          format: t.formats?.[0] || 'DOCX',
          updatedAt: t.updated_at || t.created_at,
        });
      }

      // Sort newest submitted first
      items.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());

      if (filterStatus && filterStatus !== 'all') {
        return { data: items.filter((i) => i.status === filterStatus), error: null };
      }

      return { data: items, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Set Commercial Terms & Send to Creator for Acceptance
   */
  async adminSetCommercialTerms(
    id: string,
    type: ContentItemType,
    terms: {
      sellingPriceINR: number;
      creatorCommissionPct: number;
      adminNotes?: string;
      adminEmail?: string;
    }
  ): Promise<ServiceResult<boolean>> {
    try {
      // Authorization Guard: Only Admin can set commercial terms
      const activeRole = getActiveUserRole();
      if (activeRole && activeRole !== 'admin') {
        return {
          data: null,
          error: {
            message: 'Unauthorized: Only platform administrators can set commercial terms or royalties.',
            code: 'FORBIDDEN',
            status: 403,
          },
        };
      }

      const price = Number(terms.sellingPriceINR) || 0;
      const commissionPct = Number(terms.creatorCommissionPct) || 0;
      const platformSharePct = Math.max(0, 100 - commissionPct);
      // Accurate two-decimal currency math: (price * commissionPct) / 100 rounded to 2 decimals
      const creatorEarnings = Math.round(((price * commissionPct) / 100) * 100) / 100;
      const now = new Date().toISOString();

      const extraUpdates: any = {
        selling_price_inr: price,
        creator_commission_pct: commissionPct,
        platform_share_pct: platformSharePct,
        creator_earnings_per_sale_inr: creatorEarnings,
        terms_version: Date.now(),
        terms_set_by: terms.adminEmail || 'admin@knowtohire.com',
        terms_set_at: now,
        admin_notes: terms.adminNotes,
        // Reset any previous acceptance since terms changed
        terms_accepted_at: undefined,
        terms_accepted_by: undefined,
        terms_accepted_version: undefined,
      };

      if (type === 'resource') {
        extraUpdates.price_inr = price;
        extraUpdates.is_free = price === 0;
        await knowledgeService.updateResourceStatus(id, 'terms_pending', extraUpdates);
      } else {
        extraUpdates.price = price;
        extraUpdates.price_inr = price;
        extraUpdates.is_free = price === 0;
        await templateService.updateTemplateStatus(id, 'terms_pending', extraUpdates);
      }

      notifyCreatorChanged();
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Request Changes from Creator
   */
  async adminRequestChanges(
    id: string,
    type: ContentItemType,
    feedback: string
  ): Promise<ServiceResult<boolean>> {
    try {
      const activeRole = getActiveUserRole();
      if (activeRole && activeRole !== 'admin') {
        return {
          data: null,
          error: {
            message: 'Unauthorized: Only platform administrators can request content revisions.',
            code: 'FORBIDDEN',
            status: 403,
          },
        };
      }

      const extraUpdates = {
        review_feedback: feedback.trim(),
        updated_at: new Date().toISOString(),
      };

      if (type === 'resource') {
        await knowledgeService.updateResourceStatus(id, 'changes_requested', extraUpdates);
      } else {
        await templateService.updateTemplateStatus(id, 'changes_requested', extraUpdates);
      }

      notifyCreatorChanged();
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Reject Content Submission
   */
  async adminRejectContent(
    id: string,
    type: ContentItemType,
    reason: string
  ): Promise<ServiceResult<boolean>> {
    try {
      const activeRole = getActiveUserRole();
      if (activeRole && activeRole !== 'admin') {
        return {
          data: null,
          error: {
            message: 'Unauthorized: Only platform administrators can reject content submissions.',
            code: 'FORBIDDEN',
            status: 403,
          },
        };
      }

      const extraUpdates = {
        rejection_reason: reason.trim(),
        updated_at: new Date().toISOString(),
      };

      if (type === 'resource') {
        await knowledgeService.updateResourceStatus(id, 'rejected', extraUpdates);
      } else {
        await templateService.updateTemplateStatus(id, 'rejected', extraUpdates);
      }

      notifyCreatorChanged();
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Creator: Review & Accept Commercial Terms
   */
  async creatorAcceptTerms(
    id: string,
    type: ContentItemType,
    creatorEmail: string = 'creator@knowtohire.com'
  ): Promise<ServiceResult<boolean>> {
    try {
      let currentItem: any = null;
      if (type === 'resource') {
        const res = await knowledgeService.getResourceByIdOrSlug(id);
        currentItem = res.data;
      } else {
        const res = await templateService.getTemplateByIdOrSlug(id);
        currentItem = res.data;
      }

      if (!currentItem) {
        return { data: null, error: { message: 'Item not found', code: 'NOT_FOUND', status: 404 } };
      }

      // Ownership Guard: Only content owner or admin can accept terms
      const authSessionRaw = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('kth_demo_auth_session') : null;
      if (authSessionRaw) {
        try {
          const authUser = JSON.parse(authSessionRaw);
          if (authUser.role === 'creator' && currentItem.creator_id && currentItem.creator_id !== authUser.id) {
            return {
              data: null,
              error: { message: 'Forbidden: You cannot accept terms for another creator\'s content.', code: 'FORBIDDEN', status: 403 },
            };
          }
        } catch {
          // ignore
        }
      }

      if (currentItem.status !== 'terms_pending') {
        return {
          data: null,
          error: { message: 'Item is not awaiting terms acceptance.', code: 'INVALID_STATE', status: 400 },
        };
      }

      const now = new Date().toISOString();
      const acceptanceRecord = {
        terms_accepted_by: creatorEmail,
        terms_accepted_at: now,
        terms_accepted_version: currentItem.terms_version || Date.now(),
      };

      if (type === 'resource') {
        await knowledgeService.updateResourceStatus(id, 'ready_to_publish', acceptanceRecord);
      } else {
        await templateService.updateTemplateStatus(id, 'ready_to_publish', acceptanceRecord);
      }

      notifyCreatorChanged();
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Creator: Decline Commercial Terms
   */
  async creatorDeclineTerms(
    id: string,
    type: ContentItemType,
    feedback?: string
  ): Promise<ServiceResult<boolean>> {
    try {
      let currentItem: any = null;
      if (type === 'resource') {
        const res = await knowledgeService.getResourceByIdOrSlug(id);
        currentItem = res.data;
      } else {
        const res = await templateService.getTemplateByIdOrSlug(id);
        currentItem = res.data;
      }

      if (!currentItem) {
        return { data: null, error: { message: 'Item not found', code: 'NOT_FOUND', status: 404 } };
      }

      // Ownership Guard: Only content owner or admin can decline terms
      const authSessionRaw = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('kth_demo_auth_session') : null;
      if (authSessionRaw) {
        try {
          const authUser = JSON.parse(authSessionRaw);
          if (authUser.role === 'creator' && currentItem.creator_id && currentItem.creator_id !== authUser.id) {
            return {
              data: null,
              error: { message: 'Forbidden: You cannot decline terms for another creator\'s content.', code: 'FORBIDDEN', status: 403 },
            };
          }
        } catch {
          // ignore
        }
      }

      const declineReason = feedback?.trim() || 'Creator declined proposed commercial terms. Awaiting revised commercial terms or discussion.';
      const extraUpdates = {
        review_feedback: `[Creator Declined Terms]: ${declineReason}`,
        admin_notes: `Creator declined commercial terms on ${new Date().toLocaleDateString()}: "${declineReason}"`,
        updated_at: new Date().toISOString(),
      };

      if (type === 'resource') {
        await knowledgeService.updateResourceStatus(id, 'changes_requested', extraUpdates);
      } else {
        await templateService.updateTemplateStatus(id, 'changes_requested', extraUpdates);
      }

      notifyCreatorChanged();
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Final Publication of Content
   */
  async adminFinalPublish(
    id: string,
    type: ContentItemType
  ): Promise<ServiceResult<boolean>> {
    try {
      // Authorization Guard: Only Admin can publish content
      const activeRole = getActiveUserRole();
      if (activeRole && activeRole !== 'admin') {
        return {
          data: null,
          error: {
            message: 'Unauthorized: Only platform administrators can publish content to the marketplace.',
            code: 'FORBIDDEN',
            status: 403,
          },
        };
      }

      let currentItem: any = null;
      if (type === 'resource') {
        const res = await knowledgeService.getResourceByIdOrSlug(id);
        currentItem = res.data;
      } else {
        const res = await templateService.getTemplateByIdOrSlug(id);
        currentItem = res.data;
      }

      if (!currentItem) {
        return { data: null, error: { message: 'Item not found', code: 'NOT_FOUND', status: 404 } };
      }

      // STRICT GATE 1: Status check
      if (currentItem.status !== 'ready_to_publish' && currentItem.status !== 'published') {
        return {
          data: null,
          error: {
            message: 'Content cannot be published until creator has reviewed and explicitly accepted commercial terms.',
            code: 'TERMS_NOT_ACCEPTED',
            status: 403,
          },
        };
      }

      // STRICT GATE 2: Commercial terms & exact version acceptance check
      if (
        !currentItem.creator_commission_pct ||
        !currentItem.terms_version ||
        currentItem.terms_accepted_version !== currentItem.terms_version
      ) {
        return {
          data: null,
          error: {
            message: 'Content cannot be published because the current commercial terms version was not accepted by the creator.',
            code: 'TERMS_VERSION_MISMATCH',
            status: 403,
          },
        };
      }

      const now = new Date().toISOString();
      const publishRecord = {
        published_at: now,
        is_active: true,
      };

      if (type === 'resource') {
        await knowledgeService.updateResourceStatus(id, 'published', publishRecord);
      } else {
        await templateService.updateTemplateStatus(id, 'published', publishRecord);
      }

      notifyCreatorChanged();
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },

  /**
   * Admin: Archive / Unpublish Content
   */
  async adminUnpublish(
    id: string,
    type: ContentItemType
  ): Promise<ServiceResult<boolean>> {
    try {
      const activeRole = getActiveUserRole();
      if (activeRole && activeRole !== 'admin') {
        return {
          data: null,
          error: {
            message: 'Unauthorized: Only platform administrators can archive or unpublish content.',
            code: 'FORBIDDEN',
            status: 403,
          },
        };
      }

      if (type === 'resource') {
        await knowledgeService.updateResourceStatus(id, 'archived');
      } else {
        await templateService.updateTemplateStatus(id, 'archived');
      }

      notifyCreatorChanged();
      return { data: true, error: null };
    } catch (err) {
      return { data: null, error: normalizeServiceError(err) };
    }
  },
};
