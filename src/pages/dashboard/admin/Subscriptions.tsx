import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Loading } from '../../../components/ui/Loading';
import { Alert } from '../../../components/ui/Alert';
import { supabase } from '../../../lib/supabase';
import { CreditCard, Calendar, X, ArrowRight } from 'lucide-react';

interface SubscriberRow {
  id: string;
  name: string;
  email: string;
  plan_name: string;
  amount: number;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  renewal_date: string;
  provider: 'stripe' | 'razorpay' | 'wise';
}

export const Subscriptions: React.FC = () => {
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSub, setSelectedSub] = useState<SubscriberRow | null>(null);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch simulated active subscribers or profiles with subscription data
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, created_at')
        .eq('role', 'employer');

      if (err) throw err;

      const formatted: SubscriberRow[] = (data || []).map((p: any, i) => {
        const plans = ['Growth Plan', 'Starter Plan', 'Enterprise Plan'];
        const amount = [129.00, 49.00, 599.00][i % 3];
        const status = ['active', 'trialing', 'past_due'][i % 3] as any;
        const providers = ['stripe', 'razorpay', 'wise'][i % 3] as any;

        return {
          id: p.id,
          name: `${p.first_name || 'Corp'} ${p.last_name || 'Employer'}`,
          email: p.email || 'recruiting@corp.com',
          plan_name: plans[i % 3],
          amount,
          status,
          renewal_date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
          provider: providers,
        };
      });

      setSubscribers(formatted);
    } catch (err: any) {
      console.error(err);
      setError('Could not access subscription configurations catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleUpdateStatus = (subId: string, nextStatus: 'active' | 'cancelled' | 'past_due') => {
    setSubscribers(prev => prev.map(s => s.id === subId ? { ...s, status: nextStatus } : s));
    if (selectedSub && selectedSub.id === subId) {
      setSelectedSub(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  if (loading) return <Loading label="Loading billing models catalog..." />;

  const tableHeaders = [
    { key: 'customer', label: 'Workspace Owner' },
    { key: 'plan', label: 'Hiring Tier' },
    { key: 'status', label: 'Billing Status' },
    { key: 'actions', label: 'Action', className: 'text-right' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" /> Subscription Vetting Console
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Audit subscription status logs, inspect billing tiers, check Wise/Razorpay webhooks, and coordinate renewals.
          </p>
        </div>
      </div>

      {error && <Alert type="error" title="Error">{error}</Alert>}

      {/* Plans catalog list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'Starter Tier', price: '$49/mo', active: 8, rev: '$392/mo' },
          { name: 'Growth Tier', price: '$129/mo', active: 14, rev: '$1,806/mo' },
          { name: 'Enterprise Tier', price: 'Custom', active: 2, rev: '$1,198/mo' },
        ].map((plan) => (
          <Card key={plan.name} className="bg-white">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase">{plan.name}</span>
                <Badge variant="primary" size="sm">{plan.price}</Badge>
              </div>
              <p className="text-xl font-black font-heading text-gray-950">{plan.active} Active accounts</p>
              <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                Estimated MRR: <span className="text-emerald-800 font-extrabold">{plan.rev}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Subscribers Table */}
        <div className={`${selectedSub ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          <div className="bg-white border border-gray-200 border-solid rounded-2xl overflow-hidden">
            <Table headers={tableHeaders}>
              {subscribers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-bold text-gray-900 text-xs sm:text-sm">{s.name}</div>
                    <div className="text-[10px] text-gray-400 font-semibold mt-0.5">{s.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-600 font-semibold">{s.plan_name}</div>
                    <div className="text-[10px] text-gray-450 font-bold uppercase tracking-wider">{s.provider}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        s.status === 'active'
                          ? 'secondary'
                          : s.status === 'trialing'
                          ? 'primary'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="bg-white text-[10px] font-bold" onClick={() => setSelectedSub(s)}>
                      Configure <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        </div>

        {/* Right Side: Details Panel drawer */}
        {selectedSub && (
          <div className="lg:col-span-5 bg-white border border-solid border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-start border-b border-solid border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-900 leading-tight">
                  Subscription Details
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-1">Provider Ref: {selectedSub.id.substring(0, 10).toUpperCase()}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-655 transition cursor-pointer" onClick={() => setSelectedSub(null)}>
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Workspace</h4>
                <p className="text-sm font-bold text-gray-950 mt-1">{selectedSub.name}</p>
                <p className="text-xs text-gray-500 font-semibold">{selectedSub.email}</p>
              </div>

              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Hiring Tier & Price</h4>
                <p className="text-sm font-bold text-gray-900 mt-1">{selectedSub.plan_name}</p>
                <p className="text-xs text-emerald-800 font-extrabold mt-0.5">${selectedSub.amount.toFixed(2)} / month</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-solid border-gray-200 text-xs space-y-1.5 text-gray-600">
                <p className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Renewal Date: {new Date(selectedSub.renewal_date).toLocaleDateString()}</p>
                <p className="capitalize"><span className="font-bold text-gray-800">Checkout gateway:</span> {selectedSub.provider}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-solid border-gray-100 pt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold bg-white text-emerald-700 border-emerald-250 hover:bg-emerald-50"
                  onClick={() => handleUpdateStatus(selectedSub.id, 'active')}
                  disabled={selectedSub.status === 'active'}
                >
                  Set Active
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold bg-white text-red-700 border-red-200 hover:bg-red-50"
                  onClick={() => handleUpdateStatus(selectedSub.id, 'past_due')}
                  disabled={selectedSub.status === 'past_due'}
                >
                  Suspend Account
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
