import express from 'express';
import {
  createPrescription,
  getMyPrescriptions,
  getPrescription,
} from '../controllers/prescriptionController.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('doctor'), createPrescription);
router.get('/me', getMyPrescriptions);
router.get('/:id', getPrescription);

export default router;
