// ConfigValidator.ts
// Enforces strict environment check validations for production readiness.

export interface ConfigValidationResult {
  isValid: boolean;
  missingVariables: string[];
  errorMessage?: string;
}

const REQUIRED_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

export const validateConfig = (): ConfigValidationResult => {
  const missingVariables: string[] = [];
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

  for (const key of REQUIRED_VARS) {
    const value = import.meta.env[key];
    if (!value || value === 'https://your-supabase-url.supabase.co' || value === 'your-anon-key-placeholder') {
      missingVariables.push(key);
    }
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
