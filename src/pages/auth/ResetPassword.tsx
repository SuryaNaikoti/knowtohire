import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../lib/supabaseClient';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../../lib/validation/authSchemas';
import { generateStrongPassword } from '../../lib/validation/passwordGenerator';
import { useCapsLock } from '../../hooks/useCapsLock';
import { PasswordStrengthMeter } from '../../components/auth/PasswordStrengthMeter';
import { FormErrorSummary } from '../../components/auth/FormErrorSummary';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Save, CheckCircle, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const capsLockPassword = useCapsLock();
  const capsLockConfirm = useCapsLock();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = useWatch({ control, name: 'password' });

  const handleGeneratePassword = () => {
    const strongPassword = generateStrongPassword(16);
    setValue('password', strongPassword, { shouldValidate: true });
    setValue('confirmPassword', strongPassword, { shouldValidate: true });
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  const handlePasswordUpdate = async (values: ResetPasswordFormValues) => {
    setServerError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message || 'Failed to update password. Session link may have expired.');
    }
  };

  return (
    <AuthLayout title="Enter New Password" subtitle="Choose a strong, secure passphrase for your account.">
      {serverError && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-750 text-xs font-semibold leading-relaxed flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p>{serverError}</p>
        </div>
      )}

      {/* Accessible Form Error Summary Banner */}
      <FormErrorSummary errors={errors} />

      {success ? (
        <div className="space-y-4 py-4 text-center" role="status" aria-live="polite">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-semibold">
            Your password has been updated successfully. You can now login with your new credentials.
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
          >
            Go to Login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(handlePasswordUpdate)} className="space-y-4" noValidate>
          {/* New Password Field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                New Password <span className="text-red-500">*</span>
              </label>
              {capsLockPassword.capsLockActive && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 animate-pulse">
                  Caps Lock is ON ⇪
                </span>
              )}
            </div>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              error={errors.password?.message}
              onKeyDown={capsLockPassword.onKeyDown}
              onKeyUp={capsLockPassword.onKeyUp}
              onFocus={capsLockPassword.onFocus}
              {...register('password', {
                onBlur: () => capsLockPassword.onBlur(),
              })}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={0}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              className="w-full text-xs font-semibold h-11"
            />

            {/* Password Strength Meter & Generator */}
            <PasswordStrengthMeter password={passwordValue} onGeneratePassword={handleGeneratePassword} />
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label htmlFor="confirmPassword" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              {capsLockConfirm.capsLockActive && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 animate-pulse">
                  Caps Lock is ON ⇪
                </span>
              )}
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter new password"
              error={errors.confirmPassword?.message}
              onKeyDown={capsLockConfirm.onKeyDown}
              onKeyUp={capsLockConfirm.onKeyUp}
              onFocus={capsLockConfirm.onFocus}
              {...register('confirmPassword', {
                onBlur: () => capsLockConfirm.onBlur(),
              })}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={0}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              className="w-full text-xs font-semibold h-11"
            />
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="w-full h-11 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Updating Password...' : 'Update Password'}</span>
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
