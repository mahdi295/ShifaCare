import React, { useState } from 'react';
import PublicLayout from '../layouts/PublicLayout';
import NeumorphicBox from '../components/ui/NeumorphicBox';
import { useTranslation } from 'react-i18next';
import {
  Phone, Mail, MapPin, Clock, Send, Loader2, CheckCircle2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const schema = z.object({
  name:    z.string().min(2,  'Name must be at least 2 characters'),
  email:   z.string().email( 'Please enter a valid email'),
  phone:   z.string().optional(),
  subject: z.string().min(4,  'Subject is too short'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

const INFO_ICONS = [Phone, Mail, MapPin, Clock];

const ContactPage = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const infoCards = t('contactPage.infoCards', { returnObjects: true });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    // Simulate network delay — in production wire to an email/contact API
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
    toast.success('Message sent! We will get back to you soon.');
    reset();
  };

  return (
    <PublicLayout>

      {/* Header */}
      <section className="px-6 py-20 text-center">
        <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">{t('contactPage.tag')}</p>
        <h1 className="text-4xl md:text-5xl font-bold">{t('contactPage.title')}</h1>
        <p className="text-muted mt-4 max-w-xl mx-auto">
          {t('contactPage.subtitle')}
        </p>
      </section>

      {/* Info cards */}
      <section className="px-6 pb-14">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {infoCards.map(({ title, lines, sub }, i) => {
            const Icon = INFO_ICONS[i];
            return (
              <NeumorphicBox key={title} className="p-6 text-center">
                <div className="w-12 h-12 bg-background rounded-lg border border-border flex items-center justify-center mx-auto mb-4">
                  <Icon size={20} className="text-primary" />
                </div>
                <h4 className="font-bold text-sm mb-2">{title}</h4>
                {lines.map((l) => (
                  <p key={l} className="text-sm text-muted">{l}</p>
                ))}
                <p className="text-xs text-primary mt-2 font-medium">{sub}</p>
              </NeumorphicBox>
            );
          })}
        </div>
      </section>

      {/* Form + Map */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Contact form */}
          <NeumorphicBox className="p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-background rounded-lg border border-border flex items-center justify-center mb-5">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-bold">{t('contactPage.successTitle')}</h3>
                <p className="text-muted text-sm mt-2 max-w-xs">
                  {t('contactPage.successText')}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="nm-button text-sm text-muted mt-6 py-2.5 px-6"
                >
                  {t('contactPage.sendAnother')}
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-6">{t('contactPage.formTitle')}</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-2 px-1">{t('contactPage.fullName')}</label>
                      <input className="nm-input w-full" placeholder="Your name" {...register('name')} />
                      {errors.name && <p className="text-red-500 text-xs mt-1 px-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 px-1">{t('contactPage.phoneOptional')}</label>
                      <input className="nm-input w-full" placeholder="+880 XXXX" {...register('phone')} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 px-1">{t('contactPage.emailAddress')}</label>
                    <input className="nm-input w-full" type="email" placeholder="you@email.com" {...register('email')} />
                    {errors.email && <p className="text-red-500 text-xs mt-1 px-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 px-1">{t('contactPage.subject')}</label>
                    <input className="nm-input w-full" placeholder={t('contactPage.subjectPlaceholder')} {...register('subject')} />
                    {errors.subject && <p className="text-red-500 text-xs mt-1 px-1">{errors.subject.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 px-1">{t('contactPage.message')}</label>
                    <textarea
                      className="nm-input w-full min-h-[130px] resize-none"
                      placeholder={t('contactPage.messagePlaceholder')}
                      {...register('message')}
                    />
                    {errors.message && <p className="text-red-500 text-xs mt-1 px-1">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="nm-button-accent w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading
                      ? <Loader2 className="animate-spin" size={20} />
                      : <><Send size={17} /> {t('contactPage.sendButton')}</>
                    }
                  </button>
                </form>
              </>
            )}
          </NeumorphicBox>

          {/* Map embed */}
          <NeumorphicBox className="p-3 overflow-hidden min-h-[450px]">
            <div className="w-full h-full rounded-xl overflow-hidden bg-background rounded-lg border border-border">
              {/*
                ╔══════════════════════════════════════════════════════════════╗
                ║  HOW TO CHANGE THE MAP LOCATION                             ║
                ║  1. Go to https://maps.google.com                           ║
                ║  2. Search your hospital / location                         ║
                ║  3. Click Share → Embed a map → Copy HTML                   ║
                ║  4. Replace the src="..." value below with the new URL      ║
                ╚══════════════════════════════════════════════════════════════╝
                Current location: Chandgaon, Chattogram, Bangladesh
              */}
              <iframe
                title="ShifaCare Hospital Location"
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d403.46824292256497!2d91.87428297269817!3d22.37670319386754!2m3!1f0!2f39.356517293189114!3f0!3m2!1i1024!2i768!4f35!5e1!3m2!1sen!2sbd!4v1781173328863!5m2!1sen!2sbd" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '420px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </NeumorphicBox>
        </div>
      </section>

    </PublicLayout>
  );
};

export default ContactPage;
