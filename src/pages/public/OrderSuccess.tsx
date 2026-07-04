import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

export const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || '';

  return (
    <div className="bg-slate-50/50 min-h-screen py-16 animate-fade-in-up">
      <div className="max-w-md mx-auto px-4 space-y-6">
        
        <Card className="bg-white border border-solid border-slate-200 rounded-3xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight leading-tight">
              Payment Completed!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              Thank you for your purchase. Your order was successfully processed and logged.
            </p>
            {orderId && (
              <p className="text-[10px] text-slate-400 font-bold">Order ID: {orderId}</p>
            )}
          </div>

          <div className="pt-4 border-t border-solid border-slate-100 flex flex-col gap-2">
            <Link to="/dashboard/purchases">
              <Button className="w-full text-xs font-bold flex items-center justify-center gap-1.5">
                <ShoppingBag className="w-4 h-4" /> Go to My Downloads
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="outline" className="w-full text-xs font-bold">
                Continue Browsing
              </Button>
            </Link>
          </div>
        </Card>

      </div>
    </div>
  );
};
export default OrderSuccess;
