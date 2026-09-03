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
};
