import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { subscriptionService } from '../../../lib/services/subscriptionService';
import type { Invoice } from '../../../lib/services/subscriptionService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Loading } from '../../../components/ui/Loading';
import { FileText, Download, Receipt } from 'lucide-react';

export const Billing: React.FC = () => {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBillingData = async () => {
      if (!profile) return;
      try {
        setLoading(true);
        const invs = await subscriptionService.getInvoices(profile.id);
        setInvoices(invs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBillingData();
  }, [profile]);

  if (loading) return <Loading label="Loading billing details..." />;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="border-b border-gray-200 border-solid pb-5 text-left">
        <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
          <Receipt className="w-6 h-6 text-primary" /> Billing & Invoices
        </h1>
        <p className="text-xs text-gray-500 font-semibold mt-0.5">
          View your order history, subscriptions, and transaction invoices.
        </p>
      </div>

      {/* Invoices List */}
      <div className="space-y-4 text-left">
        <h2 className="text-sm font-black font-heading text-gray-900">Payment History</h2>
        
        {invoices.length === 0 ? (
          <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-gray-650">No invoices generated yet.</p>
            <p className="text-xs text-gray-400 font-medium">Invoices appear here once subscription plans or templates are purchased.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <Card key={inv.id} className="bg-white border border-solid border-slate-200 hover:shadow-xs transition-shadow">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{inv.invoice_number}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Paid on {new Date(inv.paid_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-solid border-slate-100 pt-3 sm:pt-0">
                    <span className="text-xs font-black text-slate-900">${(inv.amount_cents / 100).toFixed(2)}</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded capitalize">
                      {inv.status}
                    </span>
                    <button
                      onClick={() => alert(`Simulated Invoice PDF: ${inv.invoice_number}`)}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
export default Billing;
