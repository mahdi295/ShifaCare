import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  updatePassword,
  forgotPassword,
  resetPassword,
  createStaffAccount,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public
router.post('/register',                    register);
router.post('/login',                       login);
router.get('/logout',                       logout);
router.post('/forgotpassword',              forgotPassword);
router.put('/resetpassword/:resettoken',    resetPassword);

// Private — any logged-in user
router.get('/me',                           protect, getMe);
router.put('/updateprofile',                protect, updateProfile);
router.put('/updatepassword',               protect, updatePassword);
router.put('/avatar',                       protect, upload.single('avatar'), uploadAvatar);
router.delete('/avatar',                    protect, deleteAvatar);

// Admin only
router.post('/create-staff',                protect, authorize('admin'), createStaffAccount);

export default router;
