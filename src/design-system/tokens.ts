/**
 * KnowToHire Master Design System Tokens (V2 Definitive)
 * Visual Identity: "Professional Intelligence"
 * Brand Statement: "Know More. Hire Better. Grow Faster."
 * Concept: "Knowledge → Opportunity → Growth"
 */

export const COLORS = {
  // Primary SaaS Indigo (12% usage)
  primary: {
    900: '#1E1B4B',
    800: '#312E81',
    700: '#4338CA',
    600: '#4F46E5', // Primary Brand Action
    500: '#6366F1',
    400: '#818CF8',
    100: '#E0E7FF',
    50:  '#EEF2FF',
  },
  // Growth Accent (5% usage)
  emerald: {
    500: '#10B981', // Growth, Verification & Match Scores
    600: '#059669',
    100: '#D1FAE5',
  },
  // Intelligence Accent (3% usage)
  cyan: {
    500: '#06B6D4', // Intelligence & Recommendation Insights
    100: '#CFFAFE',
    teal: '#0D9488',
  },
  // Neutrals (80% dominant)
  slate: {
    900: '#0F172A',
    800: '#1E293B',
    700: '#334155',
    600: '#475569',
    500: '#64748B',
    400: '#94A3B8',
    300: '#CBD5E1',
    200: '#E2E8F0',
    100: '#F1F5F9',
    50:  '#F8FAFC',
  },
  white: '#FFFFFF',
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error:   '#EF4444',
    info:    '#0EA5E9',
  }
} as const;

export const TYPOGRAPHY = {
  displayFont: 'Plus Jakarta Sans, Inter, sans-serif',
  bodyFont: 'Inter, system-ui, sans-serif',
  monoFont: 'JetBrains Mono, monospace',
  scale: {
    displayXL: 'text-[48px] leading-[1.15] font-bold tracking-tight',
    h1: 'text-[36px] leading-[1.2] font-bold tracking-tight',
    h2: 'text-[28px] leading-[1.25] font-semibold tracking-tight',
    h3: 'text-[22px] leading-[1.3] font-semibold',
    h4: 'text-[18px] leading-[1.35] font-semibold',
    bodyLarge: 'text-[16px] leading-[1.5] font-normal',
    bodyBase: 'text-[14px] leading-[1.5] font-normal',
    small: 'text-[12px] leading-[1.4] font-medium',
    caption: 'text-[11px] leading-[1.3] font-semibold uppercase tracking-wider',
  }
} as const;

export const RADII = {
  controls: 'rounded-[6px]', // Buttons & Inputs
  cards: 'rounded-[12px]',    // Standard Cards
  features: 'rounded-[16px]', // Hero & Feature Banners
  pills: 'rounded-full',      // Status Tags ONLY
} as const;

/**
 * Formats a currency figure into Indian Rupee (₹) Lakhs/Crores notation
 * Examples: 2400000 -> ₹24L, 4860000 -> ₹48.6L, 48200000 -> ₹4.82Cr
 */
export function formatINR(amount: number, isPerYear = false): string {
  let formatted = '';
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2).replace(/\.00$/, '');
    formatted = `₹${cr}Cr`;
  } else if (amount >= 100000) {
    const lakh = (amount / 100000).toFixed(1).replace(/\.0$/, '');
    formatted = `₹${lakh}L`;
  } else {
    formatted = `₹${amount.toLocaleString('en-IN')}`;
  }
  return isPerYear ? `${formatted}/yr` : formatted;
}
