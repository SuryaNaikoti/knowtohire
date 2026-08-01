// ConfigValidator.ts
// Enforces strict environment check validations for production readiness.

export interface ConfigValidationResult {
  isValid: boolean;
  missingVariables: string[];
  errorMessage?: string;
}


export const validateConfig = (): ConfigValidationResult => {
  const missingVariables: string[] = [];
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url || url === 'https://your-supabase-url.supabase.co' || url === 'https://placeholder.supabase.co') {
    missingVariables.push('VITE_SUPABASE_URL');
  }

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const pubKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const hasValidKey = (anonKey && anonKey !== 'your-anon-key-placeholder' && anonKey !== 'placeholder-key') || 
                      (pubKey && pubKey !== 'your-publishable-key-placeholder');

  if (!hasValidKey) {
    missingVariables.push('VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)');
  }

  if (missingVariables.length > 0) {
    const errorMsg = `Production Configuration Error: Missing required environment variables: ${missingVariables.join(', ')}. Mock fallback is strictly disabled in production.`;
    
    if (isProduction) {
      // In production mode, crash immediately to prevent silent fallbacks
      console.error('[FATAL CONFIG ERROR]', errorMsg);
      return {
        isValid: false,
        missingVariables,
        errorMessage: errorMsg
      };
    }
  }

  return {
    isValid: true,
    missingVariables
  };
};
