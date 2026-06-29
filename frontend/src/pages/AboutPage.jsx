import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PublicLayout from '../layouts/PublicLayout';
import NeumorphicBox from '../components/ui/NeumorphicBox';
import {
  Target, Eye, Heart, Award, Users, Calendar,
  CheckCircle2, ArrowRight, Stethoscope, ShieldCheck,
} from 'lucide-react';

const ACHIEVEMENT_ICONS = [Users, Award, Calendar, Heart];
const VALUE_ICONS = [Heart, ShieldCheck, Award, Users];

const TEAM = [
  { name: 'Dr. Aminul Islam',   role: 'Chief Medical Officer',    dept: 'Cardiology'   },
  { name: 'Dr. Sumaiya Rahman', role: 'Head of Neurology',        dept: 'Neurology'    },
  { name: 'Dr. Tariqul Hasan',  role: 'Senior Pediatrician',      dept: 'Pediatrics'   },
  { name: 'Dr. Nusrat Jahan',   role: 'Lead Orthopedic Surgeon',  dept: 'Orthopedics'  },
];

const AboutPage = () => {
  const { t } = useTranslation();
  const achievements = t('aboutPage.achievements', { returnObjects: true });
  const values = t('aboutPage.values', { returnObjects: true });
  const bullets = t('aboutPage.bullets', { returnObjects: true });

  return (
  <PublicLayout>

    {/* Hero */}
    <section className="px-6 py-20 md:py-28">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div>
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">{t('aboutPage.tag')}</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {t('aboutPage.title1')} <span className="text-primary">{t('aboutPage.title2')}</span>
          </h1>
          <p className="mt-6 text-muted leading-relaxed text-lg">
            {t('aboutPage.intro')}
          </p>
          <div className="mt-8 space-y-3">
            {bullets.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-muted">
                <CheckCircle2 size={16} className="text-primary-secondary shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {achievements.map(({ value, label }, i) => {
            const Icon = ACHIEVEMENT_ICONS[i];
            return (
              <NeumorphicBox key={label} className="p-7 text-center">
                <div className="w-12 h-12 bg-background rounded-lg border border-border flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-primary" />
                </div>
                <p className="text-3xl font-bold text-primary">{value}</p>
                <p className="text-xs text-muted mt-1">{label}</p>
              </NeumorphicBox>
            );
          })}
        </div>
      </div>
    </section>

    {/* Mission + Vision */}
    <section className="px-6 py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <NeumorphicBox className="p-8">
          <div className="w-12 h-12 bg-background rounded-lg border border-border flex items-center justify-center mb-5">
            <Target size={22} className="text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3">{t('aboutPage.missionTitle')}</h3>
          <p className="text-muted text-sm leading-relaxed">
            {t('aboutPage.missionText')}
          </p>
        </NeumorphicBox>
        <NeumorphicBox className="p-8">
          <div className="w-12 h-12 bg-background rounded-lg border border-border flex items-center justify-center mb-5">
            <Eye size={22} className="text-primary-secondary" />
          </div>
          <h3 className="text-xl font-bold mb-3">{t('aboutPage.visionTitle')}</h3>
          <p className="text-muted text-sm leading-relaxed">
            {t('aboutPage.visionText')}
          </p>
        </NeumorphicBox>
      </div>
    </section>

    {/* Values */}
    <section className="px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">{t('aboutPage.valuesTag')}</p>
          <h2 className="text-3xl font-bold">{t('aboutPage.valuesTitle')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(({ title, desc }, i) => {
            const Icon = VALUE_ICONS[i];
            return (
              <NeumorphicBox key={title} className="p-7">
                <div className="w-11 h-11 bg-background rounded-lg border border-border flex items-center justify-center mb-5">
                  <Icon size={20} className="text-primary" />
                </div>
                <h4 className="font-bold mb-2">{title}</h4>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </NeumorphicBox>
            );
          })}
        </div>
      </div>
    </section>

    {/* Leadership Team */}
    <section className="px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">{t('aboutPage.leadershipTag')}</p>
          <h2 className="text-3xl font-bold">{t('aboutPage.leadershipTitle')}</h2>
          <p className="text-muted mt-3 text-sm">{t('aboutPage.leadershipSubtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map(({ name, role, dept }) => (
            <NeumorphicBox key={name} className="p-7 text-center">
              <div className="w-16 h-16 bg-background rounded-lg border border-border flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                {name.split(' ').slice(-1)[0][0]}
              </div>
              <h4 className="font-bold text-sm">{name}</h4>
              <p className="text-xs text-primary mt-1">{role}</p>
              <p className="text-xs text-muted mt-1">{dept}</p>
            </NeumorphicBox>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <NeumorphicBox className="p-10 text-center">
          <Stethoscope size={32} className="text-primary mx-auto mb-5" />
          <h3 className="text-2xl font-bold mb-3">{t('aboutPage.ctaTitle')}</h3>
          <p className="text-muted text-sm mb-7">
            {t('aboutPage.ctaText')}
          </p>
          <Link to="/doctors" className="nm-button-accent py-3.5 px-10 inline-flex items-center gap-2">
            {t('aboutPage.ctaButton')} <ArrowRight size={16} />
          </Link>
        </NeumorphicBox>
      </div>
    </section>

  </PublicLayout>
  );
};

export default AboutPage;
