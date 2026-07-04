import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, ArrowRight } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your email to receive recovery parameters.">
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-750 text-xs font-semibold leading-relaxed">
          {errorMsg}
        </div>
      )}

      {success ? (
        <div className="space-y-4 py-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Password recovery links dispatched. Verify your mailbox inbox tags to complete the reset.
          </p>
        </div>
      ) : (
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Account Email</label>
            <Input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs font-semibold h-11"
            />
          </div>

          <Button type="submit" isLoading={loading} className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5">
            <span>Send Recovery Email</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
