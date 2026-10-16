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
 * Serverless Account Deactivation Handler
 * Endpoint: /api/account-deactivate
 *
 * Security Contract:
 * 1. Require POST method only.
 * 2. Authenticate caller via Bearer JWT through Supabase Auth (supabase.auth.getUser).
 * 3. An authenticated user can ONLY deactivate their OWN account (callerId = profiles.id).
 * 4. Master Platform Admin account CANNOT be deactivated via self-service.
 * 5. Update public.profiles: status = 'suspended', updated_at = now().
 * 6. If candidate, update public.candidate_profiles: is_active = false, is_discoverable = false, deactivated_at = now().
 * 7. Call Supabase Auth admin signOut to revoke existing refresh tokens / active sessions.
 * 8. Return structured confirmation { success: true, userId, status: 'suspended', deactivated_at }.
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

    // 1. Authenticate caller via Supabase Auth
    const { data: callerData, error: callerError } = await supabase.auth.getUser(token);
    if (callerError || !callerData?.user) {
      return res.status(401).json({
        error: 'Invalid or expired session token.',
        code: 'UNAUTHORIZED',
      });
    }

    const callerId = callerData.user.id;

    // 2. Protect Master Admin accounts from accidental self-deactivation
    const MASTER_ADMIN_UUID = '00000000-0000-0000-0000-000000000003';
    if (callerId === MASTER_ADMIN_UUID || callerData.user.email === 'admin@knowtohire.com') {
      return res.status(403).json({
        error: 'Forbidden: Master Platform Administrator account cannot be deactivated.',
        code: 'FORBIDDEN',
      });
    }

    // 3. Fetch caller profile to determine role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, status')
      .eq('id', callerId)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({
        error: 'Error retrieving user account record.',
        code: 'DATABASE_ERROR',
      });
    }

    const nowIso = new Date().toISOString();

    // 4. Update public.profiles authoritatively to 'suspended'
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        status: 'suspended',
        updated_at: nowIso,
      })
      .eq('id', callerId);

    if (updateProfileError) {
      return res.status(500).json({
        error: updateProfileError.message || 'Failed to update account status in database.',
        code: 'UPDATE_FAILED',
      });
    }

    // 5. If candidate, also update public.candidate_profiles
    if (profile?.role === 'candidate') {
      await supabase
        .from('candidate_profiles')
        .update({
          is_active: false,
          is_discoverable: false,
          deactivated_at: nowIso,
          updated_at: nowIso,
        })
        .eq('profile_id', callerId);
    }

    // 6. Invalidate active Supabase Auth sessions
    try {
      if ((supabase.auth.admin as any)?.signOut) {
        await (supabase.auth.admin as any).signOut(callerId);
      }
    } catch (signOutErr) {
      console.warn('[AccountDeactivate] Session invalidation notice:', signOutErr);
    }

    return res.status(200).json({
      success: true,
      userId: callerId,
      status: 'suspended',
      deactivated_at: nowIso,
    });
  } catch (error: any) {
    console.error('[AccountDeactivate] Critical handler error:', error);
    return res.status(500).json({
      error: error.message || 'An unexpected error occurred during account deactivation.',
      code: 'INTERNAL_ERROR',
    });
  }
}
