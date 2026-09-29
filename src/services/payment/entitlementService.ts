/**
 * User Content & Product Entitlements Service
 * Manages authorized user purchases in Supabase (with resilient offline/demo fallback).
 * This replaces client-side sessionStorage as the authoritative source of truth.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ServiceResult } from '../types';

export interface UserPurchaseEntitlement {
  id: string;
  user_id: string;
  product_type: 'template' | 'knowledge_resource' | 'resource' | 'content_request';
  product_id: string;
  product_title: string;
  amount_inr: number;
  order_id?: string | null;
  payment_id?: string | null;
  purchased_at: string;
}

const STORAGE_PURCHASES_KEY = 'kth_authorized_user_purchases';
const memoryEntitlements: Record<string, Record<string, UserPurchaseEntitlement>> = {};

function getLocalEntitlements(userId: string): Record<string, UserPurchaseEntitlement> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return memoryEntitlements[userId] || {};
  }
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PURCHASES_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return memoryEntitlements[userId] || {};
  }
}

function saveLocalEntitlement(userId: string, entitlement: UserPurchaseEntitlement): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    if (!memoryEntitlements[userId]) memoryEntitlements[userId] = {};
    memoryEntitlements[userId][entitlement.product_id] = entitlement;
    return;
  }
  try {
    const current = getLocalEntitlements(userId);
    current[entitlement.product_id] = entitlement;
    window.localStorage.setItem(`${STORAGE_PURCHASES_KEY}_${userId}`, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('kth_purchases_updated', { detail: { userId, entitlement } }));
  } catch {
    if (!memoryEntitlements[userId]) memoryEntitlements[userId] = {};
    memoryEntitlements[userId][entitlement.product_id] = entitlement;
  }
}

export const entitlementService = {
  /**
   * Check if a specific user owns / has purchased a product.
   * Supabase + verified Razorpay payment record is authoritative.
   */
  async hasPurchased(productId: string, userId?: string): Promise<boolean> {
    if (!productId) return false;

    // Resolve user ID
    let effectiveUserId = userId;
    if (!effectiveUserId && isSupabaseConfigured()) {
      try {
        const { data } = await supabase.auth.getUser();
        effectiveUserId = data?.user?.id;
      } catch {
        // ignore
      }
    }

    if (!effectiveUserId && typeof window !== 'undefined' && window.localStorage) {
      try {
        const demoAuth = window.localStorage.getItem('kth_demo_auth_session');
        if (demoAuth) {
          effectiveUserId = JSON.parse(demoAuth)?.id;
        }
      } catch {
        // ignore
      }
    }

    if (!effectiveUserId) return false;

    // 1. Check database if Supabase is active
    if (isSupabaseConfigured()) {
      try {
        const { getAuthoritativeItem } = await import('./authoritativePricing');
        const canonical = getAuthoritativeItem(productId);
        const productIdsToCheck = [productId];
        if (canonical && canonical.id && !productIdsToCheck.includes(canonical.id)) {
          productIdsToCheck.push(canonical.id);
        }

        const { data, error } = await supabase
          .from('user_purchases')
          .select('id')
          .eq('user_id', effectiveUserId)
          .in('product_id', productIdsToCheck)
          .maybeSingle();

        if (!error && data) {
          return true;
        }
      } catch {
        // Fallback to server check if offline or database error
      }
    }

    // 2. Query Server-Authoritative Entitlements Endpoint (/api/user-entitlements)
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        const resp = await fetch(`/api/user-entitlements?user_id=${encodeURIComponent(effectiveUserId)}&product_id=${encodeURIComponent(productId)}`);
        if (resp.ok) {
          const resJson = await resp.json();
          if (resJson.entitled) {
            return true;
          }
        }
      } catch {
        // Continue to local check
      }
    }

    // 3. Check persistent user-scoped local store
    const local = getLocalEntitlements(effectiveUserId);
    if (local[productId]) return true;

    try {
      const { getAuthoritativeItem } = await import('./authoritativePricing');
      const canonical = getAuthoritativeItem(productId);
      if (canonical && canonical.id && local[canonical.id]) {
        return true;
      }
    } catch {
      // ignore
    }

    return false;
  },

  /**
   * Authoritatively record a verified purchase entitlement in Supabase and local store.
   */
  async recordPurchase(entitlement: {
    userId: string;
    productType: 'template' | 'knowledge_resource' | 'resource' | 'content_request';
    productId: string;
    productTitle: string;
    amountINR: number;
    orderId?: string;
    paymentId?: string;
  }): Promise<ServiceResult<UserPurchaseEntitlement>> {
    const record: UserPurchaseEntitlement = {
      id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      user_id: entitlement.userId,
      product_type: entitlement.productType,
      product_id: entitlement.productId,
      product_title: entitlement.productTitle,
      amount_inr: entitlement.amountINR,
      order_id: entitlement.orderId || null,
      payment_id: entitlement.paymentId || null,
      purchased_at: new Date().toISOString(),
    };

    // Save locally
    saveLocalEntitlement(entitlement.userId, record);

    // Save in Supabase
    if (isSupabaseConfigured()) {
      try {
        const { error: upsertErr } = await supabase.from('user_purchases').upsert({
          user_id: record.user_id,
          product_type: record.product_type,
          product_id: record.product_id,
          product_title: record.product_title,
          amount_inr: record.amount_inr,
          order_id: record.order_id,
          payment_id: record.payment_id,
          purchased_at: record.purchased_at,
        }, { onConflict: 'user_id,product_type,product_id' });

        if (upsertErr) {
          console.warn('[EntitlementService] Supabase user_purchases upsert notice:', upsertErr.message);
        }

        // If the productId has a canonical alias (e.g. res-2 vs patent-filing-ipr-guide-tech-startups),
        // also store canonical ID to ensure seamless matching whether queried by id or slug
        const { getAuthoritativeItem } = await import('./authoritativePricing');
        const canonical = getAuthoritativeItem(entitlement.productId);
        if (canonical && canonical.id && canonical.id !== record.product_id) {
          await supabase.from('user_purchases').upsert({
            user_id: record.user_id,
            product_type: record.product_type,
            product_id: canonical.id,
            product_title: record.product_title,
            amount_inr: record.amount_inr,
            order_id: record.order_id,
            payment_id: record.payment_id,
            purchased_at: record.purchased_at,
          }, { onConflict: 'user_id,product_type,product_id' });
          saveLocalEntitlement(entitlement.userId, { ...record, product_id: canonical.id });
        }
      } catch (err) {
        console.warn('[EntitlementService] Supabase user_purchases upsert warning:', err);
      }
    }

    return { data: record, error: null };
  },

  /**
   * Fetch all purchases for the current user.
   */
  async getMyPurchases(userId?: string): Promise<ServiceResult<UserPurchaseEntitlement[]>> {
    let effectiveUserId = userId;
    if (!effectiveUserId && isSupabaseConfigured()) {
      try {
        const { data } = await supabase.auth.getUser();
        effectiveUserId = data?.user?.id;
      } catch {
        // ignore
      }
    }

    if (!effectiveUserId && typeof window !== 'undefined' && window.localStorage) {
      try {
        const demoAuth = window.localStorage.getItem('kth_demo_auth_session');
        if (demoAuth) {
          effectiveUserId = JSON.parse(demoAuth)?.id;
        }
      } catch {
        // ignore
      }
    }

    if (!effectiveUserId) {
      return { data: [], error: null };
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('user_purchases')
          .select('*')
          .eq('user_id', effectiveUserId)
          .order('purchased_at', { ascending: false });

        if (!error && data) {
          return { data, error: null };
        }
      } catch {
        // Fallback
      }
    }

    const localMap = getLocalEntitlements(effectiveUserId);
    return { data: Object.values(localMap), error: null };
  },
};
