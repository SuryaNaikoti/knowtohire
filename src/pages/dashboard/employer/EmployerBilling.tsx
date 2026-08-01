import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, TableRow, TableCell } from '../../../components/ui/Table';
import { Alert } from '../../../components/ui/Alert';
import { CreditCard, Zap, Building2, CheckCircle2, Download, Gift, XCircle } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Failed' | 'Refunded';
  invoiceNo: string;
}

export const EmployerBilling: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<'Starter' | 'Growth' | 'Enterprise'>('Starter');
  const [paymentMethod, setPaymentMethod] = useState<'Stripe' | 'Razorpay' | 'Wise'>('Stripe');
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [transactions] = useState<Transaction[]>([
    { id: 'tx-101', date: '2026-07-01', amount: 49.00, status: 'Paid', invoiceNo: 'INV-2026-001' },
    { id: 'tx-102', date: '2026-06-01', amount: 49.00, status: 'Paid', invoiceNo: 'INV-2026-002' },
  ]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toLowerCase() === 'k2hbeta') {
      setCouponStatus('Coupon applied: 20% discount on next renewal.');
      setErrorMessage('');
    } else {
      setErrorMessage('Invalid coupon code.');
      setCouponStatus('');
    }
  };

  const handleDownloadInvoice = (invoiceNo: string) => {
    setSuccessMessage(`Invoice ${invoiceNo} downloaded successfully.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleUpgrade = (planName: 'Starter' | 'Growth' | 'Enterprise') => {
    if (planName === currentPlan) return;
    if (window.confirm(`Are you sure you want to change your plan to ${planName}?`)) {
      setCurrentPlan(planName);
      setSuccessMessage(`Subscription updated to ${planName} successfully.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access at the end of the billing period.')) {
      setSuccessMessage('Your subscription cancellation request has been scheduled.');
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const plans = [
    {
      name: 'Starter',
      price: 49,
      description: 'For small teams hiring up to 5 roles per month.',
      features: ['5 active job postings', '50 candidate matches/month', 'Basic moderation queue', 'Email notifications'],
      highlighted: false,
    },
    {
      name: 'Growth',
      price: 129,
      description: 'For scaling companies with advanced vetting needs.',
      features: ['25 active job postings', '250 candidate matches/month', 'Priority moderation queue', 'AI match scoring', 'Team directory (5 seats)', 'CSV export'],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 599,
      description: 'Full-suite hiring intelligence for enterprise organizations.',
      features: ['Unlimited postings', 'Unlimited candidate matches', 'Dedicated account manager', 'Custom RLS data isolation', 'SLA guarantees', 'SSO integration'],
      highlighted: false,
    },
  ];

  const tableHeaders = [
    { key: 'invoice', label: 'Invoice No' },
    { key: 'date', label: 'Billing Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Payment Status' },
    { key: 'download', label: 'Invoice download', className: 'text-right' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight">
            Billing & Plans
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Manage your subscription tier, review usage limits, and configure your payment gateway integrations.
          </p>
        </div>
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-250 self-start flex items-center gap-1.5 px-3 py-1.5">
          <CreditCard className="w-3.5 h-3.5" />
          {currentPlan} Plan – Active
        </Badge>
      </div>

      {successMessage && <Alert type="success" title="Billing update">{successMessage}</Alert>}
      {errorMessage && <Alert type="error" title="Billing Error">{errorMessage}</Alert>}

      {/* Usage Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Postings', used: 2, limit: currentPlan === 'Starter' ? 5 : currentPlan === 'Growth' ? 25 : 100, icon: Building2 },
          { label: 'Candidate Matches', used: 18, limit: currentPlan === 'Starter' ? 50 : currentPlan === 'Growth' ? 250 : 1000, icon: Zap },
          { label: 'Team seats utilized', used: 1, limit: currentPlan === 'Starter' ? 1 : currentPlan === 'Growth' ? 5 : 20, icon: CheckCircle2 },
          { label: 'Days Remaining', used: null, limit: null, value: '22 days', icon: CreditCard },
        ].map((stat) => (
          <Card key={stat.label} className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <stat.icon className="w-4 h-4 text-gray-300" />
              </div>
              {stat.value ? (
                <p className="text-xl font-black font-heading text-gray-900">{stat.value}</p>
              ) : (
                <>
                  <p className="text-xl font-black font-heading text-gray-900">{stat.used} <span className="text-sm font-semibold text-gray-400">/ {stat.limit}</span></p>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(100, (stat.used! / stat.limit!) * 100)}%` }}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Plans */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-base font-bold font-heading text-gray-900">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`bg-white relative ${plan.name === currentPlan ? 'ring-2 ring-primary shadow-lg' : ''}`}
              >
                {plan.name === currentPlan && (
                  <div className="absolute -top-2.5 left-5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-primary text-white">
                    Active Plan
                  </div>
                )}
                <CardHeader className="pb-2 pt-6">
                  <CardTitle className="text-sm font-bold text-gray-900">{plan.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-3xl font-black font-heading text-gray-900">${plan.price}</span>
                    <span className="text-xs text-gray-400 font-medium">/month</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{plan.description}</p>

                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-gray-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="sm"
                    variant={plan.name === currentPlan ? 'outline' : 'primary'}
                    className={`w-full text-xs font-bold ${plan.name === currentPlan ? 'bg-white' : ''}`}
                    onClick={() => handleUpgrade(plan.name as any)}
                    disabled={plan.name === currentPlan}
                  >
                    {plan.name === currentPlan ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Billing history table */}
          <div className="bg-white border border-gray-200 border-solid rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-solid border-gray-100">
              <h3 className="font-heading font-black text-gray-900 text-sm">Hiring Billing History</h3>
            </div>
            <Table headers={tableHeaders}>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs text-gray-900 font-bold">{tx.invoiceNo}</TableCell>
                  <TableCell className="text-xs text-gray-600 font-semibold">{tx.date}</TableCell>
                  <TableCell className="text-xs font-extrabold text-emerald-800">${tx.amount.toFixed(2)} USD</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{tx.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="bg-white text-[10px] font-bold" onClick={() => handleDownloadInvoice(tx.invoiceNo)}>
                      <Download className="w-3 h-3 mr-1" /> PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        </div>

        {/* Right Side: Options, coupons & cancellation */}
        <div className="lg:col-span-4 space-y-6">
          {/* Payment gateway */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Billing Gateway</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Choose Gateway Merchant</label>
                <Select value={paymentMethod} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaymentMethod(e.target.value as any)}>
                  <option value="Stripe">Stripe Checkout</option>
                  <option value="Razorpay">Razorpay Checkout</option>
                  <option value="Wise">Wise Direct Deposit</option>
                </Select>
              </div>
              <p className="text-[10px] text-gray-400 font-bold leading-normal">
                All transactions are encrypted. Processing is handled securely outside local servers.
              </p>
            </CardContent>
          </Card>

          {/* Coupon codes */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Promotion Coupon</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleApplyCoupon} className="space-y-3">
                <Input
                  placeholder="e.g. K2HBETA"
                  value={couponCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCouponCode(e.target.value)}
                />
                <Button type="submit" size="sm" variant="outline" className="w-full bg-white text-xs font-bold">
                  Apply Discount Code
                </Button>
                {couponStatus && (
                  <p className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" /> {couponStatus}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Cancel Subscription */}
          <Card className="bg-white">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-900">Manage Workspace</h4>
                <p className="text-[10px] text-gray-400 font-medium">Temporarily freeze hiring active postings or close account.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs font-bold text-red-650 border-red-200 hover:bg-red-50 bg-white"
                onClick={handleCancelSubscription}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Terminate Subscription
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployerBilling;
