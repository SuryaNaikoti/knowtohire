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

export type NotificationEventType =
  | 'application_submitted'
  | 'application_stage_changed'
  | 'interview_scheduled'
  | 'interview_status_changed';

/**
 * Serverless Notification Dispatcher
 * Endpoint: /api/notifications-dispatch
 *
 * Security Contract:
 * 1. Require POST only.
 * 2. Authenticate caller via Bearer JWT using Supabase Auth.
 * 3. Authorize caller strictly against business entity ownership:
 *    - application_submitted: caller must be the candidate submitting the application.
 *      Authoritatively loads job & company to determine employer recipient(s).
 *    - application_stage_changed: caller must belong to the employer company owning the application.
 *      Authoritatively resolves candidate user_id recipient.
 *    - interview_scheduled: caller must belong to the employer company owning the interview.
 *      Authoritatively resolves candidate user_id recipient.
 *    - interview_status_changed: caller must belong to the employer company owning the interview.
 *      Authoritatively resolves candidate user_id recipient.
 * 4. Recipient user_id and sensitive fields are never trusted from client request body.
 * 5. Uses service-role client to insert authoritative notifications into public.notifications.
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
    const body = await parseBody(req);
    const { event, application_id, interview_id, stage, status } = body || {};

    if (!event || typeof event !== 'string') {
      return res.status(400).json({
        error: 'Missing required field: event.',
        code: 'BAD_REQUEST',
      });
    }

    // EVENT 1: Candidate submitted application -> notify employer company
    if (event === 'application_submitted') {
      if (!application_id || typeof application_id !== 'string') {
        return res.status(400).json({
          error: 'application_id is required for application_submitted event.',
          code: 'BAD_REQUEST',
        });
      }

      // Authoritative lookup: verify caller owns this application as the candidate
      const { data: app, error: appError } = await supabase
        .from('job_applications')
        .select('id, candidate_id, company_id, job_id, candidate_snapshot, jobs(id, title, company_id)')
        .eq('id', application_id)
        .maybeSingle();

      if (appError || !app) {
        return res.status(404).json({
          error: 'Application not found or inaccessible.',
          code: 'NOT_FOUND',
        });
      }

      if (app.candidate_id !== callerId) {
        return res.status(403).json({
          error: 'Forbidden: You can only dispatch notifications for your own job applications.',
          code: 'FORBIDDEN',
        });
      }

      const targetCompanyId = app.company_id || (app.jobs as any)?.company_id;
      if (!targetCompanyId) {
        return res.status(400).json({
          error: 'Application is not associated with an employer company.',
          code: 'INVALID_STATE',
        });
      }

      // Find employer user(s) belonging to targetCompanyId
      const { data: employers, error: empError } = await supabase
        .from('employer_profiles')
        .select('profile_id')
        .eq('company_id', targetCompanyId);

      if (empError || !employers || employers.length === 0) {
        // No employer profile registered yet for company; graceful return
        return res.status(200).json({
          success: true,
          delivered: 0,
          message: 'No employer users registered for company.',
        });
      }

      const candidateName =
        (app.candidate_snapshot as any)?.full_name || authData.user.user_metadata?.full_name || 'A candidate';
      const jobTitle = (app.jobs as any)?.title || 'Job Opening';

      const insertRows = employers.map((emp) => ({
        user_id: emp.profile_id,
        company_id: targetCompanyId,
        candidate_id: callerId,
        application_id: app.id,
        job_id: app.job_id,
        type: 'application',
        category: 'application',
        title: `New Applicant: ${candidateName}`,
        message: `${candidateName} applied for "${jobTitle}".`,
        action_url: '/employer/pipeline',
        metadata: { job_id: app.job_id, application_id: app.id, stage: 'new' },
        is_read: false,
      }));

      const { data: inserted, error: insertError } = await supabase
        .from('notifications')
        .insert(insertRows)
        .select('id');

      if (insertError) {
        return res.status(500).json({
          error: 'Failed to insert notifications.',
          code: 'DATABASE_ERROR',
        });
      }

      return res.status(200).json({
        success: true,
        delivered: inserted?.length || 0,
      });
    }

    // EVENT 2: Employer changed application stage -> notify candidate
    if (event === 'application_stage_changed') {
      if (!application_id || typeof application_id !== 'string' || !stage || typeof stage !== 'string') {
        return res.status(400).json({
          error: 'application_id and stage are required for application_stage_changed event.',
          code: 'BAD_REQUEST',
        });
      }

      // Authoritative verification: caller must belong to the company owning this application
      const { data: app, error: appError } = await supabase
        .from('job_applications')
        .select('id, candidate_id, company_id, job_id, jobs(id, title)')
        .eq('id', application_id)
        .maybeSingle();

      if (appError || !app) {
        return res.status(404).json({
          error: 'Application not found.',
          code: 'NOT_FOUND',
        });
      }

      // Verify caller is an employer for app.company_id or admin
      const { data: callerEmp } = await supabase
        .from('employer_profiles')
        .select('company_id')
        .eq('profile_id', callerId)
        .maybeSingle();

      const { data: callerProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', callerId)
        .maybeSingle();

      const isAuthorized =
        (callerEmp && callerEmp.company_id === app.company_id) ||
        callerProfile?.role === 'admin';

      if (!isAuthorized) {
        return res.status(403).json({
          error: 'Forbidden: You do not have permission to manage this application.',
          code: 'FORBIDDEN',
        });
      }

      const jobTitle = (app.jobs as any)?.title || 'Job Opening';
      const stageTitles: Record<string, string> = {
        screening: 'Screening in Progress',
        shortlisted: 'Candidate Shortlisted',
        interview: 'Interview Stage',
        offer: 'Offer Extended',
        hired: 'Candidate Hired',
        rejected: 'Application Not Selected',
      };

      const title = stageTitles[stage] || `Application Update: ${stage}`;
      const message =
        stage === 'rejected'
          ? `Your application for "${jobTitle}" has been concluded (Not Selected).`
          : `Your application for "${jobTitle}" was moved to ${stage.toUpperCase()}.`;

      const notificationType = stage === 'offer' || stage === 'hired' ? 'offer' : 'application';

      const { data: inserted, error: insertError } = await supabase
        .from('notifications')
        .insert({
          user_id: app.candidate_id,
          candidate_id: app.candidate_id,
          company_id: app.company_id,
          application_id: app.id,
          job_id: app.job_id,
          type: notificationType,
          category: 'application',
          title,
          message,
          action_url: '/candidate/applications',
          metadata: { application_id: app.id, stage },
          is_read: false,
        })
        .select('id')
        .single();

      if (insertError) {
        return res.status(500).json({
          error: 'Failed to insert notification.',
          code: 'DATABASE_ERROR',
        });
      }

      return res.status(200).json({
        success: true,
        delivered: 1,
        notification_id: inserted?.id,
      });
    }

    // EVENT 3: Employer scheduled interview -> notify candidate
    if (event === 'interview_scheduled') {
      if (!interview_id || typeof interview_id !== 'string') {
        return res.status(400).json({
          error: 'interview_id is required for interview_scheduled event.',
          code: 'BAD_REQUEST',
        });
      }

      const { data: interview, error: intError } = await supabase
        .from('interviews')
        .select('id, candidate_id, company_id, job_id, jobs(title)')
        .eq('id', interview_id)
        .maybeSingle();

      if (intError || !interview) {
        return res.status(404).json({
          error: 'Interview record not found.',
          code: 'NOT_FOUND',
        });
      }

      // Check caller belongs to the interview company or is admin
      const { data: callerEmp } = await supabase
        .from('employer_profiles')
        .select('company_id')
        .eq('profile_id', callerId)
        .maybeSingle();

      const { data: callerProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', callerId)
        .maybeSingle();

      const isAuthorized =
        (callerEmp && callerEmp.company_id === interview.company_id) ||
        callerProfile?.role === 'admin';

      if (!isAuthorized) {
        return res.status(403).json({
          error: 'Forbidden: You do not have permission to manage this interview.',
          code: 'FORBIDDEN',
        });
      }

      const jobTitle = (interview.jobs as any)?.title || 'Job Opening';

      const { data: inserted, error: insertError } = await supabase
        .from('notifications')
        .insert({
          user_id: interview.candidate_id,
          candidate_id: interview.candidate_id,
          company_id: interview.company_id,
          job_id: interview.job_id,
          interview_id: interview.id,
          type: 'interview',
          category: 'interview',
          title: 'Interview Scheduled',
          message: `An interview has been scheduled for "${jobTitle}".`,
          action_url: '/candidate/interviews',
          metadata: { interview_id: interview.id },
          is_read: false,
        })
        .select('id')
        .single();

      if (insertError) {
        return res.status(500).json({
          error: 'Failed to insert notification.',
          code: 'DATABASE_ERROR',
        });
      }

      return res.status(200).json({
        success: true,
        delivered: 1,
        notification_id: inserted?.id,
      });
    }

    // EVENT 4: Employer changed interview status (completed/cancelled) -> notify candidate
    if (event === 'interview_status_changed') {
      if (!interview_id || typeof interview_id !== 'string' || !status || typeof status !== 'string') {
        return res.status(400).json({
          error: 'interview_id and status are required for interview_status_changed event.',
          code: 'BAD_REQUEST',
        });
      }

      const { data: interview, error: intError } = await supabase
        .from('interviews')
        .select('id, candidate_id, company_id, job_id, jobs(title)')
        .eq('id', interview_id)
        .maybeSingle();

      if (intError || !interview) {
        return res.status(404).json({
          error: 'Interview record not found.',
          code: 'NOT_FOUND',
        });
      }

      // Check caller belongs to the interview company or is admin
      const { data: callerEmp } = await supabase
        .from('employer_profiles')
        .select('company_id')
        .eq('profile_id', callerId)
        .maybeSingle();

      const { data: callerProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', callerId)
        .maybeSingle();

      const isAuthorized =
        (callerEmp && callerEmp.company_id === interview.company_id) ||
        callerProfile?.role === 'admin';

      if (!isAuthorized) {
        return res.status(403).json({
          error: 'Forbidden: You do not have permission to manage this interview.',
          code: 'FORBIDDEN',
        });
      }

      const jobTitle = (interview.jobs as any)?.title || 'Job Opening';
      const statusText = status === 'completed' ? 'Completed' : status === 'cancelled' ? 'Cancelled' : status;
      const title = `Interview ${statusText}`;
      const message =
        status === 'completed'
          ? `Your interview for "${jobTitle}" has been marked as completed.`
          : `Your scheduled interview for "${jobTitle}" was cancelled.`;

      const { data: inserted, error: insertError } = await supabase
        .from('notifications')
        .insert({
          user_id: interview.candidate_id,
          candidate_id: interview.candidate_id,
          company_id: interview.company_id,
          job_id: interview.job_id,
          interview_id: interview.id,
          type: 'interview',
          category: 'interview',
          title,
          message,
          action_url: '/candidate/interviews',
          metadata: { interview_id: interview.id, status },
          is_read: false,
        })
        .select('id')
        .single();

      if (insertError) {
        return res.status(500).json({
          error: 'Failed to insert notification.',
          code: 'DATABASE_ERROR',
        });
      }

      return res.status(200).json({
        success: true,
        delivered: 1,
        notification_id: inserted?.id,
      });
    }

    return res.status(400).json({
      error: `Unsupported event type: ${event}`,
      code: 'UNSUPPORTED_EVENT',
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Internal server error while dispatching notification.',
      code: 'INTERNAL_ERROR',
      message: err?.message || String(err),
    });
  }
}
