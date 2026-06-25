import express from 'express';
import {
  initPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN,
  getMyPayments,
  requestRefund,
  getRefundRequests,
} from '../controllers/paymentController.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// SSLCommerz callbacks — public
router.post('/success/:tran_id', paymentSuccess);
router.post('/fail/:tran_id',    paymentFail);
router.post('/cancel/:tran_id',  paymentCancel);
router.post('/ipn',              paymentIPN);

// Protected routes
router.post('/init/:appointmentId', protect, authorize('patient'), initPayment);
router.get('/me',                   protect, authorize('patient', 'admin'), getMyPayments);
router.post('/:id/refund',          protect, authorize('patient', 'admin'), requestRefund);
router.get('/refund-requests',      protect, authorize('admin'), getRefundRequests);

export default router;
