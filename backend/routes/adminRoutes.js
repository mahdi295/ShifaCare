import express from 'express';
import {
  getAnalytics,
  getAllUsers,
  toggleUserActive,
  confirmPayment,
  getPendingPayments,
  getAllAppointments,
  getRevenueChart,
  getAdminRefunds,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/analytics',              getAnalytics);
router.get('/users',                  getAllUsers);
router.put('/users/:id/toggle',       toggleUserActive);
router.get('/payments/pending',       getPendingPayments);
router.put('/payments/:id/confirm',   confirmPayment);
router.get('/appointments',           getAllAppointments);
router.get('/revenue-chart',          getRevenueChart);
router.get('/refunds',                getAdminRefunds);

export default router;
