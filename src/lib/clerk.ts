// Clerk publishable key lookup
export const CLERK_PUBLISHABLE_KEY = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string) || '';

// Status flag indicating whether Clerk is configured in .env
export const isClerkConfigured = !!CLERK_PUBLISHABLE_KEY && CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder';
