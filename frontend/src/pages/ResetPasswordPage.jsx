import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../utils/axios';
import NeumorphicBox from '../components/ui/NeumorphicBox';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const schema = z
  .object({
    password:        z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const ResetPasswordPage = () => {
  const { resettoken } = useParams();
  const navigate       = useNavigate();
  const [done, setDone]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ password }) => {
    setLoading(true);
    try {
      await api.put(`/auth/resetpassword/${resettoken}`, { password });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (error) {
      const msg = error.response?.data?.message || 'Reset failed.';
      // Detect expired/invalid token and show dedicated UI
      if (
        error.response?.status === 400 ||
        msg.toLowerCase().includes('expired') ||
        msg.toLowerCase().includes('invalid')
      ) {
        setExpired(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Token expired / invalid ────────────────────────────────────────────────
  if (expired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-primary">ShifaCare</h1>
            <p className="text-muted text-sm mt-1">Hospital Management System</p>
          </div>
          <NeumorphicBox className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Link Expired</h2>
              <p className="text-muted text-sm mt-2 leading-relaxed">
                This password reset link is invalid or has already been used.
                Reset links expire after <strong>10 minutes</strong>.
              </p>
            </div>
            <Link
              to="/forgot-password"
              className="inline-block w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold text-center hover:bg-primary/90 transition-colors"
            >
              Request a New Link
            </Link>
            <Link to="/login" className="block text-sm text-muted hover:text-primary transition-colors">
              Back to Login
            </Link>
          </NeumorphicBox>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary">ShifaCare</h1>
          <p className="text-muted text-sm mt-1">Hospital Management System</p>
        </div>

        <NeumorphicBox className="p-8">
          {done ? (
            /* ── Success ────────────────────────────────────────────────── */
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="text-green-500" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Password Reset!</h2>
                <p className="text-muted text-sm mt-2">
                  Your password has been updated. Redirecting you to login…
                </p>
              </div>
              <div className="w-full bg-border rounded-full h-1 overflow-hidden">
                <div className="bg-primary h-1 rounded-full animate-[grow_2.5s_linear_forwards]" style={{ width: '100%', animation: 'none', transition: 'width 2.5s linear' }} />
              </div>
            </div>
          ) : (
            /* ── Form ───────────────────────────────────────────────────── */
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold">Set New Password</h2>
                <p className="text-muted text-sm mt-1">Choose a strong password for your account.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* New password */}
                <div>
                  <label className="block text-sm font-medium mb-2 px-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      className="nm-input w-full pl-11 pr-11"
                      autoFocus
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                    >
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1.5 px-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium mb-2 px-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
                    <input
                      type={showCpw ? 'text' : 'password'}
                      placeholder="Repeat your new password"
                      className="nm-input w-full pl-11 pr-11"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCpw(!showCpw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                    >
                      {showCpw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1.5 px-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="nm-button-accent w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Reset Password'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-muted text-sm hover:text-primary transition-colors">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </NeumorphicBox>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
