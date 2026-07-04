import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CheckCircle, ShieldCheck } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        navigate('/role-selection');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP verification failed. Check parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Verify Account" subtitle="Enter your email and the OTP code sent to your inbox.">
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-750 text-xs font-semibold leading-relaxed">
          {errorMsg}
        </div>
      )}

      {success ? (
        <div className="space-y-4 py-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Email verified successfully. Moving to workspace selection...
          </p>
        </div>
      ) : (
        <form onSubmit={handleVerificationSubmit} className="space-y-4">
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

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Verification Code (OTP)</label>
            <Input
              type="text"
              required
              placeholder="e.g. 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full text-xs font-semibold h-11 text-center tracking-widest"
            />
          </div>

          <Button type="submit" isLoading={loading} className="w-full h-11 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Account</span>
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default VerifyEmail;
