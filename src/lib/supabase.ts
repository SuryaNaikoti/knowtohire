import { createClient } from '@supabase/supabase-js';

// Production Supabase Project defaults
const DEFAULT_SUPABASE_URL = 'https://roqbodprqmnwxdjsskgb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcWJvZHBycW1ud3hkanNza2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDA1NTksImV4cCI6MjA5ODMxNjU1OX0.ZiJQHCM0bDuLoitFdMmT7s1G50Tw-HjQyl7xylpT2Nc';

// Retrieve environment variables (Vite import.meta.env or Node process.env)
const rawUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL);

const rawAnonKey = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_ANON_KEY);

const resolvedUrl: string = 
  (rawUrl && rawUrl !== 'https://your-project-ref.supabase.co') 
    ? rawUrl 
    : DEFAULT_SUPABASE_URL;

const resolvedAnonKey: string = 
  (rawAnonKey && rawAnonKey !== 'your-supabase-anon-key-here') 
    ? rawAnonKey 
    : DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(resolvedUrl, resolvedAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(resolvedUrl) &&
    Boolean(resolvedAnonKey) &&
    resolvedUrl !== 'https://your-project-ref.supabase.co' &&
    resolvedAnonKey !== 'your-supabase-anon-key-here' &&
    resolvedUrl.startsWith('https://')
  );
};
