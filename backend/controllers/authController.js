import crypto from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.js';

// @desc    Register (PUBLIC — always patient)
// @route   POST /api/v1/auth/register
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorResponse('Name, email and password are required', 400));
  }
  const user = await User.create({ name, email, password, phone, role: 'patient' });
  sendTokenResponse(user, 201, res);
});

// @desc    Login
// @route   POST /api/v1/auth/login
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new ErrorResponse('Invalid credentials', 401));
  if (!user.isActive) {
    return next(new ErrorResponse('Your account has been deactivated. Contact support.', 403));
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) return next(new ErrorResponse('Invalid credentials', 401));
  sendTokenResponse(user, 200, res);
});

// @desc    Logout
// @route   GET /api/v1/auth/logout
export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully', data: {} });
});

// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

// @desc    Update profile
// @route   PUT /api/v1/auth/updateprofile
export const updateProfile = asyncHandler(async (req, res) => {
  const fields = {};
  if (req.body.name)    fields.name    = req.body.name;
  if (req.body.phone)   fields.phone   = req.body.phone;
  if (req.body.address) fields.address = req.body.address;
  const user = await User.findByIdAndUpdate(req.user.id, fields, { new: true, runValidators: true });
  res.status(200).json({ success: true, message: 'Profile updated', data: user });
});

// @desc    Upload / update avatar
// @route   PUT /api/v1/auth/avatar
export const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ErrorResponse('Please upload an image file', 400));
  const user = await User.findById(req.user.id);
  await deleteFromCloudinary(user.avatar);
  const result = await uploadToCloudinary(req.file.buffer, 'shifacare/avatars');
  user.avatar = result.secure_url;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, message: 'Avatar updated successfully', data: { avatar: result.secure_url } });
});

// @desc    Delete avatar
// @route   DELETE /api/v1/auth/avatar
export const deleteAvatar = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  if (user.avatar && user.avatar !== 'no-photo.jpg') {
    await deleteFromCloudinary(user.avatar);
  }
  user.avatar = 'no-photo.jpg';
  await user.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, message: 'Profile photo removed', data: { avatar: 'no-photo.jpg' } });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Please provide current and new password', 400));
  }
  if (newPassword.length < 6) {
    return next(new ErrorResponse('New password must be at least 6 characters', 400));
  }
  const user = await User.findById(req.user.id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) return next(new ErrorResponse('Current password is incorrect', 401));
  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password — DEVELOPMENT MODE (Prints link to console)
// @route   POST /api/v1/auth/forgotpassword
export const forgotPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email) {
    return next(new ErrorResponse('Please provide an email address', 400));
  }

  const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });

  // Security: always respond with the same message whether email exists or not
  const genericMsg = 'If that email is registered, a reset link has been sent.';

  if (!user) {
    console.log(`[Dev] Forgot password requested for non-existent email: ${req.body.email}`);
    return res.status(200).json({ success: true, message: genericMsg });
  }

  // Generate raw token (saved as hash in DB)
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Build the reset URL pointing to the frontend
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const resetUrl  = `${clientUrl}/reset-password/${resetToken}`;

  // ==========================================
  // DEVELOPMENT MODE: Skip sending real emails
  // ==========================================
  console.log('\n========================================');
  console.log('🔥 PASSWORD RESET LINK (Development Mode)');
  console.log(`User: ${user.name} (${user.email})`);
  console.log(`Link: ${resetUrl}`);
  console.log('========================================\n');

  return res.status(200).json({
    success: true,
    message: 'Password reset link generated! Check your backend terminal to copy the link.',
    resetUrl: resetUrl,
    devNote: 'Email sending is disabled in development mode. Use the resetUrl above or check the terminal.'
  });
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
export const resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.params.resettoken) {
    return next(new ErrorResponse('Reset token is missing', 400));
  }

  // Hash the raw token from the URL to match what's in the DB
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('This reset link is invalid or has expired. Please request a new one.', 400));
  }

  if (!req.body.password) {
    return next(new ErrorResponse('Please provide a new password', 400));
  }

  if (req.body.password.length < 6) {
    return next(new ErrorResponse('Password must be at least 6 characters', 400));
  }

  user.password            = req.body.password;
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Log the user in immediately after reset
  sendTokenResponse(user, 200, res);
});

// @desc    Admin creates staff account (doctor only)
// @route   POST /api/v1/auth/create-staff
export const createStaffAccount = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;
  const allowedRoles = ['doctor'];
  if (!allowedRoles.includes(role)) {
    return next(new ErrorResponse('This endpoint only creates doctor accounts', 400));
  }
  const user = await User.create({
    name,
    email,
    password: password || 'ShifaCare@2024',
    role,
    phone,
  });
  res.status(201).json({
    success: true,
    message: `${role} account created`,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// ─── Helper ──────────────────────────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token            = user.getSignedJwtToken();
  const cookieExpireDays = parseInt(process.env.COOKIE_EXPIRE, 10) || 30;

  const options = {
    expires:  new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'none',
    secure:   process.env.NODE_ENV === 'production',
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    data: {
      id:      user._id,
      name:    user.name,
      email:   user.email,
      role:    user.role,
      avatar:  user.avatar,
      phone:   user.phone,
      address: user.address,
    },
  });
};