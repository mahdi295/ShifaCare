import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import NeumorphicBox from '../components/ui/NeumorphicBox';
import PageTransition from '../components/ui/PageTransition';
import {
  User, Mail, Phone, MapPin, Lock, Camera, Loader2,
  Eye, EyeOff, CheckCircle2, Shield, X,
} from 'lucide-react';

// ── Schemas ──────────────────────────────────────────────────────────────────
const profileSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters'),
  phone:   z.string().optional(),
  address: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword:     z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ── Component ─────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, updateProfile, updatePassword, uploadAvatar, deleteAvatar } = useAuth();

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading]   = useState(false);
  const [avatarPreview, setAvatarPreview]   = useState(null);
  const [avatarDeleting, setAvatarDeleting] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showNpw, setShowNpw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const fileInputRef = useRef(null);

  // Profile form
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name:    user?.name    || '',
      phone:   user?.phone   || '',
      address: user?.address || '',
    },
  });

  // Password form
  const {
    register: regPw,
    handleSubmit: handlePw,
    reset: resetPwForm,
    formState: { errors: pwErrors },
  } = useForm({ resolver: zodResolver(passwordSchema) });

  // ── Handlers ────────────────────────────────────────────────────────────
  const onProfileSubmit = async (values) => {
    setProfileLoading(true);
    await updateProfile(values);
    setProfileLoading(false);
  };

  const onPasswordSubmit = async ({ currentPassword, newPassword }) => {
    setPasswordLoading(true);
    const result = await updatePassword(currentPassword, newPassword);
    if (result.success) resetPwForm();
    setPasswordLoading(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    setAvatarLoading(true);
    await uploadAvatar(file);
    setAvatarLoading(false);
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('Remove profile photo?')) return;
    setAvatarDeleting(true);
    await deleteAvatar();
    setAvatarPreview(null);
    setAvatarDeleting(false);
  };

  const avatarSrc =
    avatarPreview ||
    (user?.avatar && user.avatar !== 'no-photo.jpg'
      ? user.avatar
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&size=200&background=6C63FF&color=fff`);

  return (
    <PageTransition>
      <div className="space-y-8 max-w-2xl">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div>
          <h3 className="text-xl font-bold">My Profile</h3>
          <p className="text-muted text-sm mt-1">Manage your personal information and security</p>
        </div>

        {/* ── Avatar card ──────────────────────────────────────────────── */}
        <NeumorphicBox className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-24 h-24 bg-background rounded-lg border border-border p-1">
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              {/* Upload overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading || avatarDeleting}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-surface rounded-xl border border-border shadow-card
                           flex items-center justify-center text-primary
                           hover:bg-background rounded-lg border border-border transition-all disabled:opacity-50"
                title="Change photo"
              >
                {avatarLoading
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Camera size={15} />
                }
              </button>
              {/* Delete avatar button — only shown when user has a real photo */}
              {user?.avatar && user.avatar !== 'no-photo.jpg' && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={avatarDeleting || avatarLoading}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-xl bg-surface rounded-xl border border-border shadow-card
                             flex items-center justify-center text-red-400
                             hover:text-red-600 hover:bg-background rounded-lg border border-border transition-all disabled:opacity-50"
                  title="Remove photo"
                >
                  {avatarDeleting
                    ? <Loader2 size={13} className="animate-spin" />
                    : <X size={13} />
                  }
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div>
              <p className="font-bold text-lg">{user?.name}</p>
              <p className="text-muted text-sm capitalize">{user?.role}</p>
              <p className="text-muted text-xs mt-1">{user?.email}</p>
              <p className="text-xs text-muted mt-2">
                Max file size: 2 MB · JPG, PNG, WebP
              </p>
            </div>
          </div>
        </NeumorphicBox>

        {/* ── Personal Info form ───────────────────────────────────────── */}
        <NeumorphicBox className="p-6">
          <h4 className="font-bold mb-5 flex items-center gap-2">
            <User size={18} className="text-primary" />
            Personal Information
          </h4>

          <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2 px-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="text"
                  className="nm-input w-full pl-11"
                  placeholder="Your full name"
                  {...regProfile('name')}
                />
              </div>
              {profileErrors.name && (
                <p className="text-red-500 text-xs mt-1 px-1">{profileErrors.name.message}</p>
              )}
            </div>

            {/* Email — read only */}
            <div>
              <label className="block text-sm font-medium mb-2 px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="nm-input w-full pl-11 opacity-50 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted px-1 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2 px-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="tel"
                  className="nm-input w-full pl-11"
                  placeholder="+880 1X XX XXX XXX"
                  {...regProfile('phone')}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-2 px-1">Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-muted" size={16} />
                <textarea
                  className="nm-input w-full pl-11 min-h-[80px] resize-none"
                  placeholder="Your address"
                  {...regProfile('address')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="nm-button-accent py-3 px-8 flex items-center gap-2 disabled:opacity-50"
            >
              {profileLoading
                ? <Loader2 className="animate-spin" size={18} />
                : <><CheckCircle2 size={18} /> Save Changes</>
              }
            </button>
          </form>
        </NeumorphicBox>

        {/* ── Change password form ─────────────────────────────────────── */}
        <NeumorphicBox className="p-6">
          <h4 className="font-bold mb-5 flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            Change Password
          </h4>

          <form onSubmit={handlePw(onPasswordSubmit)} className="space-y-5">
            {/* Current */}
            <div>
              <label className="block text-sm font-medium mb-2 px-1">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="nm-input w-full pl-11 pr-11"
                  placeholder="Your current password"
                  {...regPw('currentPassword')}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwErrors.currentPassword && (
                <p className="text-red-500 text-xs mt-1 px-1">{pwErrors.currentPassword.message}</p>
              )}
            </div>

            {/* New */}
            <div>
              <label className="block text-sm font-medium mb-2 px-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type={showNpw ? 'text' : 'password'}
                  className="nm-input w-full pl-11 pr-11"
                  placeholder="At least 6 characters"
                  {...regPw('newPassword')}
                />
                <button type="button" onClick={() => setShowNpw(!showNpw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text">
                  {showNpw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwErrors.newPassword && (
                <p className="text-red-500 text-xs mt-1 px-1">{pwErrors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium mb-2 px-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type={showCpw ? 'text' : 'password'}
                  className="nm-input w-full pl-11 pr-11"
                  placeholder="Repeat new password"
                  {...regPw('confirmPassword')}
                />
                <button type="button" onClick={() => setShowCpw(!showCpw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text">
                  {showCpw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 px-1">{pwErrors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="nm-button-accent py-3 px-8 flex items-center gap-2 disabled:opacity-50"
            >
              {passwordLoading
                ? <Loader2 className="animate-spin" size={18} />
                : <><Shield size={18} /> Update Password</>
              }
            </button>
          </form>
        </NeumorphicBox>

      </div>
    </PageTransition>
  );
};

export default ProfilePage;
