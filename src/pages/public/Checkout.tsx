import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { templateService } from '../../lib/services/templateService';
import { subscriptionService } from '../../lib/services/subscriptionService';
import { orderService } from '../../lib/services/orderService';
import { paymentService } from '../../lib/services/paymentService';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Loading } from '../../components/ui/Loading';
import { ShieldCheck, ArrowLeft, CreditCard, Lock } from 'lucide-react';

export const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const itemId = searchParams.get('itemId') || '';
  const itemType = searchParams.get('itemType') || '';

  const [itemName, setItemName] = useState('');
  const [priceCents, setPriceCents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadItemDetails = async () => {
      if (!itemId || !itemType) {
        setError('Missing checkout item parameters.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        if (itemType === 'template') {
          const temp = await templateService.getTemplate(itemId);
          if (temp) {
            setItemName(temp.title);
            setPriceCents(temp.price_cents);
          } else {
            setError('Template not found.');
          }
        } else if (itemType === 'subscription_plan') {
          const plans = await subscriptionService.getPlans();
          const plan = plans.find(p => p.id === itemId);
          if (plan) {
            setItemName(plan.name);
            setPriceCents(plan.price_cents);
          } else {
            setError('Subscription plan not found.');
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load item details.');
      } finally {
        setLoading(false);
      }
    };
    loadItemDetails();
  }, [itemId, itemType]);

  const handlePay = async (simulateSuccess: boolean = true) => {
    if (!user) {
      setError('You must be logged in to complete checkout.');
      return;
    }
    setPaying(true);
    setError('');
    try {
      // 1. Create order
      const order = await orderService.createOrder(user.id, [
        {
          item_type: itemType as any,
          item_id: itemId,
          price_cents: priceCents
        }
      ]);

      // 2. Create payment intent
      const payment = await paymentService.createPaymentIntent(user.id, order.id);

      // 3. Confirm payment (simulated)
      const success = await paymentService.confirmPayment(user.id, order.id, payment.id, simulateSuccess);

      if (success) {
        navigate(`/marketplace/success?orderId=${order.id}`);
      } else {
        setError('Payment failed. Please verify your simulated card settings.');
      }
    } catch (err) {
      console.error(err);
      setError('Checkout failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <Loading label="Setting up checkout session..." />;

  return (
    <div className="bg-slate-50/50 min-h-screen py-16 animate-fade-in-up">
      <div className="max-w-md mx-auto px-4 space-y-6 text-left">
        
        <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>

        {error && <Alert type="error" title="Payment Error">{error}</Alert>}

        <Card className="bg-white border border-solid border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
            <h2 className="font-heading font-black text-sm uppercase tracking-wider">Unified Checkout</h2>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Item</span>
              <p className="font-bold text-slate-900 text-sm leading-snug">{itemName}</p>
            </div>

            <div className="border-t border-solid border-slate-100 pt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Order Subtotal</span>
              <span className="text-base font-black text-slate-900">${(priceCents / 100).toFixed(2)}</span>
            </div>

            <div className="bg-slate-50 border border-solid border-slate-150 p-4 rounded-2xl space-y-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> Simulated Card Details
              </p>
              <div className="grid grid-cols-1 gap-2 text-xs font-semibold text-slate-650">
                <div className="bg-white px-3 py-2 rounded-lg border border-solid border-slate-100">
                  <span className="text-[9px] text-slate-400 block uppercase">Card Number</span>
                  <span>•••• •••• •••• 4242</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white px-3 py-2 rounded-lg border border-solid border-slate-100">
                    <span className="text-[9px] text-slate-400 block uppercase">Expiration</span>
                    <span>12 / 29</span>
                  </div>
                  <div className="bg-white px-3 py-2 rounded-lg border border-solid border-slate-100">
                    <span className="text-[9px] text-slate-400 block uppercase">CVC</span>
                    <span>123</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-solid border-slate-100">
              <Button
                onClick={() => handlePay(true)}
                isLoading={paying}
                className="w-full text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Lock className="w-4 h-4" /> Pay ${(priceCents / 100).toFixed(2)}
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePay(false)}
                disabled={paying}
                className="w-full text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-750"
              >
                Simulate Payment Failure
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
export default Checkout;
