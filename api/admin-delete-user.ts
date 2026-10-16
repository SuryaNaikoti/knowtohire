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
 * Serverless Admin Permanent Account Removal Handler
 * Endpoint: /api/admin-delete-user
 *
 * Authoritative 3-Stage Orchestration Contract:
 *
 * Stage 1: Pre-flight Verification & Concurrency Control
 *   - Verifies Bearer session token.
 *   - Ensures caller is an active 'admin' in public.profiles.
 *   - Rejects self-deletion.
 *   - Rejects deletion if target is the last remaining active platform administrator.
 *
 * Stage 2: Authoritative Database Cascade & Relational Sanitization
 *   - Invokes public.admin_purge_user_cascade(target_user_id, calling_admin_id) RPC.
 *   - Employs pg_advisory_xact_lock to eliminate race conditions.
 *   - Reassigns jobs, anonymizes payment and creator ledgers, resolves company succession.
 *   - FAILS CLOSED: If the database transaction fails, execution terminates immediately.
 *
 * Stage 3: Post-DB Identity Revocation & Storage File Cleanup
 *   - Authoritatively deletes identity from Supabase Auth (auth.users) via service role.
 *   - Cleans up user-owned private files across all designated buckets ('resumes', 'content').
 *   - Writes single, minimal privacy-conscious audit entry to public.admin_audit_logs.
 *   - Idempotent and recoverable on subsequent retries.
 */
// Per-target in-flight serialization mutex to eliminate race conditions
// when multiple administrators simultaneously trigger or retry deletion for the same target
const activeTargetLocks = new Map<string, Promise<any>>();

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
    }

    const body: any = await parseBody(req);
    const targetUserId = body.targetUserId?.trim();

    if (!targetUserId) {
      return res.status(400).json({ error: 'targetUserId is required.' });
    }

    // Await any existing in-flight deletion or retry operation on the same targetUserId
    // to strictly serialize concurrent execution and prevent race conditions.
    while (activeTargetLocks.has(targetUserId)) {
      try {
        await activeTargetLocks.get(targetUserId);
      } catch {
        // Ignore errors from previous operation; current operation will evaluate latest DB state
      }
    }

    let releaseLock!: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    activeTargetLocks.set(targetUserId, lockPromise);

    try {
      return await executeDeletion(req, res, token, targetUserId);
    } finally {
      activeTargetLocks.delete(targetUserId);
      releaseLock();
    }
  } catch (error: any) {
    console.error('[AdminDeleteUser] Critical handler error:', error);
    return res.status(500).json({
      error: error.message || 'An unexpected error occurred while purging the account.',
      code: 'INTERNAL_ERROR',
    });
  }
}

async function executeDeletion(req: any, res: any, token: string, targetUserId: string) {
  try {
    const supabase = getServerSupabaseClient();

    // 1. Authorize calling user via Supabase Auth
    const { data: callerData, error: callerError } = await supabase.auth.getUser(token);
    if (callerError || !callerData?.user) {
      return res.status(401).json({ error: 'Invalid or expired administrative session.' });
    }

    const callerId = callerData.user.id;

    // 2. Prevent self-deletion
    if (callerId === targetUserId) {
      return res.status(400).json({
        error: 'Self-deletion forbidden: Administrators cannot permanently remove their own active account.',
        code: 'SELF_DELETION_BLOCKED',
      });
    }

    // 3. Verify caller role and active status in database
    const { data: callerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', callerId)
      .maybeSingle();

    if (profileError || callerProfile?.role !== 'admin' || callerProfile?.status !== 'active') {
      return res.status(403).json({
        error: 'Forbidden: Only active administrators can perform permanent account removals.',
        code: 'FORBIDDEN',
      });
    }

    // 4. Inspect target user & check existing durable deletion records
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id, email, role, status')
      .eq('id', targetUserId)
      .maybeSingle();

    // Query durable tombstone from admin_deletion_jobs or admin_audit_logs
    let existingJob: any = null;
    const { data: jobData } = await supabase
      .from('admin_deletion_jobs')
      .select('*')
      .eq('target_user_id', targetUserId)
      .maybeSingle();
    existingJob = jobData;

    // Fallback: Check past audit logs for this target user
    let existingAuditLog: any = null;
    if (!existingJob) {
      const { data: auditData } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .eq('target_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      existingAuditLog = auditData;
    }

    const { data: authUserCheck } = await supabase.auth.admin.getUserById(targetUserId);
    const authUserExists = Boolean(authUserCheck?.user);

    // If profile is already deleted, no tombstone/audit exists, and no auth user exists: return 404
    if (!targetProfile && !existingJob && !existingAuditLog && !authUserExists) {
      return res.status(404).json({
        error: 'User not found: Account does not exist in profiles, deletion records, or authentication identity.',
        code: 'USER_NOT_FOUND',
      });
    }

    // If profile is deleted, auth is already deleted, and a completion tombstone exists: return idempotent success
    const isJobCompleted = existingJob?.status === 'completed';
    const isAuditCompleted = existingAuditLog?.details?.auth_deleted === true && existingAuditLog?.details?.storage_incomplete === false;

    if (!targetProfile && !authUserExists && (isJobCompleted || isAuditCompleted)) {
      return res.status(200).json({
        success: true,
        fullyPurged: true,
        message: 'Account has already been permanently purged from the platform.',
        purgedUserId: targetUserId,
        authDeleted: true,
        storageCleanup: existingJob?.storage_cleanup || existingAuditLog?.details?.storage_files_cleaned || { resumes: 0, content: 0 },
        storageIncomplete: false,
      });
    }

    // 4B. CROSS-INSTANCE SERIALIZATION LEASE (DURABLE JOB / LEASE ACQUISITION)
    // Acquire a distributed lease with fence and TTL from public.admin_acquire_deletion_lease
    // to strictly serialize concurrent execution across distinct serverless instances.
    let leaseToken: string | null = null;
    let leaseFence: number = 1;
    let leaseAcquired = false;

    try {
      const { data: leaseResult, error: leaseErr } = await supabase.rpc('admin_acquire_deletion_lease', {
        p_target_user_id: targetUserId,
        p_caller_id: callerId,
        p_target_role: targetProfile?.role || existingJob?.target_role || existingAuditLog?.details?.target_role || null,
        p_lease_seconds: 60,
      });

      if (!leaseErr && leaseResult) {
        if (leaseResult.already_completed) {
          return res.status(200).json({
            success: true,
            fullyPurged: true,
            message: 'Account has already been permanently purged from the platform.',
            purgedUserId: targetUserId,
            authDeleted: true,
            storageCleanup: existingJob?.storage_cleanup || existingAuditLog?.details?.storage_files_cleaned || { resumes: 0, content: 0 },
            storageIncomplete: false,
          });
        }

        if (leaseResult.acquired === false) {
          // Another serverless worker holds an active unexpired lease on this target account
          res.setHeader('Retry-After', '5');
          return res.status(409).json({
            error: 'Conflict: Account deletion is currently in progress by another worker. Please retry shortly.',
            code: 'DELETION_IN_PROGRESS',
            leaseExpiresAt: leaseResult.active_lease_expires_at,
          });
        }

        leaseAcquired = true;
        leaseToken = leaseResult.lease_token;
        leaseFence = leaseResult.fence;
      }
    } catch (leaseRpcException) {
      // Graceful fallback to audit log / single-instance lock if lease RPC is not yet migrated
      console.warn('[AdminDeleteUser] Lease RPC invocation skipped or unmigrated; falling back:', leaseRpcException);
    }

    const targetRole = targetProfile?.role || existingJob?.target_role || existingAuditLog?.details?.target_role;
    if (targetRole === 'admin') {
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('status', 'active');

      if (!countError && (count || 0) <= 1) {
        // If lease was acquired, release it before returning
        if (leaseAcquired && leaseToken) {
          await supabase.rpc('admin_release_deletion_lease', {
            p_target_user_id: targetUserId,
            p_lease_token: leaseToken,
            p_fence: leaseFence,
            p_status: 'partially_failed',
            p_auth_deleted: false,
            p_storage_completed: false,
            p_storage_cleanup: { resumes: 0, content: 0 },
            p_error: 'Self-deletion or last active administrator protection violation',
          });
        }
        return res.status(400).json({
          error: 'Protection violation: Cannot delete the platform’s last remaining active administrator.',
          code: 'LAST_ADMIN_PROTECTED',
        });
      }
    }

    // 5. STAGE 2: Authoritative Database Cascade (FAIL CLOSED)
    // Non-transactional fallback is strictly prohibited.
    let rpcData: any = null;
    if (targetProfile) {
      const { data, error: rpcError } = await supabase.rpc('admin_purge_user_cascade', {
        target_user_id: targetUserId,
        calling_admin_id: callerId,
      });

      if (rpcError) {
        console.error('[AdminDeleteUser] Database cascade failed closed:', rpcError.message);
        if (leaseAcquired && leaseToken) {
          await supabase.rpc('admin_release_deletion_lease', {
            p_target_user_id: targetUserId,
            p_lease_token: leaseToken,
            p_fence: leaseFence,
            p_status: 'partially_failed',
            p_auth_deleted: false,
            p_storage_completed: false,
            p_storage_cleanup: { resumes: 0, content: 0 },
            p_error: `Database cascade failed: ${rpcError.message}`,
          });
        }
        return res.status(500).json({
          error: `Database relational purge failed: ${rpcError.message}. Deletion halted safely.`,
          code: 'DATABASE_CASCADE_FAILED',
        });
      }
      rpcData = data;
    } else {
      // Target profile is already purged from database; increment retry count on durable job
      await supabase
        .from('admin_deletion_jobs')
        .update({
          retry_count: (existingJob?.retry_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('target_user_id', targetUserId);
    }

    // 6. STAGE 3A: Supabase Auth Identity Revocation (Service Role)
    // Heartbeat renewal before beginning Auth deletion:
    if (leaseAcquired && leaseToken) {
      try {
        const { data: renewed } = await supabase.rpc('admin_renew_deletion_lease', {
          p_target_user_id: targetUserId,
          p_lease_token: leaseToken,
          p_fence: leaseFence,
          p_extension_seconds: 60,
        });
        if (renewed === false) {
          console.warn('[AdminDeleteUser] Lease expired or preempted prior to Auth deletion.');
        }
      } catch (renewErr) {
        console.warn('[AdminDeleteUser] Lease renewal error prior to Auth deletion (non-fatal):', renewErr);
      }
    }

    let authDeleted = false;
    let authErrorWarning: string | undefined;
    try {
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(targetUserId);
      if (authDeleteError) {
        // If user is already gone from auth, treat as idempotent success
        if (authDeleteError.message.toLowerCase().includes('not found') || authDeleteError.message.toLowerCase().includes('user not found')) {
          authDeleted = true;
        } else {
          authErrorWarning = `Auth user deletion warning: ${authDeleteError.message}`;
          console.warn('[AdminDeleteUser] Supabase auth.admin.deleteUser warning:', authDeleteError.message);
        }
      } else {
        authDeleted = true;
      }
    } catch (authErr: any) {
      authErrorWarning = `Auth user deletion exception: ${authErr?.message || authErr}`;
      console.warn('[AdminDeleteUser] Auth identity delete exception:', authErr);
    }

    // Heartbeat renewal after Auth deletion completes, before Storage cleanup:
    if (leaseAcquired && leaseToken) {
      try {
        await supabase.rpc('admin_renew_deletion_lease', {
          p_target_user_id: targetUserId,
          p_lease_token: leaseToken,
          p_fence: leaseFence,
          p_extension_seconds: 60,
        });
      } catch (renewErr) {
        console.warn('[AdminDeleteUser] Lease renewal error post Auth deletion (non-fatal):', renewErr);
      }
    }

    // 7. STAGE 3B: Private Storage Files Cleanup with Complete Pagination (Idempotent)
    const storageCleanupResults: Record<string, number> = { resumes: 0, content: 0 };
    let storageIncomplete = false;
    const storageWarnings: string[] = [];
    if (authErrorWarning) {
      storageWarnings.push(authErrorWarning);
    }

    async function purgeStoragePrefix(bucketName: string, prefix: string): Promise<number> {
      let totalPurged = 0;
      const PAGE_SIZE = 100;
      const MAX_PAGES = 50; // Guard against infinite loops (max 5,000 files per prefix)

      for (let page = 0; page < MAX_PAGES; page++) {
        // Heartbeat renewal: extend lease by 60 seconds on each pagination cycle
        if (leaseAcquired && leaseToken) {
          try {
            const { data: renewed } = await supabase.rpc('admin_renew_deletion_lease', {
              p_target_user_id: targetUserId,
              p_lease_token: leaseToken,
              p_fence: leaseFence,
              p_extension_seconds: 60,
            });
            if (renewed === false) {
              console.warn('[AdminDeleteUser] Lease renewal failed: lease expired or preempted by higher fence.');
              storageIncomplete = true;
              storageWarnings.push('Worker lease expired during storage purge; execution preempted safely.');
              break;
            }
          } catch (renewErr) {
            console.warn('[AdminDeleteUser] Lease renewal error (non-fatal):', renewErr);
          }
        }

        const { data: fileList, error: listErr } = await supabase.storage
          .from(bucketName)
          .list(prefix, { limit: PAGE_SIZE, offset: 0 }); // offset: 0 because files are removed after listing

        if (listErr) {
          console.warn(`[AdminDeleteUser] Storage list error in bucket '${bucketName}' prefix '${prefix}':`, listErr.message);
          storageIncomplete = true;
          storageWarnings.push(`Failed to list files in ${bucketName}/${prefix}: ${listErr.message}`);
          break;
        }

        if (!fileList || fileList.length === 0) {
          break;
        }

        const validFiles = fileList.filter((f) => f.name && f.id !== null);
        if (validFiles.length === 0) {
          break;
        }

        const filePaths = validFiles.map((f) => (prefix ? `${prefix}/${f.name}` : f.name));
        const { error: removeErr } = await supabase.storage.from(bucketName).remove(filePaths);

        if (removeErr) {
          console.warn(`[AdminDeleteUser] Storage remove error in bucket '${bucketName}':`, removeErr.message);
          storageIncomplete = true;
          storageWarnings.push(`Failed to remove files in ${bucketName}/${prefix}: ${removeErr.message}`);
          break; // Stop pagination on error to prevent infinite retry loops
        }

        totalPurged += filePaths.length;

        // If fewer items returned than PAGE_SIZE, reached the end
        if (fileList.length < PAGE_SIZE) {
          break;
        }

        // Check if page limit reached while more files remain
        if (page === MAX_PAGES - 1) {
          const { data: remainingCheck } = await supabase.storage
            .from(bucketName)
            .list(prefix, { limit: 1, offset: 0 });
          if (remainingCheck && remainingCheck.length > 0) {
            storageIncomplete = true;
            storageWarnings.push(`Page limit reached (${MAX_PAGES} pages) in bucket '${bucketName}' prefix '${prefix}'; remaining files require retry`);
          }
        }
      }

      return totalPurged;
    }

    try {
      // Clean 'resumes' bucket at root prefix (targetUserId/*)
      const resumesDirect = await purgeStoragePrefix('resumes', targetUserId);
      storageCleanupResults.resumes += resumesDirect;

      // Clean 'resumes' bucket at legacy nested prefix (resumes/targetUserId/*)
      const resumesNested = await purgeStoragePrefix('resumes', `resumes/${targetUserId}`);
      storageCleanupResults.resumes += resumesNested;

      // Clean 'content' private bucket (custom content requests deliverables: targetUserId/*)
      const contentDirect = await purgeStoragePrefix('content', targetUserId);
      storageCleanupResults.content += contentDirect;
    } catch (storageErr: any) {
      console.warn('[AdminDeleteUser] Storage cleanup non-fatal warning:', storageErr);
      storageIncomplete = true;
      storageWarnings.push(`Storage exception: ${storageErr?.message || storageErr}`);
    }

    // 8. STAGE 3C: Minimal Privacy-Conscious Audit Logging & Durable Job Update
    const initialInitiator = existingJob?.initiated_by || existingAuditLog?.admin_id || callerId;
    try {
      await supabase.from('admin_audit_logs').insert({
        admin_id: callerId,
        action: 'PERMANENT_ACCOUNT_PURGE',
        target_id: targetUserId,
        details: {
          purged_at: new Date().toISOString(),
          initial_initiator_id: initialInitiator,
          retried_by: callerId !== initialInitiator ? callerId : undefined,
          target_role: targetProfile?.role || existingJob?.target_role || rpcData?.target_role || 'unknown',
          auth_deleted: authDeleted,
          storage_files_cleaned: storageCleanupResults,
          storage_incomplete: storageIncomplete,
          storage_warnings: storageWarnings.length > 0 ? storageWarnings : undefined,
          company_successor_promoted: rpcData?.company_successor_promoted ?? false,
        },
      });
    } catch (auditErr) {
      console.warn('[AdminDeleteUser] Audit logging non-fatal warning:', auditErr);
    }

    const isFullyPurged = authDeleted && !storageIncomplete;

    // 9. STAGE 3D: Release Distributed Lease with Monotonic Fencing Token
    let workerPreempted = false;
    if (leaseAcquired && leaseToken) {
      try {
        const { data: released } = await supabase.rpc('admin_release_deletion_lease', {
          p_target_user_id: targetUserId,
          p_lease_token: leaseToken,
          p_fence: leaseFence,
          p_status: isFullyPurged ? 'completed' : 'partially_failed',
          p_auth_deleted: authDeleted,
          p_storage_completed: !storageIncomplete,
          p_storage_cleanup: storageCleanupResults,
          p_error: storageWarnings.length > 0 ? storageWarnings.join('; ') : null,
        });

        if (released === false) {
          // The lease expired or was reclaimed by a subsequent worker with a higher fence token.
          // This worker must NOT claim completion.
          console.warn('[AdminDeleteUser] Fenced lease release returned false: worker was preempted.');
          workerPreempted = true;
        }
      } catch (leaseRelErr) {
        console.warn('[AdminDeleteUser] Release lease RPC warning:', leaseRelErr);
      }
    } else {
      // Fallback: Update durable deletion job tombstone if lease RPC not present
      try {
        await supabase
          .from('admin_deletion_jobs')
          .upsert({
            target_user_id: targetUserId,
            initiated_by: callerId,
            target_role: targetProfile?.role || existingJob?.target_role || rpcData?.target_role || 'unknown',
            status: isFullyPurged ? 'completed' : 'partially_failed',
            auth_deleted: authDeleted,
            storage_completed: !storageIncomplete,
            storage_cleanup: storageCleanupResults,
            last_error: storageWarnings.length > 0 ? storageWarnings.join('; ') : null,
            updated_at: new Date().toISOString(),
          });
      } catch (jobErr) {
        console.warn('[AdminDeleteUser] Deletion job update warning:', jobErr);
      }
    }

    if (workerPreempted) {
      return res.status(200).json({
        success: true,
        fullyPurged: false,
        message: 'Database purge succeeded, but worker lease expired or was preempted by a subsequent worker during cleanup. Please retry to confirm completion.',
        purgedUserId: targetUserId,
        authDeleted,
        storageCleanup: storageCleanupResults,
        storageIncomplete: true,
        warnings: ['Worker lease expired or was preempted by another request; retry required to confirm final storage state.'],
      });
    }

    return res.status(200).json({
      success: true,
      fullyPurged: isFullyPurged,
      message: isFullyPurged
        ? `Account has been permanently purged from the platform.`
        : `Database records purged. Warning: Auth identity or some storage files could not be fully deleted; retry required.`,
      purgedUserId: targetUserId,
      authDeleted,
      storageCleanup: storageCleanupResults,
      storageIncomplete,
      warnings: storageWarnings.length > 0 ? storageWarnings : undefined,
    });
  } catch (error: any) {
    console.error('[AdminDeleteUser] Critical handler error:', error);
    return res.status(500).json({
      error: error.message || 'An unexpected error occurred while purging the account.',
      code: 'INTERNAL_ERROR',
    });
  }
}
