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

export type TargetAudience = 'all' | 'candidates' | 'employers' | 'creators';

/**
 * Serverless Admin Notification Broadcast Handler
 * Endpoint: /api/admin-broadcast-notification
 *
 * Security Contract:
 * 1. Require POST method only.
 * 2. Authenticate caller via Bearer JWT through Supabase Auth (supabase.auth.getUser).
 * 3. Authorize caller strictly: must be active admin in public.profiles (role = 'admin' AND status = 'active').
 * 4. Input validation:
 *    - title: required string (1-200 chars).
 *    - message: required string (1-2000 chars).
 *    - target_audience: 'all' | 'candidates' | 'employers' | 'creators'.
 *    - action_url: optional string.
 * 5. Uses server-side service-role client to query active target recipients and bulk insert into public.notifications.
 * 6. Returns structured status { success: true, count, target_audience }.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed. Only POST requests are accepted.',
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

    // Verify caller role and active status
    const { data: callerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', callerId)
      .maybeSingle();

    if (profileError || callerProfile?.role !== 'admin' || callerProfile?.status !== 'active') {
      return res.status(403).json({
        error: 'Forbidden: Only active platform administrators can broadcast notifications.',
        code: 'FORBIDDEN',
      });
    }

    const body = await parseBody(req);
    const { title, message, target_audience = 'all', action_url, category = 'system' } = body || {};

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Title is required.',
        code: 'INVALID_TITLE',
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required.',
        code: 'INVALID_MESSAGE',
      });
    }

    const allowedAudiences: TargetAudience[] = ['all', 'candidates', 'employers', 'creators'];
    if (!allowedAudiences.includes(target_audience)) {
      return res.status(400).json({
        error: `Invalid target audience. Allowed: ${allowedAudiences.join(', ')}`,
        code: 'INVALID_AUDIENCE',
      });
    }

    // Query target active user profile IDs
    let query = supabase
      .from('profiles')
      .select('id, role')
      .eq('status', 'active');

    if (target_audience === 'candidates') {
      query = query.eq('role', 'candidate');
    } else if (target_audience === 'employers') {
      query = query.eq('role', 'employer');
    } else if (target_audience === 'creators') {
      query = query.eq('role', 'creator');
    }

    const { data: targetProfiles, error: queryError } = await query;

    if (queryError) {
      return res.status(500).json({
        error: 'Failed to query target audience profiles.',
        code: 'DATABASE_ERROR',
        details: queryError.message,
      });
    }

    if (!targetProfiles || targetProfiles.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No active users found for the selected audience.',
      });
    }

    const trimmedTitle = title.trim().slice(0, 200);
    const trimmedMessage = message.trim().slice(0, 2000);
    const trimmedUrl = typeof action_url === 'string' && action_url.trim().length > 0
      ? action_url.trim().slice(0, 255)
      : null;

    // Batch insert notifications in chunks of 500
    const chunkSize = 500;
    let totalInserted = 0;

    for (let i = 0; i < targetProfiles.length; i += chunkSize) {
      const chunk = targetProfiles.slice(i, i + chunkSize);
      const rows = chunk.map((p) => ({
        user_id: p.id,
        title: trimmedTitle,
        message: trimmedMessage,
        type: 'system',
        category: typeof category === 'string' ? category.slice(0, 50) : 'system',
        action_url: trimmedUrl,
        is_read: false,
        metadata: {
          broadcast: true,
          target_audience,
          sender: 'admin',
          sent_at: new Date().toISOString(),
        },
      }));

      const { data: inserted, error: insertError } = await supabase
        .from('notifications')
        .insert(rows)
        .select('id');

      if (insertError) {
        console.error('[AdminBroadcast] Chunk insertion error:', insertError);
      } else {
        totalInserted += inserted?.length || rows.length;
      }
    }

    // Write audit log
    try {
      await supabase.from('admin_audit_logs').insert({
        admin_id: callerId,
        action: 'broadcast_notification',
        target_entity: 'notifications',
        details: {
          title: trimmedTitle,
          target_audience,
          total_recipients: totalInserted,
        },
      });
    } catch {
      // Audit log non-blocking
    }

    return res.status(200).json({
      success: true,
      count: totalInserted,
      target_audience,
      message: `Successfully broadcasted notification to ${totalInserted} user(s).`,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Internal server error while broadcasting notification.',
      code: 'INTERNAL_ERROR',
      message: err?.message || String(err),
    });
  }
}
