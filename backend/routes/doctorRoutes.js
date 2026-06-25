import express from 'express';
import {
  getDoctors,
  getDoctor,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  toggleAvailability,
  getDoctorEarnings,
} from '../controllers/doctorController.js';
import { getAvailableSlots } from '../controllers/slotController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/', getDoctors);
router.get('/:id/slots', getAvailableSlots);
router.get('/:id', getDoctor);

// Protected
router.get('/me/earnings', protect, authorize('doctor'), getDoctorEarnings);
router.post('/', protect, authorize('admin'), addDoctor);
router.put('/:id', protect, authorize('admin', 'doctor'), updateDoctor);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);
router.put('/:id/toggle-availability', protect, authorize('admin', 'doctor'), toggleAvailability);

export default router;
