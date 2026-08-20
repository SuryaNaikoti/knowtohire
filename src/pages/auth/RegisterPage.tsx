import React, { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, Building2, Eye, EyeOff, Check, AlertCircle, ArrowRight } from 'lucide-react';

export interface RegisterPageProps {
  onNavigate?: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register, isLoading, error: authError, clearError } = useAuth();

  // Role Selection (Candidate vs Employer only)
  const searchParams = new URLSearchParams(window.location.search);
  const initialRole = searchParams.get('role') === 'employer' ? 'employer' : 'candidate';
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'employer'>(initialRole);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const roleTabItems: TabItem[] = [
    { id: 'candidate', label: 'Candidate', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'employer', label: 'Employer / Recruiter', icon: <Building2 className="w-3.5 h-3.5" /> },
  ];

  // Generic Email Detection for Employers (Non-blocking warning)
  const isGenericEmail = (emailStr: string): boolean => {
    const genericDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'rediffmail.com'];
    const domain = emailStr.split('@')[1]?.toLowerCase();
    return genericDomains.includes(domain);
  };

  // Password Strength Criteria Evaluation
  const evalPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const pwdScore = evalPasswordStrength(password);
  const getPwdStrengthLabel = () => {
    if (!password) return { label: 'Enter password', color: 'bg-kth-slate-200' };
    if (pwdScore <= 2) return { label: 'Weak (min 8 chars, uppercase, numbers required)', color: 'bg-red-500' };
    if (pwdScore <= 4) return { label: 'Good password strength', color: 'bg-amber-500' };
    return { label: 'Strong password', color: 'bg-emerald-500' };
  };

  const validateForm = (): boolean => {
    setFormError(null);
    clearError();

    if (!fullName.trim() || fullName.trim().length < 2) {
      setFormError('Please enter your full name (at least 2 characters).');
      return false;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return false;
    }

    if (selectedRole === 'employer' && (!companyName.trim() || companyName.trim().length < 2)) {
      setFormError('Please enter your company or enterprise name.');
      return false;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return false;
    }

    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setFormError('Password must contain at least one uppercase letter and one number.');
      return false;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter confirm password.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[SIGNUP TRACE 01]', { selectedRole });
    if (!validateForm()) return;

    const metadata = {
      full_name: fullName.trim(),
      role: selectedRole,
      ...(selectedRole === 'employer' && { company_name: companyName.trim() }),
    };

    console.log('[SIGNUP TRACE 02]', {
      selectedRole: metadata.role,
      email: email.trim(),
      fullName: metadata.full_name,
      companyName: (metadata as any).company_name,
    });

    const { error } = await register(email.trim(), password, metadata);

    if (error) {
      setFormError(error.message);
    } else {
      // Navigate to email verification page on successful registration
      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle={
        selectedRole === 'candidate'
          ? "Discover verified jobs, career insights, and ATS tools."
          : "Post jobs, screen candidates, and streamline your hiring pipeline."
      }
    >
      <div className="space-y-4 text-left">
        {/* Role Selector Segmented Tabs */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-kth-slate-800 block">
            I am joining as
          </label>
          <Tabs
            items={roleTabItems}
            activeId={selectedRole}
            onChange={(id) => setSelectedRole(id as 'candidate' | 'employer')}
            variant="segmented"
            className="w-full flex"
          />
        </div>

        {/* Error Alert */}
        {(formError || authError) && (
          <Alert variant="error" title="Registration Error">
            {formError || authError}
          </Alert>
        )}

        {/* Premium Google OAuth Sign Up Action */}
        <GoogleAuthButton
          role={selectedRole}
          text={`Sign up with Google as ${selectedRole === 'employer' ? 'Employer' : 'Candidate'}`}
          onError={(err) => setFormError(err)}
        />

        {/* Visual Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-kth-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-kth-slate-400 uppercase tracking-wider shrink-0">
            or sign up with email
          </span>
          <div className="border-t border-kth-slate-200 w-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        {/* Full Name */}
        <Input
          label="Full Name"
          type="text"
          placeholder="e.g. Aarav Mehta"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (formError) setFormError(null);
          }}
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="name"
          required
        />

        {/* Email Input */}
        <div>
          <Input
            label={selectedRole === 'employer' ? 'Corporate Work Email' : 'Email Address'}
            type="email"
            placeholder={selectedRole === 'employer' ? 'name@company.com' : 'aarav.mehta@example.com'}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formError) setFormError(null);
            }}
            leftIcon={<Mail className="w-4 h-4" />}
            autoComplete="email"
            required
          />

          {/* Employer Generic Email Warning */}
          {selectedRole === 'employer' && email && isGenericEmail(email) && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>Using a corporate work email speeds up enterprise verification.</span>
            </div>
          )}
        </div>

        {/* Employer Company Name */}
        {selectedRole === 'employer' && (
          <Input
            label="Company / Enterprise Name"
            type="text"
            placeholder="e.g. Acme Sustainability Pvt. Ltd."
            value={companyName}
            onChange={(e) => {
              setCompanyName(e.target.value);
              if (formError) setFormError(null);
            }}
            leftIcon={<Building2 className="w-4 h-4" />}
            required
          />
        )}

        {/* Password */}
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters with number & uppercase"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (formError) setFormError(null);
            }}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-kth-slate-400 hover:text-kth-slate-600 focus:outline-none p-1 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            autoComplete="new-password"
            required
          />

          {/* Password Strength Feedback Bar */}
          {password && (
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-kth-slate-500">
                <span>Strength:</span>
                <span className="font-semibold text-kth-slate-700">{getPwdStrengthLabel().label}</span>
              </div>
              <div className="h-1.5 w-full bg-kth-slate-100 rounded-full overflow-hidden flex gap-1">
                <div className={`h-full transition-all duration-300 ${pwdScore >= 1 ? getPwdStrengthLabel().color : 'bg-transparent'} flex-1`} />
                <div className={`h-full transition-all duration-300 ${pwdScore >= 3 ? getPwdStrengthLabel().color : 'bg-transparent'} flex-1`} />
                <div className={`h-full transition-all duration-300 ${pwdScore >= 5 ? getPwdStrengthLabel().color : 'bg-transparent'} flex-1`} />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (formError) setFormError(null);
          }}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            confirmPassword && confirmPassword === password ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : undefined
          }
          autoComplete="new-password"
          required
        />

        {/* Submit Action */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full font-bold shadow-xs mt-2"
          isLoading={isLoading}
          disabled={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Create {selectedRole === 'employer' ? 'Employer' : 'Candidate'} Account
        </Button>

        {/* Navigation back to Sign In */}
        <div className="pt-4 border-t border-kth-slate-100 text-center text-xs text-kth-slate-600">
          <span>Already have an account? </span>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-bold text-kth-primary-600 hover:text-kth-primary-700 hover:underline"
          >
            Sign in
          </button>
        </div>
      </form>
      </div>
    </AuthLayout>
  );
};
