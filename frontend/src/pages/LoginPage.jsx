import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, Activity } from 'lucide-react';

const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const features = t('auth.loginFeatures', { returnObjects: true });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    setError('');
    const result = await login(email, password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.message || 'Invalid email or password');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[44%] bg-primary flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface/20 flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
          <span className="font-bold text-xl text-white">ShifaCare</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            {t('auth.loginHeroTitle1')}<br />{t('auth.loginHeroTitle2')}
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            {t('auth.loginHeroText')}
          </p>
          <div className="mt-10 space-y-4">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-white/80">
                <div className="w-5 h-5 rounded-full bg-surface/20 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 10 10" className="w-3 h-3 fill-white"><path d="M8.5 2L4 7.5 1.5 5"/><path d="M1.5 5l2.5 2.5L8.5 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-xs">© {new Date().getFullYear()} ShifaCare · Bangladesh</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-sm mx-auto">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-8">
            <ArrowLeft size={14} /> {t('auth.backToHome')}
          </Link>

          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-heading">ShifaCare</span>
          </div>

          <h1 className="text-2xl font-bold text-heading mb-1">{t('auth.welcomeBack')}</h1>
          <p className="text-muted text-sm mb-8">{t('auth.signInSubtitle')}</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-body mb-1.5">{t('auth.emailAddress')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" size={15} />
                <input
                  {...register('email')}
                  type="email"
                  className="form-input pl-9"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-body">{t('auth.password')}</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" size={15} />
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  className="form-input pl-9 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-body transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : t('auth.signInButton')}
            </button>
          </form>

          <p className="text-sm text-muted text-center mt-6">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              {t('auth.registerLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
