import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables (Vite import.meta.env or Node process.env)
const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL);

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_ANON_KEY);

// Validation for missing or placeholder environment configuration
const isConfigValid = 
  Boolean(supabaseUrl) && 
  Boolean(supabaseAnonKey) && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' && 
  supabaseAnonKey !== 'your-supabase-anon-key-here';

if (!isConfigValid) {
  console.warn(
    '[KnowToHire Supabase] Missing or placeholder Supabase credentials in environment variables.\n' +
    'Please copy .env.example to .env.local and configure your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Fallback values prevent module initialization crashes during development pre-config
const finalUrl: string = (isConfigValid && typeof supabaseUrl === 'string') ? supabaseUrl : 'https://placeholder.supabase.co';
const finalKey: string = (isConfigValid && typeof supabaseAnonKey === 'string') ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = (): boolean => isConfigValid;
