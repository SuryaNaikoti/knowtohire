import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserPlus } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'candidate' // Default role for standard signup
          }
        }
      });

      if (error) throw error;
      
      if (data.session) {
        // Logged in immediately (email verification optional or auto-done)
        navigate('/role-selection');
      } else {
        // Needs email verification
        navigate('/verify-email');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed Google connection.');
    }
  };

  return (
    <AuthLayout title="Get Started" subtitle="Join thousands of professionals across 15+ industries.">
      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-750 text-xs font-semibold leading-relaxed">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleRegisterSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">First Name</label>
            <Input
              type="text"
              required
              placeholder="Alex"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full text-xs font-semibold h-11"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Last Name</label>
            <Input
              type="text"
              required
              placeholder="Johnson"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full text-xs font-semibold h-11"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Professional Email</label>
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
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Password</label>
          <Input
            type="password"
            required
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-xs font-semibold h-11"
          />
        </div>

        <Button
          type="submit"
          isLoading={loading}
          className="w-full h-11 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create Account</span>
        </Button>
      </form>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-150"></div>
        <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Or Register With</span>
        <div className="flex-grow border-t border-slate-150"></div>
      </div>

      <Button
        onClick={handleGoogleRegister}
        variant="outline"
        className="w-full h-11 text-xs font-bold border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 rounded-xl cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span>Google Account</span>
      </Button>

      <p className="text-center text-xs font-semibold text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-emerald-650 hover:underline">
          Login Profile
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
