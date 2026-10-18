import { getServerSupabaseClient } from './_serverPayment.js';

async function parseBody(req: any) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

/**
 * Serverless 90-Day Notification Pruning Cron Handler
 * Endpoint: /api/cron/purge-notifications
 *
 * Security Contract:
 * 1. Require POST or GET with Authorization header or CRON_SECRET query param.
 * 2. Verify CRON_SECRET against process.env.CRON_SECRET, or authenticate an admin JWT.
 * 3. Invoke PostgreSQL stored procedure `purge_expired_notifications_90d()` via service-role client.
 * 4. Return structured metric { success: true, purgedCount, timestamp }.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed. Only GET and POST requests are accepted.',
      code: 'METHOD_NOT_ALLOWED',
    });
  }

  try {
    const authHeader = req.headers?.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const querySecret = req.query?.secret || req.query?.cron_secret;

    const cronSecret = process.env.CRON_SECRET;
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
    let isAuthorized = false;

    // Check CRON_SECRET (Vercel Cron standard)
    if (cronSecret) {
      if (querySecret && querySecret === cronSecret) {
        isAuthorized = true;
      } else if (token && token === cronSecret) {
        isAuthorized = true;
      }
    } else if (isProduction) {
      // In production, fail closed immediately if CRON_SECRET is not configured
      console.error('[PurgeNotificationsCron] CRON_SECRET environment variable is not configured in production.');
      return res.status(500).json({
        error: 'CRON_SECRET environment variable is not configured.',
        code: 'CONFIGURATION_ERROR',
      });
    }

    const supabase = getServerSupabaseClient();

    // If not authorized via CRON_SECRET, check if caller is an authenticated Admin
    if (!isAuthorized && token) {
      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (!authError && authData?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (profile?.role === 'admin' && profile?.status === 'active') {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return res.status(401).json({
        error: 'Unauthorized. Valid CRON_SECRET or Admin Bearer token required.',
        code: 'UNAUTHORIZED',
      });
    }

    // Call public.purge_expired_notifications_90d() using service-role client
    const { data: purgedCount, error: rpcError } = await supabase.rpc('purge_expired_notifications_90d');

    if (rpcError) {
      return res.status(500).json({
        error: 'Failed to execute notification purge RPC.',
        code: 'RPC_ERROR',
        details: rpcError.message,
      });
    }

    return res.status(200).json({
      success: true,
      purgedCount: purgedCount ?? 0,
      timestamp: new Date().toISOString(),
      message: `Successfully executed 90-day retention cleanup. Deleted ${purgedCount ?? 0} expired notifications.`,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Internal server error during notification purge.',
      code: 'INTERNAL_ERROR',
      message: err?.message || String(err),
    });
  }
}
