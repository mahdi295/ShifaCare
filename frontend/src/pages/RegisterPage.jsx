import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import NeumorphicBox from '../components/ui/NeumorphicBox';
import { Loader2, ArrowLeft, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const RegisterPage = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPw, setShowPw] = React.useState(false);
  const [showCpw, setShowCpw] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {},
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await signup(data);
    setIsSubmitting(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors nm-button py-2 px-4">
            <ArrowLeft size={15} /> {t('auth.backToHome')}
          </Link>
        </div>

      <NeumorphicBox className="p-8 md:p-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary">{t('auth.createAccount')}</h1>
          <p className="text-muted text-sm mt-1">{t('auth.registerSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 px-1">{t('auth.fullName')}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input {...register('name')} type="text" className="nm-input w-full pl-11" placeholder="Your full name" autoComplete="name" />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1 px-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 px-1">{t('auth.emailAddress')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input {...register('email')} type="email" className="nm-input w-full pl-11" placeholder="name@example.com" autoComplete="email" />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 px-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 px-1">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                {...register('password')}
                type={showPw ? 'text' : 'password'}
                className="nm-input w-full pl-11 pr-11"
                placeholder="Min 6 characters"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 px-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 px-1">{t('auth.confirmPassword')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                {...register('confirmPassword')}
                type={showCpw ? 'text' : 'password'}
                className="nm-input w-full pl-11 pr-11"
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowCpw(!showCpw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text">
                {showCpw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 px-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="nm-button-accent w-full flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : t('auth.registerButton')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              {t('auth.loginLink')}
            </Link>
          </p>
        </div>
      </NeumorphicBox>
      </div>
    </div>
  );
};

export default RegisterPage;
