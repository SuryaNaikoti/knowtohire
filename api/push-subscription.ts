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
 * Serverless Push Subscription Handler
 * Endpoint: /api/push-subscription
 *
 * Security Contract:
 * 1. Require POST (subscribe/reassign) or DELETE (unsubscribe).
 * 2. Authenticate caller via Bearer JWT through Supabase Auth (supabase.auth.getUser).
 * 3. Validate push subscription payload { endpoint, keys: { p256dh, auth }, user_agent }.
 * 4. Secure Endpoint Collision Handling:
 *    - If the endpoint already exists in public.push_subscriptions for another user,
 *      reassign it to the authenticated caller and remove stale owner records.
 *    - Upsert with user_id = callerId.
 * 5. Return structured status { success: true, subscriptionId }.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({
      error: 'Method Not Allowed. Only POST and DELETE requests are accepted.',
      code: 'METHOD_NOT_ALLOWED',
    });
  }

  try {
    const authHeader = req.headers?.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required. Missing Bearer token.',
        code: 'UNAUTHORIZED',
      });
    }

    const supabase = getServerSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData?.user) {
      return res.status(401).json({
        error: 'Invalid, expired, or revoked authentication session.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const callerId = authData.user.id;
    const body = await parseBody(req);

    if (req.method === 'DELETE') {
      const endpoint = body?.endpoint || req.query?.endpoint;
      if (!endpoint || typeof endpoint !== 'string') {
        return res.status(400).json({
          error: 'Missing or invalid endpoint for unsubscription.',
          code: 'BAD_REQUEST',
        });
      }

      const { error: delError } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', callerId)
        .eq('endpoint', endpoint);

      if (delError) {
        return res.status(500).json({
          error: 'Failed to remove push subscription.',
          code: 'DATABASE_ERROR',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Push subscription successfully removed.',
      });
    }

    // POST: Register or Reassign Push Subscription
    const { endpoint, keys, user_agent } = body || {};

    if (!endpoint || typeof endpoint !== 'string' || !endpoint.startsWith('https://')) {
      return res.status(400).json({
        error: 'Invalid push subscription endpoint. Must be a valid secure URL.',
        code: 'INVALID_ENDPOINT',
      });
    }

    const p256dh = keys?.p256dh;
    const auth = keys?.auth;

    if (!p256dh || typeof p256dh !== 'string' || !auth || typeof auth !== 'string') {
      return res.status(400).json({
        error: 'Invalid cryptographic keys. p256dh and auth are required.',
        code: 'INVALID_KEYS',
      });
    }

    // Secure Collision Handling: Check if endpoint exists for another user
    const { data: existingSub } = await supabase
      .from('push_subscriptions')
      .select('id, user_id')
      .eq('endpoint', endpoint)
      .maybeSingle();

    if (existingSub) {
      if (existingSub.user_id !== callerId) {
        // Device re-assigned to a new authenticated account: purge stale subscription
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', endpoint);
      }
    }

    // Upsert subscription for the caller
    const { data: newSub, error: subError } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: callerId,
        endpoint,
        p256dh,
        auth,
        user_agent: typeof user_agent === 'string' ? user_agent.slice(0, 255) : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'endpoint',
      })
      .select('id, endpoint, created_at')
      .single();

    if (subError) {
      return res.status(500).json({
        error: 'Failed to persist push subscription.',
        code: 'DATABASE_ERROR',
      });
    }

    return res.status(200).json({
      success: true,
      subscription: newSub,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'An internal error occurred while processing push subscription.',
      code: 'INTERNAL_SERVER_ERROR',
      message: err?.message,
    });
  }
}
