import { supabase, isSupabaseConfigured } from '../supabase';
import { orderService } from './orderService';
import { templateService } from './templateService';
import { subscriptionService } from './subscriptionService';

export interface Payment {
  id: string;
  order_id: string;
  amount_cents: number;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  provider: string;
  transaction_reference?: string;
  created_at?: string;
}

export interface PaymentEvent {
  id: string;
  payment_id?: string;
  event_type: string;
  payload: Record<string, any>;
  created_at?: string;
}

const LOCAL_PAYMENTS_KEY = (orderId: string) => `kth_payments_${orderId}`;

export const paymentService = {
  createPaymentIntent: async (userId: string, orderId: string): Promise<Payment> => {
    // Fetch order
    const data = await orderService.getOrder(userId, orderId);
    if (!data) throw new Error('Order not found.');

    const paymentData: Omit<Payment, 'id'> = {
      order_id: orderId,
      amount_cents: data.order.amount_cents,
      status: 'pending',
      provider: 'stripe',
      transaction_reference: `pi_${Math.random().toString(36).substring(2, 10)}`
    };

    if (isSupabaseConfigured && supabase) {
      const { data: payment, error } = await supabase.from('payments').insert(paymentData).select().single();
      if (error) throw error;
      return payment as Payment;
    }

    const key = LOCAL_PAYMENTS_KEY(orderId);
    const newPayment: Payment = {
      id: `pay_${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
      ...paymentData
    };
    localStorage.setItem(key, JSON.stringify(newPayment));
    return newPayment;
  },

  confirmPayment: async (userId: string, orderId: string, paymentId: string, simulateSuccess: boolean = true): Promise<boolean> => {
    const status = simulateSuccess ? 'succeeded' : 'failed';
    const orderStatus = simulateSuccess ? 'completed' : 'failed';

    if (isSupabaseConfigured && supabase) {
      // Update payment
      const { error: payErr } = await supabase.from('payments').update({ status }).eq('id', paymentId);
      if (payErr) throw payErr;

      // Update order
      await orderService.updateOrderStatus(userId, orderId, orderStatus);

      // Trigger Webhook Handler logic
      await paymentService.handlePaymentWebhook({
        event: 'payment.completed',
        user_id: userId,
        order_id: orderId,
        payment_id: paymentId,
        success: simulateSuccess
      });

      return simulateSuccess;
    }

    // Local Storage Simulation
    const key = LOCAL_PAYMENTS_KEY(orderId);
    const payment = JSON.parse(localStorage.getItem(key) || '{}');
    if (payment.id === paymentId) {
      payment.status = status;
      localStorage.setItem(key, JSON.stringify(payment));
    }

    await orderService.updateOrderStatus(userId, orderId, orderStatus);

    await paymentService.handlePaymentWebhook({
      event: 'payment.completed',
      user_id: userId,
      order_id: orderId,
      payment_id: paymentId,
      success: simulateSuccess
    });

    return simulateSuccess;
  },

  handlePaymentWebhook: async (payload: { event: string; user_id: string; order_id: string; payment_id: string; success: boolean }): Promise<void> => {
    // Record Payment Event log
    if (isSupabaseConfigured && supabase) {
      await supabase.from('payment_events').insert({
        payment_id: payload.payment_id,
        event_type: payload.event,
        payload
      });
    }

    if (!payload.success) return;

    // Fulfill purchased items
    const orderDetails = await orderService.getOrder(payload.user_id, payload.order_id);
    if (!orderDetails) return;

    for (const item of orderDetails.items) {
      if (item.item_type === 'template') {
        // Grant download permissions
        await templateService.purchaseTemplate(payload.user_id, item.item_id, payload.order_id, item.price_cents);
      } else if (item.item_type === 'subscription_plan') {
        // Activate Plan Subscription
        await subscriptionService.createSubscription(payload.user_id, item.item_id);
      }
    }
  },

  getPaymentHistory: async (userId: string): Promise<Payment[]> => {
    // Fetch orders and extract payments
    const orders = await orderService.getOrders(userId);
    const payments: Payment[] = [];
    for (const order of orders) {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('payments').select('*').eq('order_id', order.id);
        if (data) payments.push(...(data as Payment[]));
      } else {
        const key = LOCAL_PAYMENTS_KEY(order.id);
        const local = localStorage.getItem(key);
        if (local) payments.push(JSON.parse(local));
      }
    }
    return payments;
  }
};
