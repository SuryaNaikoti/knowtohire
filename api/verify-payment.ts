import { processPaymentVerification, recordFailedPayment } from '../src/services/payment/serverPaymentCoordinator';

// Helper to read JSON request body in Vercel Serverless environment
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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return res.status(401).json({
      success: false,
      error: 'Razorpay secret not configured in server environment.',
    });
  }

  try {
    const body: any = await parseBody(req);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id,
      user_email,
      user_name,
      item_id,
      item_type,
      company_id,
      status,
      error_code,
      error_description,
    } = body;

    // Handle failed payment notification from client or webhook
    if (status === 'failed') {
      await recordFailedPayment(razorpay_order_id, razorpay_payment_id, error_code, error_description);
      return res.status(200).json({
        success: true,
        message: 'Failed payment recorded',
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, or razorpay_signature.',
      });
    }

    const verificationResult = await processPaymentVerification(
      {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        user_id,
        user_email,
        user_name,
        item_id,
        item_type,
        company_id,
      },
      keySecret
    );

    if (!verificationResult.success) {
      return res.status(400).json(verificationResult);
    }

    return res.status(200).json(verificationResult);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Payment verification encountered a server error',
    });
  }
}
