import React, { useState, useEffect } from 'react';
import { CreatorShell } from '@/components/creator/CreatorShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/design-system/tokens';
import { creatorService, CreatorStats } from '@/services/creatorService';
import {
  ArrowLeft,
  Building,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
} from 'lucide-react';

export interface CreatorWithdrawPageProps {
  onNavigate?: (path: string) => void;
}

export const CreatorWithdrawPage: React.FC<CreatorWithdrawPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'upi'>('upi');

  // Form Fields
  const [upiId, setUpiId] = useState('creator@okhdfcbank');
  const [accountNumber, setAccountNumber] = useState('987654321098');
  const [ifscCode, setIfscCode] = useState('HDFC0001234');
  const [beneficiaryName, setBeneficiaryName] = useState('Aarav Sharma');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  useEffect(() => {
    creatorService.getCreatorStats().then((res) => {
      if (res.data) setStats(res.data);
      setIsLoading(false);
    });
  }, []);

  const handleConfirmPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stats || !stats.isEligibleForPayout || isRequestingPayout) return;

    setIsRequestingPayout(true);
    setError(null);
    setSuccess(null);

    const res = await creatorService.requestPayout();
    setIsRequestingPayout(false);

    if (res.error) {
      setError(res.error.message);
    } else if (res.data) {
      setSuccess(
        `Payout request of ₹${res.data.amountINR.toLocaleString()} submitted successfully via ${
          payoutMethod === 'upi' ? `UPI (${upiId})` : `IMPS (${beneficiaryName})`
        }! Reference ID: ${res.data.referenceNumber}`
      );
      setTimeout(() => {
        handleNavigate('/creator');
      }, 2000);
    }
  };

  return (
    <CreatorShell title="Withdraw Creator Earnings" currentPath="/creator/withdraw" onNavigate={onNavigate}>
      <div className="max-w-3xl mx-auto space-y-6 font-sans pb-12">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleNavigate('/creator')}
            className="inline-flex items-center gap-2 text-xs font-bold text-kth-slate-600 hover:text-kth-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Creator Studio</span>
          </button>
          <span className="text-[11px] font-semibold text-kth-slate-400">
            Instant Automated Settlement
          </span>
        </div>

        {/* Header Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-kth-slate-900 to-kth-slate-900 border border-emerald-900/40 p-6 text-white shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                <IndianRupee className="w-3 h-3 text-emerald-300" />
                Disbursement Pipeline
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                Withdraw Creator Commission
              </h1>
              <p className="text-xs sm:text-sm text-kth-slate-300 mt-1">
                Transfer verified commission earnings directly to your Indian bank account via IMPS or instant UPI VPA.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        {/* Withdrawal Amount Card */}
        <Card className="p-6 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-kth-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold text-kth-slate-500 uppercase tracking-wider block">
                Available Withdrawable Commission
              </span>
              <span className="text-3xl font-mono font-extrabold text-kth-slate-900">
                {isLoading ? '...' : formatINR(stats?.availableCommissionINR || 0)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {stats?.isEligibleForPayout ? (
                <Badge variant="emerald" className="text-xs font-bold px-3 py-1">
                  100% Eligible For Withdrawal
                </Badge>
              ) : (
                <Badge variant="amber" className="text-xs font-bold px-3 py-1">
                  Minimum ₹{(stats?.minPayoutThresholdINR || 1500).toLocaleString()} Required
                </Badge>
              )}
            </div>
          </div>

          <p className="text-xs text-kth-slate-500">
            Funds are settled from KnowToHire nodal account with zero commission deduction at payout time. Standard platform fee was already deducted upon customer purchase.
          </p>
        </Card>

        {/* Settlement Account Form */}
        <form onSubmit={handleConfirmPayout} className="space-y-6">
          <Card className="p-6 bg-white border border-kth-slate-200/90 rounded-xl shadow-2xs space-y-5">
            <h2 className="text-sm font-bold text-kth-slate-900 border-b border-kth-slate-100 pb-3">
              Settlement Disbursement Destination
            </h2>

            {/* Payout Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-kth-slate-700">Disbursement Rail</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPayoutMethod('upi')}
                  className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    payoutMethod === 'upi'
                      ? 'border-kth-primary-600 bg-kth-primary-50/80 text-kth-primary-700 shadow-2xs ring-2 ring-kth-primary-100'
                      : 'border-kth-slate-200 text-kth-slate-600 hover:bg-kth-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Instant UPI (Virtual Payment Address)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutMethod('bank')}
                  className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    payoutMethod === 'bank'
                      ? 'border-kth-primary-600 bg-kth-primary-50/80 text-kth-primary-700 shadow-2xs ring-2 ring-kth-primary-100'
                      : 'border-kth-slate-200 text-kth-slate-600 hover:bg-kth-slate-50'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Direct Bank / NEFT / IMPS</span>
                </button>
              </div>
            </div>

            {/* Fields based on method */}
            {payoutMethod === 'upi' ? (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-kth-slate-700">
                  UPI ID / VPA <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank"
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-lg border border-kth-slate-300 focus:outline-none focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-100"
                />
                <span className="text-[11px] text-kth-slate-400">
                  Supported apps: Google Pay, PhonePe, Paytm, BHIM, and all bank VPAs.
                </span>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-kth-slate-700">
                    Beneficiary Account Holder Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-kth-slate-300 focus:outline-none focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-kth-slate-700">
                      Account Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full text-xs font-mono px-3.5 py-2.5 rounded-lg border border-kth-slate-300 focus:outline-none focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-kth-slate-700">
                      Bank IFSC Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      className="w-full text-xs font-mono uppercase px-3.5 py-2.5 rounded-lg border border-kth-slate-300 focus:outline-none focus:border-kth-primary-600 focus:ring-2 focus:ring-kth-primary-100"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3 text-xs text-emerald-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Processed securely via RBI-compliant payment gateway pipeline. Typical settlement latency: under 10 minutes.
              </span>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => handleNavigate('/creator')}
              className="text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!stats?.isEligibleForPayout}
              isLoading={isRequestingPayout}
              className={`font-bold text-xs cursor-pointer px-6 ${
                stats?.isEligibleForPayout
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-kth-slate-100 text-kth-slate-400 cursor-not-allowed border border-kth-slate-200'
              }`}
            >
              Confirm & Withdraw {formatINR(stats?.availableCommissionINR || 0)}
            </Button>
          </div>
        </form>
      </div>
    </CreatorShell>
  );
};
