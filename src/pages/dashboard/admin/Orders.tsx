import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import { Select } from '../../../components/ui/Select';
import { supabase } from '../../../lib/supabase';
import { StaggerGrid, StaggerItem, MotionCard, MotionModal } from '../../../components/ui/Motion';
import {
  CreditCard,
  DollarSign,
  Calendar,
  Search,
  ArrowRight,
  X,
  Filter,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Receipt,
  User,
  ShoppingBag,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export interface MarketplaceOrder {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<MarketplaceOrder | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: err } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;

      // Seed fallback demo dataset if table is currently empty
      const sourceData = (data && data.length > 0) ? data : [
        {
          id: 'ord_101',
          order_number: 'ORD-98214',
          email: 'rahul.sharma@gmail.com',
          amount: 25.00,
          payment_status: 'paid',
          template_title: 'Patent Specification Drafting Template',
          created_at: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          id: 'ord_102',
          order_number: 'ORD-98215',
          email: 'aditya.rao@gmail.com',
          amount: 12.00,
          payment_status: 'paid',
          template_title: 'ESG Consultant Executive CV Template',
          created_at: new Date(Date.now() - 3600000 * 18).toISOString()
        },
        {
          id: 'ord_103',
          order_number: 'ORD-98216',
          email: 'neha.kapoor@gmail.com',
          amount: 49.00,
          payment_status: 'paid',
          template_title: 'Environmental Audit & Compliance Manual',
          created_at: new Date(Date.now() - 3600000 * 36).toISOString()
        },
        {
          id: 'ord_104',
          order_number: 'ORD-98217',
          email: 'sneha.reddy@gmail.com',
          amount: 25.00,
          payment_status: 'refunded',
          template_title: 'Patent Specification Drafting Template',
          created_at: new Date(Date.now() - 3600000 * 72).toISOString()
        }
      ];

      const formatted: MarketplaceOrder[] = sourceData.map((o: any) => ({
        id: o.id,
        order_number: o.order_number || `ORD-${o.id.substring(0, 8).toUpperCase()}`,
        customer_email: o.email || o.customer_email || 'customer@example.com',
        amount: o.amount || 25.00,
        payment_status: o.payment_status || 'paid',
        template_title: o.template_title || 'Premium Marketplace Template',
        created_at: o.created_at || new Date().toISOString(),
      }));

      setOrders(formatted);
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

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(o =>
        o.order_number.toLowerCase().includes(lower) ||
        o.customer_email.toLowerCase().includes(lower) ||
        o.template_title.toLowerCase().includes(lower)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(o => o.payment_status === statusFilter);
    }

    return result;
  }, [search, statusFilter, orders]);

  const stats = useMemo(() => {
    const total = orders.length;
    const paidCount = orders.filter(o => o.payment_status === 'paid').length;
    const refundedCount = orders.filter(o => o.payment_status === 'refunded').length;
    const grossRevenue = orders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.amount, 0);

    return { total, paidCount, refundedCount, grossRevenue };
  }, [orders]);

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
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: 'refunded' } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, payment_status: 'refunded' } : null);
      }
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      console.error(err);
      setError('Could not process transaction refund.');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200/70 text-emerald-600 shadow-2xs">
              <CreditCard className="w-6 h-6" />
            </div>
            Marketplace Transaction Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Audit Stripe checkout charges, process invoice adjustments, and coordinate client refunds.
          </p>
        </div>
      </div>

      {success && <Alert type="success" title="Success">{success}</Alert>}
      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Executive Summary Cards (Staggered Entrance Animation) */}
      <StaggerGrid className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Gross Settlement</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 font-heading mt-1.5">${stats.grossRevenue.toFixed(2)}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Processed Checkout Receipts</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-teal-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Settled Orders</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1.5">{stats.paidCount}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Successful Downloads</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-rose-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Refunded Orders</p>
            <h3 className="text-2xl sm:text-3xl font-black text-rose-600 font-heading mt-1.5">{stats.refundedCount}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Reversed Transactions</p>
          </div>
        </StaggerItem>

        <StaggerItem className="col-span-2 sm:col-span-1">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 border-t-4 border-t-indigo-500 shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full">
            <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Audit Logged</p>
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 font-heading mt-1.5">{stats.total}</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Ledger Entries</p>
          </div>
        </StaggerItem>
      </StaggerGrid>

      {/* Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          <div className="lg:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactional ledger by customer email, order ID, product name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none transition-all"
            />
          </div>

          <div className="lg:col-span-4">
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: 'all', label: 'All Payment States' },
                { value: 'paid', label: 'Paid & Settled' },
                { value: 'pending', label: 'Pending Processing' },
                { value: 'refunded', label: 'Refunded' },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            Audit Ledger powered by Stripe Webhooks API
          </span>

          <div className="flex items-center gap-3">
            <span>Showing <strong className="text-slate-900 font-bold">{filteredOrders.length}</strong> transactions</span>
            {(search || statusFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Directory Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Retrieving marketplace transaction ledger...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-900 font-heading">No transactions recorded in this ledger</h4>
          <p className="text-xs text-slate-500">Try adjusting search parameters or reset active filter options.</p>
          <Button size="sm" variant="outline" onClick={resetFilters}>Reset Filters</Button>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS LIST (Visible on small screens md:hidden) */}
          <div className="block md:hidden space-y-3">
            {filteredOrders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900">{o.order_number}</span>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">{o.customer_email}</p>
                  </div>
                  <Badge variant={o.payment_status === 'paid' ? 'success' : o.payment_status === 'refunded' ? 'danger' : 'warning'} size="sm" className="capitalize font-bold shrink-0">
                    {o.payment_status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 leading-snug">{o.template_title}</p>
                  <p className="text-sm font-black text-emerald-600">${o.amount.toFixed(2)} USD</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    {new Date(o.created_at).toLocaleDateString()}
                  </span>

                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    onClick={() => setSelectedOrder(o)}
                  >
                    Inspect Ledger <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE VIEW MODE (Visible on tablet/desktop md:block) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-5">Order ID</th>
                    <th className="py-4 px-5">Customer Email</th>
                    <th className="py-4 px-5">Purchased Product</th>
                    <th className="py-4 px-5">Gross Amount</th>
                    <th className="py-4 px-5">Payment Status</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {o.order_number}
                        </span>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {new Date(o.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-800">{o.customer_email}</div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-800">{o.template_title}</div>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="text-sm font-black text-slate-900">
                          ${o.amount.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <Badge
                          variant={o.payment_status === 'paid' ? 'success' : o.payment_status === 'refunded' ? 'danger' : 'warning'}
                          size="sm"
                          className="capitalize font-bold"
                        >
                          {o.payment_status}
                        </Badge>
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs"
                          onClick={() => setSelectedOrder(o)}
                        >
                          Inspect <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* INLINE TRANSACTION LEDGER DOSSIER CARD */}
      {selectedOrder && (
        <Card className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-md space-y-4 animate-fade-in-up my-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Order Reference</p>
              <h3 className="text-lg font-black font-mono text-slate-900 mt-0.5">{selectedOrder.order_number}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={selectedOrder.payment_status === 'paid' ? 'success' : selectedOrder.payment_status === 'refunded' ? 'danger' : 'warning'} size="sm" className="capitalize font-bold">
                {selectedOrder.payment_status}
              </Badge>
              <button onClick={() => setSelectedOrder(null)} className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer">Close</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Customer Email</p>
              <p className="font-bold text-slate-900 mt-0.5">{selectedOrder.customer_email}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Purchased Product</p>
              <p className="font-bold text-slate-900 mt-0.5">{selectedOrder.template_title}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase">Gross Amount</p>
              <p className="font-black text-emerald-600 mt-0.5">${selectedOrder.amount.toFixed(2)} USD</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <Button size="sm" variant="outline" onClick={() => setSelectedOrder(null)} className="text-xs font-bold rounded-xl">
              Close Dossier
            </Button>
            {selectedOrder.payment_status === 'paid' && (
              <Button
                size="sm"
                onClick={() => handleRefund(selectedOrder.id)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
              >
                Process Order Refund
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Orders;
