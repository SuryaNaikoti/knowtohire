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
 * Serverless Admin Directory Fetch Handler
 * Endpoint: /api/admin-get-users
 *
 * Security Contract:
 * 1. Require POST method only.
 * 2. Authenticate caller via Bearer JWT through Supabase Auth (supabase.auth.getUser).
 * 3. Authorize caller via authoritative public.profiles check (role = 'admin' AND status = 'active').
 * 4. Strictly validate and constrain search, role filters, pagination (limit, offset).
 * 5. Query public.profiles using the server-side service-role client.
 * 6. Never expose service role credentials, internal password hashes, or unrestricted auth data.
 * 7. Return minimal AdminUserRecord fields required by the Admin User Directory.
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
    const search = typeof body.search === 'string' ? body.search.trim().slice(0, 100) : '';
    const roleFilter = typeof body.roleFilter === 'string' ? body.roleFilter.trim() : 'all';

    // Constrain and validate pagination
    let limit = 100;
    if (typeof body.limit === 'number' && Number.isInteger(body.limit) && body.limit > 0) {
      limit = Math.min(body.limit, 200);
    }
    let offset = 0;
    if (typeof body.offset === 'number' && Number.isInteger(body.offset) && body.offset >= 0) {
      offset = body.offset;
    }

    // Validate role filter against allowed whitelist
    const allowedRoles = ['all', 'candidate', 'employer', 'admin', 'creator'];
    if (!allowedRoles.includes(roleFilter)) {
      return res.status(400).json({
        error: 'Invalid role filter. Allowed values: all, candidate, employer, admin, creator.',
        code: 'BAD_REQUEST',
      });
    }

    // 1. Initialize server-side Supabase client (service role)
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
        error: 'Forbidden: Only active administrators can access the directory.',
        code: 'FORBIDDEN',
      });
    }

    // 4. Query public.profiles with safe field selection and pagination
    let query = supabase
      .from('profiles')
      .select('id, email, full_name, role, status, phone, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (roleFilter !== 'all') {
      query = query.eq('role', roleFilter);
    }

    if (search) {
      // Escape PostgREST wildcard characters to prevent pattern injection
      const sanitized = search.replace(/[%_,()]/g, ' ');
      query = query.or(`full_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%`);
    }

    const { data: profiles, error: queryError } = await query;

    if (queryError) {
      return res.status(500).json({
        error: queryError.message || 'Database error occurred while querying user directory.',
        code: 'DATABASE_ERROR',
      });
    }

    // Map strictly to minimal AdminUserRecord schema
    const users = (profiles || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name || 'Anonymous User',
      role: u.role || 'candidate',
      status: u.status || 'active',
      phone: u.phone || undefined,
      created_at: u.created_at,
    }));

    return res.status(200).json({
      users,
      count: users.length,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('[AdminGetUsers] Critical handler error:', error);
    return res.status(500).json({
      error: error.message || 'An unexpected error occurred while querying users.',
      code: 'INTERNAL_ERROR',
    });
  }
}
