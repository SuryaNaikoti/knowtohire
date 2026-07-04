import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Save, CheckCircle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Enter New Password" subtitle="Choose a strong, secure passphrase.">
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
            Password updated successfully. You can now access your dashboard credentials.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl">
            Go to Login
          </Button>
        </div>
      ) : (
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">New Password</label>
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs font-semibold h-11"
            />
          </div>

          <Button type="submit" isLoading={loading} className="w-full h-11 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5">
            <Save className="w-4 h-4" />
            <span>Update Password</span>
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
