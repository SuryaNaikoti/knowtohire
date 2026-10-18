import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const viteKeyId = process.env.VITE_RAZORPAY_KEY_ID || '';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

  // Mode and prefix analysis without leaking secrets
  const keyIdExists = Boolean(keyId);
  const keyIdPrefix = keyId.startsWith('rzp_live_')
    ? 'rzp_live_'
    : keyId.startsWith('rzp_test_')
    ? 'rzp_test_'
    : keyIdExists
    ? 'unknown_prefix'
    : 'none';
  const keyIdSuffix = keyId.length > 4 ? keyId.slice(-4) : 'none';

  const keySecretExists = Boolean(keySecret);
  const keySecretLength = keySecret.length;

  const viteKeyIdExists = Boolean(viteKeyId);
  const viteKeyIdPrefix = viteKeyId.startsWith('rzp_live_')
    ? 'rzp_live_'
    : viteKeyId.startsWith('rzp_test_')
    ? 'rzp_test_'
    : viteKeyIdExists
    ? 'unknown_prefix'
    : 'none';
  const viteKeyIdSuffix = viteKeyId.length > 4 ? viteKeyId.slice(-4) : 'none';

  const webhookSecretExists = Boolean(webhookSecret);

  // Safe non-transactional authentication probe against Razorpay API
  // Using GET /v1/items?count=1 or /v1/orders?count=1 which tests Basic Auth without creating orders/charges
  let authProbeStatus: number | null = null;
  let authProbeError: any = null;
  let authProbeSuccess = false;

  if (keyIdExists && keySecretExists) {
    try {
      const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const probeRes = await fetch('https://api.razorpay.com/v1/items?count=1', {
        method: 'GET',
        headers: {
          Authorization: `Basic ${basicAuth}`,
        },
      });

      authProbeStatus = probeRes.status;
      if (probeRes.ok) {
        authProbeSuccess = true;
      } else {
        const errorJson: any = await probeRes.json().catch(() => ({}));
        authProbeError = {
          code: errorJson?.error?.code || 'UNKNOWN',
          description: errorJson?.error?.description || 'Probe failed',
          httpStatus: probeRes.status,
        };
      }
    } catch (fetchErr: any) {
      authProbeError = {
        message: fetchErr?.message || 'Network exception during probe',
      };
    }
  }

  return res.status(200).json({
    diagnostic_version: '1.0.0',
    deployment_env: process.env.VERCEL_ENV || 'unknown',
    deployment_url: process.env.VERCEL_URL || 'unknown',
    key_id: {
      exists: keyIdExists,
      prefix: keyIdPrefix,
      suffix: keyIdSuffix,
    },
    key_secret: {
      exists: keySecretExists,
      length: keySecretLength,
    },
    vite_key_id: {
      exists: viteKeyIdExists,
      prefix: viteKeyIdPrefix,
      suffix: viteKeyIdSuffix,
      matches_server_key_id: keyId === viteKeyId,
    },
    webhook_secret: {
      exists: webhookSecretExists,
    },
    razorpay_auth_probe: {
      tested: keyIdExists && keySecretExists,
      success: authProbeSuccess,
      http_status: authProbeStatus,
      error: authProbeError,
    },
  });
}
