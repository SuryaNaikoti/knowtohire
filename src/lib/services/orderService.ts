import { supabase, isSupabaseConfigured } from '../supabase';

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount_cents: number;
  currency: string;
  payment_gateway: string;
  gateway_reference_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: 'template' | 'subscription_plan' | 'featured_job' | 'recruiter_seat' | 'premium_candidate' | 'employer_subscription';
  item_id: string;
  price_cents: number;
}

const LOCAL_ORDERS_KEY = (userId: string) => `kth_orders_${userId}`;
const LOCAL_ITEMS_KEY = (orderId: string) => `kth_order_items_${orderId}`;

export const orderService = {
  createOrder: async (userId: string, items: Omit<OrderItem, 'id' | 'order_id'>[]): Promise<Order> => {
    const totalAmount = items.reduce((sum, item) => sum + item.price_cents, 0);

    const orderData: Omit<Order, 'id'> = {
      user_id: userId,
      status: 'pending',
      amount_cents: totalAmount,
      currency: 'USD',
      payment_gateway: 'stripe',
      gateway_reference_id: `cs_${Math.random().toString(36).substring(2, 12)}`
    };

    if (isSupabaseConfigured && supabase) {
      const { data: order, error: orderErr } = await supabase.from('orders').insert(orderData).select().single();
      if (orderErr) throw orderErr;

      const itemsWithOrder = items.map(item => ({
        order_id: order.id,
        item_type: item.item_type,
        item_id: item.item_id,
        price_cents: item.price_cents
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(itemsWithOrder);
      if (itemsErr) throw itemsErr;

      return order as Order;
    }

    const oKey = LOCAL_ORDERS_KEY(userId);
    const orderList = JSON.parse(localStorage.getItem(oKey) || '[]');
    const newOrder: Order = {
      id: `ord_${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...orderData
    };
    orderList.unshift(newOrder);
    localStorage.setItem(oKey, JSON.stringify(orderList));

    const iKey = LOCAL_ITEMS_KEY(newOrder.id);
    const itemEntries: OrderItem[] = items.map((it): OrderItem => ({
      id: `oit_${Math.random().toString(36).substring(2, 9)}`,
      order_id: newOrder.id,
      ...it
    }));
    localStorage.setItem(iKey, JSON.stringify(itemEntries));

    return newOrder;
  },

  getOrders: async (userId: string): Promise<Order[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (!error && data) return data as Order[];
    }
    return JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY(userId)) || '[]');
  },

  getOrder: async (userId: string, orderId: string): Promise<{ order: Order; items: OrderItem[] } | null> => {
    if (isSupabaseConfigured && supabase) {
      const { data: order, error: orderErr } = await supabase.from('orders').select('*').eq('id', orderId).eq('user_id', userId).maybeSingle();
      if (orderErr || !order) return null;

      const { data: items, error: itemsErr } = await supabase.from('order_items').select('*').eq('order_id', orderId);
      if (itemsErr) return null;

      return { order: order as Order, items: items as OrderItem[] };
    }

    const orderList = await orderService.getOrders(userId);
    const order = orderList.find(o => o.id === orderId);
    if (!order) return null;

    const items = JSON.parse(localStorage.getItem(LOCAL_ITEMS_KEY(orderId)) || '[]');
    return { order, items };
  },

  updateOrderStatus: async (userId: string, orderId: string, status: Order['status']): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId).eq('user_id', userId);
      if (error) throw error;
      return true;
    }
    const oKey = LOCAL_ORDERS_KEY(userId);
    const orderList: Order[] = JSON.parse(localStorage.getItem(oKey) || '[]');
    localStorage.setItem(oKey, JSON.stringify(orderList.map(o => o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o)));
    return true;
  }
};
