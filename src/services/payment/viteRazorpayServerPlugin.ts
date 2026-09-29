import type { Plugin, ViteDevServer } from 'vite';
import Razorpay from 'razorpay';
import fs from 'fs';
import path from 'path';
import { getAuthoritativeItem } from './authoritativePricing';
import {
  processPaymentVerification,
  fulfillSuccessfulPayment,
  recordFailedPayment,
  verifyWebhookSignature,
  saveStoredOrder,
  getAllStoredOrders,
  getServerEntitlementsForUser,
  hasServerEntitlement,
} from './serverPaymentCoordinator';

// Parse .env directly without third-party dependencies if process.env is not yet populated
function loadEnvFile() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            // Always overwrite Razorpay keys to pick up credential changes;
            // for other keys, only set if not already present.
            if (key.startsWith('RAZORPAY_') || !process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
    }
  } catch {
    // Ignore error
  }
}

loadEnvFile();

const processedDevWebhooks = new Set<string>();

export function razorpayApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-razorpay-api',
    configureServer(server: ViteDevServer) {
      // Helper function to read raw json body from IncomingMessage
      const readBody = (req: any): Promise<any> => {
        return new Promise((resolve, reject) => {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              resolve(body ? JSON.parse(body) : {});
            } catch (err) {
              reject(err);
            }
          });
          req.on('error', reject);
        });
      };

      const readRawBody = (req: any): Promise<string> => {
        return new Promise((resolve, reject) => {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString('utf-8');
          });
          req.on('end', () => {
            resolve(body);
          });
          req.on('error', reject);
        });
      };

      // Middleware handler for /api/* endpoints
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        // 1. Create Order endpoint: POST /api/create-order
        if (url === '/api/create-order' && req.method === 'POST') {
          loadEnvFile();
          const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
          const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

          if (!keyId || !keySecret) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: 'Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.',
              })
            );
            return;
          }

          try {
            const body = await readBody(req);
            const { itemId, itemType, receipt, notes, userId, userEmail, userName, companyId } = body;

            // --- SERVER-AUTHORITATIVE PRICING ---
            let authoritativeAmountINR: number | null = null;
            let productTitle = 'KnowToHire Purchase';

            if (itemId) {
              const catalogItem = getAuthoritativeItem(itemId, itemType);
              if (catalogItem) {
                authoritativeAmountINR = catalogItem.priceINR;
                productTitle = catalogItem.title;
              }
            }

            if (authoritativeAmountINR === null) {
              const clientAmountPaise = Math.round(Number(body.amount));
              if (clientAmountPaise && !isNaN(clientAmountPaise) && clientAmountPaise >= 100) {
                authoritativeAmountINR = clientAmountPaise / 100;
              }
            }

            if (authoritativeAmountINR === null || authoritativeAmountINR <= 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: 'Invalid order item or amount. Paid purchases must be at least ₹1.00.',
                })
              );
              return;
            }

            const amountInPaise = Math.round(authoritativeAmountINR * 100);

            const razorpay = new Razorpay({
              key_id: keyId,
              key_secret: keySecret,
            });

            const orderOptions = {
              amount: amountInPaise,
              currency: 'INR',
              receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              notes: {
                ...(notes || {}),
                itemId: itemId || '',
                itemType: itemType || '',
                userId: userId || '',
                companyId: companyId || '',
              },
            };

            const order = await razorpay.orders.create(orderOptions);

            saveStoredOrder(order.id, {
              id: order.id,
              provider_order_id: order.id,
              amount_inr: authoritativeAmountINR,
              currency: 'INR',
              status: 'created',
              receipt: order.receipt,
              user_id: userId,
              customer_email: userEmail,
              customer_name: userName,
              item_id: itemId,
              item_type: itemType,
              product_title: productTitle,
              company_id: companyId,
              created_at: new Date().toISOString(),
            });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                key_id: keyId,
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
                status: order.status,
                product_title: productTitle,
                amount_inr: authoritativeAmountINR,
              })
            );
            return;
          } catch (error: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: error?.error?.description || error?.message || 'Failed to create Razorpay order',
              })
            );
            return;
          }
        }

        // 2. Verify Payment Signature endpoint: POST /api/verify-payment
        if (url === '/api/verify-payment' && req.method === 'POST') {
          loadEnvFile();
          const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

          if (!keySecret) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: false,
                error: 'Razorpay secret not configured in server environment.',
              })
            );
            return;
          }

          try {
            const body = await readBody(req);
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

            // Handle failed payment notification
            if (status === 'failed') {
              await recordFailedPayment(razorpay_order_id, razorpay_payment_id, error_code, error_description);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Failed payment recorded' }));
              return;
            }

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: false,
                  error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, or razorpay_signature.',
                })
              );
              return;
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

            res.statusCode = verificationResult.success ? 200 : 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(verificationResult));
            return;
          } catch (error: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: false,
                error: error?.message || 'Payment verification encountered a server error',
              })
            );
            return;
          }
        }

        // 3. Webhook Endpoint: POST /api/webhook
        if (url === '/api/webhook' && req.method === 'POST') {
          const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

          if (!webhookSecret) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Webhook secret not configured.' }));
            return;
          }

          const signature = (req.headers['x-razorpay-signature'] || req.headers['X-Razorpay-Signature']) as string;
          if (!signature) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing x-razorpay-signature header' }));
            return;
          }

          try {
            const rawBody = await readRawBody(req);
            const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
            if (!isValid) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid webhook signature' }));
              return;
            }

            const payload = JSON.parse(rawBody || '{}');
            const eventId = payload.event_id || `${payload.event}_${payload.created_at}_${payload.payload?.payment?.entity?.id || ''}`;

            if (processedDevWebhooks.has(eventId)) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ status: 'ok', message: 'Webhook already processed (Idempotent)' }));
              return;
            }
            processedDevWebhooks.add(eventId);

            const event = payload.event;
            const paymentEntity = payload.payload?.payment?.entity;
            const orderEntity = payload.payload?.order?.entity;
            const orderId = paymentEntity?.order_id || orderEntity?.id;
            const paymentId = paymentEntity?.id;

            if (event === 'order.paid' || event === 'payment.captured') {
              if (orderId && paymentId) {
                await fulfillSuccessfulPayment({
                  orderId,
                  paymentId,
                });
              }
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ status: 'ok', handled: true, event }));
              return;
            }

            if (event === 'payment.failed') {
              if (orderId) {
                await recordFailedPayment(
                  orderId,
                  paymentId,
                  paymentEntity?.error_code,
                  paymentEntity?.error_description
                );
              }
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ status: 'ok', handled: true, event }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 'ok', handled: false, event }));
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Webhook processing failed' }));
            return;
          }
        }

        // 4. Server-Side Subscription Check endpoint: GET /api/subscription-status
        if (url === '/api/subscription-status' && req.method === 'GET') {
          try {
            const parsedUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
            const companyId = parsedUrl.searchParams.get('company_id') || 'fa97faee-1cdf-41e6-a151-f51c7fa4c396';
            const orders = Array.from((global as any).__kth_orders?.values() || []) as any[];
            const paidSubOrder = orders
              .filter(o => o.company_id === companyId && o.item_type === 'employer_subscription' && o.is_paid)
              .sort((a, b) => new Date(b.paid_at || 0).getTime() - new Date(a.paid_at || 0).getTime())[0];

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                has_active_order: Boolean(paidSubOrder),
                tier: paidSubOrder?.item_id?.includes('enterprise') ? 'enterprise' : 'starter',
                last_paid_order: paidSubOrder || null,
              })
            );
            return;
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e?.message || 'Failed to inspect server subscription' }));
            return;
          }
        }

        // 5. Server-Authoritative Resource Download endpoint: GET /api/download-resource
        if (url === '/api/download-resource' && req.method === 'GET') {
          try {
            const parsedUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
            const resourceId = parsedUrl.searchParams.get('resource_id') || '';
            const userId = parsedUrl.searchParams.get('user_id') || '';

            if (!resourceId) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing resource_id parameter.' }));
              return;
            }

            const catalogItem = getAuthoritativeItem(resourceId, 'knowledge_resource');
            const isPaidResource = catalogItem ? !catalogItem.isFree && catalogItem.priceINR > 0 : true;

            if (isPaidResource) {
              // Verify server-side entitlement from stored orders
              const orders = getAllStoredOrders();
              const matchingOrder = orders.find(
                (o) =>
                  (o.item_id === resourceId || (catalogItem && o.item_id === catalogItem.id)) &&
                  o.is_paid === true &&
                  (!userId || !o.user_id || o.user_id === userId)
              );

              if (!matchingOrder) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Unauthorized: Valid verified purchase not found for this resource.' }));
                return;
              }
            }

            // Generate compliant PDF payload
            const pdfTitle = catalogItem?.title || 'Patent Filing & IPR Guide for Tech Startups';
            const pdfContent = `%PDF-1.4
1 0 obj
<< /Title (${pdfTitle}) /Author (KnowToHire Publishing) /Creator (KnowToHire Legal & IPR Desk) >>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >>
endobj
5 0 obj
<< /Length 200 >>
stream
BT
/F1 18 Tf
50 720 Td
(${pdfTitle}) Tj
/F1 12 Tf
0 -40 Td
(Official Authorized KnowToHire Digital Publication.) Tj
0 -25 Td
(Verified Purchase Deliverable - Exclusive Licensed Copy.) Tj
ET
endstream
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000109 00000 n 
0000000159 00000 n 
0000000216 00000 n 
0000000339 00000 n 
0000000591 00000 n 
trailer
<< /Size 7 /Root 2 0 R /Info 1 0 R >>
startxref
662
%%EOF`;

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${resourceId}.pdf"`);
            res.end(Buffer.from(pdfContent, 'utf-8'));
            return;
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e?.message || 'Download error' }));
            return;
          }
        }

        // 6. Server-Authoritative User Entitlements endpoint: GET /api/user-entitlements
        if (url === '/api/user-entitlements' && req.method === 'GET') {
          try {
            const parsedUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
            const userId = parsedUrl.searchParams.get('user_id') || '';
            const productId = parsedUrl.searchParams.get('product_id') || '';

            if (productId && userId) {
              const entitled = hasServerEntitlement(productId, userId);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ entitled, product_id: productId, user_id: userId }));
              return;
            }

            const entitlements = getServerEntitlementsForUser(userId);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ entitlements }));
            return;
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e?.message || 'Entitlements error' }));
            return;
          }
        }

        next();
      });
    },
  };
}
