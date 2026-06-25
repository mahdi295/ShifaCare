import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../utils/axios';
import NeumorphicBox from '../components/ui/NeumorphicBox';
import { Mail, ArrowLeft, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const ForgotPasswordPage = () => {
  const [sent, setSent]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [devUrl, setDevUrl]     = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgotpassword', { email });
      setSubmittedEmail(email);
      setSent(true);
      if (data.resetUrl) setDevUrl(data.resetUrl);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary">ShifaCare</h1>
          <p className="text-muted text-sm mt-1">Hospital Management System</p>
        </div>

        <NeumorphicBox className="p-8">
          {sent ? (
            /* ── Success state ─────────────────────────────────────────── */
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mx-auto">
                <CheckCircle2 className="text-green-500" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Check your inbox</h2>
                <p className="text-muted text-sm mt-2 leading-relaxed">
                  If <span className="font-semibold text-text">{submittedEmail}</span> is registered,
                  a password reset link has been sent. Check your spam folder too.
                  The link expires in <strong>10 minutes</strong>.
                </p>
              </div>

              {/* Dev / no-SMTP helper */}
              {devUrl && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-3">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                    ⚙️ Dev / No-SMTP Mode
                  </p>
                  <p className="text-xs text-amber-600">
                    SMTP is not configured — use the link below to test the reset flow:
                  </p>
                  <a
                    href={devUrl}
                    className="flex items-center gap-2 text-xs font-semibold text-primary bg-white border border-primary/20 rounded-lg px-3 py-2.5 hover:bg-primary/5 transition-colors break-all"
                  >
                    <ExternalLink size={13} className="shrink-0" />
                    Click here to reset password
                  </a>
                  <p className="text-[11px] text-amber-500">
                    This box is hidden in production when SMTP is configured.
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => { setSent(false); setDevUrl(''); }}
                  className="text-sm text-muted hover:text-primary transition-colors underline underline-offset-2"
                >
                  Didn't receive it? Try again
                </button>
                <div>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
                  >
                    <ArrowLeft size={15} /> Back to Login
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* ── Form ──────────────────────────────────────────────────── */
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold">Forgot Password?</h2>
                <p className="text-muted text-sm mt-1">
                  Enter your registered email and we'll send a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 px-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="nm-input w-full pl-11"
                      autoFocus
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1.5 px-1">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="nm-button-accent w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-muted text-sm hover:text-primary transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </>
          )}
        </NeumorphicBox>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
