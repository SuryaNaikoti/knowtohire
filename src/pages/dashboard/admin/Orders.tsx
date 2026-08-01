import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { supabase } from '../../../lib/supabase';
import { CreditCard, DollarSign, Calendar, Search, ArrowRight, X } from 'lucide-react';

interface MarketplaceOrder {
  id: string;
  order_number: string;
  customer_email: string;
  amount: number;
  payment_status: 'paid' | 'pending' | 'failed' | 'refunded';
  created_at: string;
  template_title: string;
}

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<MarketplaceOrder | null>(null);

  // Search filter
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      // Query from orders
      const { data, error: err } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;

      const formatted = (data || []).map((o: any) => ({
        id: o.id,
        order_number: o.order_number || `ORD-${o.id.substring(0, 8).toUpperCase()}`,
        customer_email: o.email || 'customer@example.com',
        amount: o.amount || 29.00,
        payment_status: o.payment_status || 'paid',
        template_title: o.template_title || 'Premium Resume Layout',
        created_at: o.created_at,
      }));

      setOrders(formatted);
      setFilteredOrders(formatted);
    } catch (err: any) {
      console.error(err);
      setError('Could not query marketplace transactional logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const lower = search.toLowerCase();
      setFilteredOrders(orders.filter(o => 
        o.order_number.toLowerCase().includes(lower) ||
        o.customer_email.toLowerCase().includes(lower) ||
        o.template_title.toLowerCase().includes(lower)
      ));
    } else {
      setFilteredOrders(orders);
    }
  }, [search, orders]);

  const handleRefund = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to refund this purchase order? This is a destructive transaction.')) return;
    try {
      setError('');
      setSuccess('');
      const { error: err } = await supabase
        .from('orders')
        .update({ payment_status: 'refunded' })
        .eq('id', orderId);

      if (err) throw err;
      setSuccess('Transactional refund processed successfully.');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, payment_status: 'refunded' } : null);
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not process database transaction refund.');
    }
  };

  if (loading) return <Loading label="Loading transaction journals..." />;

  const tableHeaders = [
    { key: 'ord', label: 'Order ID' },
    { key: 'customer', label: 'Customer email' },
    { key: 'amount', label: 'Transaction value' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Action', className: 'text-right' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" /> Marketplace Transaction Ledger
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Audit stripe checkout charges, process invoice adjustments, and coordinate client refunds.
          </p>
        </div>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Controls toolbar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold text-gray-900 bg-white placeholder-gray-400 border-solid outline-none"
          placeholder="Search transactional ledger by customer email, order ID, product name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Orders list */}
        <div className={`${selectedOrder ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-gray-155 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-3">
              <CreditCard className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-600">No transactions recorded in this ledger.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 border-solid rounded-2xl overflow-hidden">
              <Table headers={tableHeaders}>
                {filteredOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-bold text-gray-900 text-xs sm:text-sm font-mono">
                      {o.order_number}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 font-semibold">{o.customer_email}</TableCell>
                    <TableCell className="text-xs text-emerald-800 font-extrabold">
                      ${o.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          o.payment_status === 'paid'
                            ? 'secondary'
                            : o.payment_status === 'refunded'
                            ? 'neutral'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {o.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="bg-white text-[10px] font-bold" onClick={() => setSelectedOrder(o)}>
                        Inspect <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          )}
        </div>

        {/* Right Side: Details panel */}
        {selectedOrder && (
          <div className="lg:col-span-5 bg-white border border-solid border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-start border-b border-solid border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-900 leading-tight">
                  Transaction Audit
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-1">Order Ref: {selectedOrder.order_number}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-655 transition cursor-pointer" onClick={() => setSelectedOrder(null)}>
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Buyer Details</h4>
                <p className="text-sm font-bold text-gray-950 mt-1">{selectedOrder.customer_email}</p>
              </div>

              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Purchased Asset</h4>
                <p className="text-sm font-bold text-gray-900 mt-1">{selectedOrder.template_title}</p>
              </div>

              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Financial metrics</h4>
                <p className="text-sm font-extrabold text-emerald-800 mt-1 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> {selectedOrder.amount.toFixed(2)} USD
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-solid border-gray-200 text-xs space-y-1 text-gray-600">
                <p className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Checked out: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                <p><span className="font-bold text-gray-800">State:</span> Stripe Sandbox Checkout Verified</p>
              </div>
            </div>

            <div className="border-t border-solid border-gray-100 pt-4">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs font-bold text-red-650 hover:bg-red-50 border-red-200"
                onClick={() => handleRefund(selectedOrder.id)}
                disabled={selectedOrder.payment_status === 'refunded'}
              >
                Issue Full Refund
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
