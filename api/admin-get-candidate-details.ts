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
 * Extracts the storage object path from a raw resume reference.
 */
function extractResumeStoragePath(rawResumeRef?: string | null): string | null {
  if (!rawResumeRef || typeof rawResumeRef !== 'string') return null;
  const trimmed = rawResumeRef.trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return null;

  // If already a clean relative path (e.g. "userId/123_resume.pdf" or "resumes/userId/123_resume.pdf")
  if (trimmed.includes('/') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed.replace(/^resumes\//, '');
  }

  // If it's a Supabase public/signed storage URL
  const marker = '/storage/v1/object/public/resumes/';
  const signMarker = '/storage/v1/object/sign/resumes/';
  const authMarker = '/storage/v1/object/authenticated/resumes/';

  for (const m of [marker, signMarker, authMarker]) {
    const idx = trimmed.indexOf(m);
    if (idx !== -1) {
      const pathWithQuery = trimmed.substring(idx + m.length);
      return decodeURIComponent(pathWithQuery.split('?')[0]);
    }
  }

  const genericMatch = trimmed.match(/\/resumes\/(.+?)(\?|$)/);
  if (genericMatch && genericMatch[1]) {
    return decodeURIComponent(genericMatch[1].replace(/^resumes\//, ''));
  }

  return null;
}

/**
 * Serverless Admin Candidate Inspection & Resume Fetch Handler
 * Endpoint: /api/admin-get-candidate-details
 *
 * Security Contract:
 * 1. Require POST method only.
 * 2. Authenticate caller via Bearer JWT through Supabase Auth (supabase.auth.getUser).
 * 3. Authorize caller via authoritative public.profiles check (role = 'admin' AND status = 'active').
 * 4. Query public.profiles and public.candidate_profiles using service-role client.
 * 5. If resume_url is present, generate a secure signed URL for the resumes bucket.
 * 6. Return authentic candidate profile data and signed resume URL.
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
    const candidateId = typeof body.candidateId === 'string' ? body.candidateId.trim() : '';

    if (!candidateId) {
      return res.status(400).json({
        error: 'Candidate ID is required.',
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
        error: 'Forbidden: Only active administrators can access candidate dossiers.',
        code: 'FORBIDDEN',
      });
    }

    // 4. Authoritatively query target candidate profile and candidate_profiles
    const [profileRes, candProfileRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', candidateId).maybeSingle(),
      supabase.from('candidate_profiles').select('*').eq('profile_id', candidateId).maybeSingle(),
    ]);

    if (profileRes.error) {
      return res.status(500).json({
        error: profileRes.error.message || 'Database error querying profile.',
        code: 'DATABASE_ERROR',
      });
    }

    const profile = profileRes.data;
    const candProfile = candProfileRes.data;

    if (!profile && !candProfile) {
      return res.status(404).json({
        error: 'Candidate not found.',
        code: 'NOT_FOUND',
      });
    }

    // 5. Securely resolve resume URL
    let resolvedResumeUrl: string | undefined = candProfile?.resume_url || undefined;
    let resumeStoragePath: string | null = null;

    if (resolvedResumeUrl) {
      resumeStoragePath = extractResumeStoragePath(resolvedResumeUrl);
      if (resumeStoragePath) {
        // Generate signed URL with 1-hour expiration
        const { data: signedData, error: signError } = await supabase.storage
          .from('resumes')
          .createSignedUrl(resumeStoragePath, 3600);

        if (!signError && signedData?.signedUrl) {
          resolvedResumeUrl = signedData.signedUrl;
        }
      }
    }

    // 6. Map to AdminCandidateDetailRecord
    const record = {
      id: candidateId,
      full_name: profile?.full_name || 'Candidate User',
      email: profile?.email || 'candidate@knowtohire.com',
      phone: profile?.phone || undefined,
      avatar_url: profile?.avatar_url || undefined,
      role: 'candidate' as const,
      status: profile?.status || 'active',
      headline: candProfile?.headline || undefined,
      bio: candProfile?.bio || undefined,
      location: candProfile?.location || undefined,
      domain_specialization: candProfile?.domain_specialization || undefined,
      skills: Array.isArray(candProfile?.skills) ? candProfile.skills : [],
      certifications: Array.isArray(candProfile?.certifications) ? candProfile.certifications : [],
      experience: Array.isArray(candProfile?.experience) ? candProfile.experience : [],
      education: Array.isArray(candProfile?.education) ? candProfile.education : [],
      resume_url: resolvedResumeUrl,
      resume_file_name: candProfile?.resume_file_name || undefined,
      resume_storage_path: resumeStoragePath || undefined,
      profile_completion_pct: candProfile?.profile_completion_pct ?? 100,
      expected_salary_inr: candProfile?.expected_salary_inr ?? candProfile?.preferred_salary_max ?? undefined,
      notice_period_days: candProfile?.notice_period_days ?? undefined,
      work_mode_preference: candProfile?.work_mode_preference ?? candProfile?.employment_preference ?? undefined,
      is_discoverable: candProfile?.is_discoverable ?? true,
      is_active: candProfile?.is_active ?? true,
      created_at: profile?.created_at || new Date().toISOString(),
      updated_at: candProfile?.updated_at || profile?.updated_at || new Date().toISOString(),
    };

    return res.status(200).json({ candidate: record });
  } catch (error: any) {
    console.error('[AdminGetCandidateDetails] Critical error:', error);
    return res.status(500).json({
      error: error.message || 'An unexpected error occurred while loading candidate details.',
      code: 'INTERNAL_ERROR',
    });
  }
}
