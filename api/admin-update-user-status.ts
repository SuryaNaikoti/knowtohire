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
 * Serverless Admin User Status Management Handler
 * Endpoint: /api/admin-update-user-status
 *
 * Security Contract:
 * 1. Authenticate caller using bearer token via supabase.auth.getUser(token).
 * 2. Verify caller's authoritative database profile record has role = 'admin' and status = 'active'.
 * 3. Validate request payload: targetUserId (valid string) and status ('active' | 'suspended').
 * 4. Reject self-suspension (caller cannot suspend their own active administrative session).
 * 5. Reject suspension of the protected master platform administrator.
 * 6. Execute privileged status mutation on public.profiles using server-only service-role client.
 * 7. Do not touch role, verification, onboarding, or delete any records.
 * 8. Return structured response { success: true, userId, status, updated_at }.
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

    const body: any = await parseBody(req);
    const targetUserId = body.targetUserId?.trim();
    const status = body.status;

    if (!targetUserId) {
      return res.status(400).json({
        error: 'targetUserId is required.',
        code: 'BAD_REQUEST',
      });
    }

    if (status !== 'active' && status !== 'suspended') {
      return res.status(400).json({
        error: 'Invalid status. Allowed values are "active" or "suspended".',
        code: 'INVALID_STATUS',
      });
    }

    // 1. Initialize server-only Supabase client (service role)
    const supabase = getServerSupabaseClient();

    // 2. Authenticate caller via Supabase Auth
    const { data: callerData, error: callerError } = await supabase.auth.getUser(token);
    if (callerError || !callerData?.user) {
      return res.status(401).json({
        error: 'Invalid or expired administrative session token.',
        code: 'UNAUTHORIZED',
      });
    }

    const callerId = callerData.user.id;

    // 3. Verify caller profile role and active status in database
    const { data: callerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', callerId)
      .maybeSingle();

    if (profileError || callerProfile?.role !== 'admin' || callerProfile?.status !== 'active') {
      return res.status(403).json({
        error: 'Forbidden: Only active administrators can update user account access status.',
        code: 'FORBIDDEN',
      });
    }

    // 4. Reject self-suspension
    if (callerId === targetUserId && status === 'suspended') {
      return res.status(400).json({
        error: 'Self-suspension forbidden: Administrators cannot suspend their own active account.',
        code: 'SELF_SUSPENSION_BLOCKED',
      });
    }

    // 5. Reject suspension of protected master platform administrator
    const MASTER_ADMIN_UUID = '00000000-0000-0000-0000-000000000003';
    if (targetUserId === MASTER_ADMIN_UUID && status === 'suspended') {
      return res.status(403).json({
        error: 'Forbidden: Master Platform Administrator cannot be suspended.',
        code: 'FORBIDDEN',
      });
    }

    // 6. Inspect target user record
    const { data: targetProfile, error: targetError } = await supabase
      .from('profiles')
      .select('id, email, role, status')
      .eq('id', targetUserId)
      .maybeSingle();

    if (targetError) {
      return res.status(500).json({
        error: targetError.message || 'Error looking up target user.',
        code: 'DATABASE_ERROR',
      });
    }

    if (!targetProfile) {
      return res.status(404).json({
        error: 'Target user not found.',
        code: 'USER_NOT_FOUND',
      });
    }

    // Secondary master admin email guard
    if (targetProfile.email === 'admin@knowtohire.com' && status === 'suspended') {
      return res.status(403).json({
        error: 'Forbidden: Master Platform Administrator cannot be suspended.',
        code: 'FORBIDDEN',
      });
    }

    // 7. Execute server-side privileged update strictly on profiles.status
    const nowIso = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        status,
        updated_at: nowIso,
      })
      .eq('id', targetUserId);

    if (updateError) {
      return res.status(500).json({
        error: updateError.message || 'Failed to update user account status in database.',
        code: 'UPDATE_FAILED',
      });
    }

    return res.status(200).json({
      success: true,
      userId: targetUserId,
      status,
      updated_at: nowIso,
    });
  } catch (error: any) {
    console.error('[AdminUpdateUserStatus] Critical handler error:', error);
    return res.status(500).json({
      error: error.message || 'An unexpected error occurred while updating account status.',
      code: 'INTERNAL_ERROR',
    });
  }
}
