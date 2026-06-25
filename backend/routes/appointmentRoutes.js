import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getTodayAppointments,
  rescheduleAppointment,
} from '../controllers/appointmentController.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/today', authorize('doctor', 'admin'), getTodayAppointments);
router.get('/me', getMyAppointments);
router.post('/', authorize('patient'), bookAppointment);

router.get('/:id', getAppointment);
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/status', authorize('doctor', 'admin'), updateAppointmentStatus);
router.put('/:id/reschedule', rescheduleAppointment);

export default router;
