import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';
import axios from 'axios';

const isLive = () => process.env.SSL_IS_LIVE === 'true';

const SSL_BASE = () =>
  isLive()
    ? 'https://securepay.sslcommerz.com'
    : 'https://sandbox.sslcommerz.com';

const clientRedirect = (res, path) => {
  const base = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  return res.redirect(`${base}${path}`);
};

// @desc    Initialize Payment session with SSLCommerz
// @route   POST /api/v1/payments/init/:appointmentId
// @access  Private/Patient
export const initPayment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.appointmentId)
    .populate('patient', 'name email phone');

  if (!appointment) return next(new ErrorResponse('Appointment not found', 404));

  if (appointment.patient._id.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to pay for this appointment', 403));
  }

  if (appointment.paymentStatus === 'paid') {
    return next(new ErrorResponse('This appointment is already paid', 400));
  }

  // FIX: Guard against duplicate pending payments for same appointment
  // Cancel any old pending/failed payments for this appointment before creating a new one
  await Payment.updateMany(
    { appointment: appointment._id, status: { $in: ['pending', 'failed', 'cancelled'] } },
    { status: 'cancelled' }
  );

  const tran_id = `PS-${Date.now()}-${req.user.id.toString().slice(-4)}`;
  const backendUrl = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');

  const data = {
    store_id:         process.env.SSL_STORE_ID,
    store_passwd:     process.env.SSL_STORE_PASS,
    total_amount:     appointment.fees,
    currency:         'BDT',
    tran_id,
    success_url:      `${backendUrl}/api/v1/payments/success/${tran_id}`,
    fail_url:         `${backendUrl}/api/v1/payments/fail/${tran_id}`,
    cancel_url:       `${backendUrl}/api/v1/payments/cancel/${tran_id}`,
    ipn_url:          `${backendUrl}/api/v1/payments/ipn`,
    cus_name:         appointment.patient.name,
    cus_email:        appointment.patient.email,
    cus_add1:         'Dhaka',
    cus_city:         'Dhaka',
    cus_postcode:     '1000',
    cus_country:      'Bangladesh',
    cus_phone:        appointment.patient.phone || '01700000000',
    ship_name:        appointment.patient.name,
    ship_add1:        'Dhaka',
    ship_city:        'Dhaka',
    ship_postcode:    '1000',
    ship_country:     'Bangladesh',
    product_name:     'Doctor Consultation Fee',
    product_category: 'Healthcare',
    product_profile:  'general',
    num_of_item:      1,
  };

  // Create pending payment record
  await Payment.create({
    appointment: appointment._id,
    patient:     req.user.id,
    amount:      appointment.fees,
    transactionId: tran_id,
    status:      'pending',
  });

  let sslRes;
  try {
    sslRes = await axios.post(
      `${SSL_BASE()}/gwprocess/v4/api.php`,
      new URLSearchParams(data).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
  } catch (err) {
    await Payment.findOneAndDelete({ transactionId: tran_id });
    console.error('SSLCommerz HTTP Error:', err.response?.data || err.message);
    return next(new ErrorResponse('Could not reach payment gateway. Try again.', 502));
  }

  if (sslRes.data?.status === 'SUCCESS') {
    return res.status(200).json({ success: true, url: sslRes.data.GatewayPageURL });
  } else {
    await Payment.findOneAndDelete({ transactionId: tran_id });
    const errorMsg = sslRes.data?.failedreason || 'Payment gateway initialization failed. Try again.';
    console.error('SSLCommerz init failed:', errorMsg);
    return next(new ErrorResponse(errorMsg, 400));
  }
});

// @desc    Payment Success Callback
// @route   POST /api/v1/payments/success/:tran_id
// @access  Public
export const paymentSuccess = asyncHandler(async (req, res, next) => {
  const { tran_id } = req.params;

  const payment = await Payment.findOne({ transactionId: tran_id });
  if (!payment) {
    console.error(`[Payment Success] No payment record found for tran_id: ${tran_id}`);
    return clientRedirect(res, '/dashboard/appointments?payment=error');
  }

  // Idempotent: already processed
  if (payment.status === 'successful') {
    return clientRedirect(res, '/dashboard/appointments?payment=success');
  }

  const val_id = req.body?.val_id;
  if (!val_id) {
    console.error(`[Payment Success] No val_id for tran_id: ${tran_id}`);
    return clientRedirect(res, '/dashboard/appointments?payment=error');
  }

  let validationRes;
  try {
    validationRes = await axios.get(
      `${SSL_BASE()}/validator/api/validationserverAPI.php`,
      {
        params: {
          val_id,
          store_id:   process.env.SSL_STORE_ID,
          store_passwd: process.env.SSL_STORE_PASS,
          format:     'json',
        },
      }
    );
  } catch (err) {
    console.error('SSLCommerz validation error:', err.message);
    return clientRedirect(res, '/dashboard/appointments?payment=error');
  }

  const validationStatus = validationRes.data?.status;
  if (validationStatus !== 'VALID' && validationStatus !== 'VALIDATED') {
    console.error('SSLCommerz invalid validation status:', validationStatus);
    return clientRedirect(res, '/dashboard/appointments?payment=error');
  }

  payment.status = 'successful';
  payment.method = req.body?.card_type || 'online';
  payment.paidAt = Date.now();
  await payment.save();

  await Appointment.findByIdAndUpdate(payment.appointment, { paymentStatus: 'paid' });

  console.log(`[Payment Success] ${tran_id} completed.`);
  return clientRedirect(res, '/dashboard/appointments?payment=success');
});

// @desc    Payment Fail Callback
// @route   POST /api/v1/payments/fail/:tran_id
// @access  Public
export const paymentFail = asyncHandler(async (req, res) => {
  const { tran_id } = req.params;
  await Payment.findOneAndUpdate({ transactionId: tran_id }, { status: 'failed' });
  return clientRedirect(res, '/dashboard/appointments?payment=failed');
});

// @desc    Payment Cancel Callback
// @route   POST /api/v1/payments/cancel/:tran_id
// @access  Public
export const paymentCancel = asyncHandler(async (req, res) => {
  const { tran_id } = req.params;
  await Payment.findOneAndUpdate({ transactionId: tran_id }, { status: 'cancelled' });
  return clientRedirect(res, '/dashboard/appointments?payment=cancelled');
});

// @desc    SSLCommerz IPN Callback
// @route   POST /api/v1/payments/ipn
// @access  Public
export const paymentIPN = asyncHandler(async (req, res) => {
  const { tran_id, status, val_id } = req.body;
  console.log('SSLCommerz IPN received:', req.body);

  if (!tran_id || !status) return res.status(200).json({ success: true });

  const payment = await Payment.findOne({ transactionId: tran_id });
  if (!payment || payment.status === 'successful') return res.status(200).json({ success: true });

  // FIX: don't trust the raw IPN body status blindly — anyone can POST to this
  // public endpoint with a fake tran_id + status=VALID. Re-validate val_id against
  // SSLCommerz's own validator API (same check paymentSuccess does) before marking paid.
  if (status === 'VALID' || status === 'VALIDATED') {
    if (!val_id) {
      console.error(`[IPN] Missing val_id for tran_id: ${tran_id}, ignoring.`);
      return res.status(200).json({ success: true });
    }

    let validationRes;
    try {
      validationRes = await axios.get(
        `${SSL_BASE()}/validator/api/validationserverAPI.php`,
        {
          params: {
            val_id,
            store_id:   process.env.SSL_STORE_ID,
            store_passwd: process.env.SSL_STORE_PASS,
            format:     'json',
          },
        }
      );
    } catch (err) {
      console.error('[IPN] SSLCommerz validation request failed:', err.message);
      return res.status(200).json({ success: true });
    }

    const validationStatus = validationRes.data?.status;
    if (validationStatus !== 'VALID' && validationStatus !== 'VALIDATED') {
      console.error(`[IPN] Validator rejected tran_id ${tran_id}, status: ${validationStatus}`);
      return res.status(200).json({ success: true });
    }

    // Also confirm the validated amount/currency matches what we expect
    const expectedAmount = Number(payment.amount);
    const validatedAmount = Number(validationRes.data?.amount);
    if (!Number.isNaN(validatedAmount) && Math.abs(validatedAmount - expectedAmount) > 0.01) {
      console.error(`[IPN] Amount mismatch for tran_id ${tran_id}: expected ${expectedAmount}, got ${validatedAmount}`);
      return res.status(200).json({ success: true });
    }

    payment.status = 'successful';
    payment.method = req.body?.card_type || 'online';
    payment.paidAt = Date.now();
    await payment.save();
    await Appointment.findByIdAndUpdate(payment.appointment, { paymentStatus: 'paid' });
    console.log(`[IPN] ${tran_id} confirmed and marked successful.`);
  } else if (status === 'FAILED') {
    await Payment.findOneAndUpdate({ transactionId: tran_id }, { status: 'failed' });
  }

  return res.status(200).json({ success: true });
});

// @desc    Get payment history
// @route   GET /api/v1/payments/me
// @access  Private/Patient/Admin
export const getMyPayments = asyncHandler(async (req, res, next) => {
  let query;

  if (req.user.role === 'patient') {
    query = Payment.find({ patient: req.user.id });
  } else if (req.user.role === 'admin') {
    query = Payment.find();
  } else {
    return next(new ErrorResponse('Not authorized', 403));
  }

  const payments = await query
    .populate({
      path: 'appointment',
      populate: { path: 'doctor', populate: { path: 'user', select: 'name' } },
    })
    .populate('patient', 'name email')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: payments.length, data: payments });
});

// @desc    Request refund (patient) / Process refund (admin)
// @route   POST /api/v1/payments/:id/refund
// @access  Private
export const requestRefund = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id).populate('appointment');

  if (!payment) return next(new ErrorResponse('Payment not found', 404));

  // Only successful payments can be refunded
  if (payment.status !== 'successful') {
    return next(new ErrorResponse('Only successful payments can be refunded', 400));
  }

  // Check appointment is not completed
  const appointment = await Appointment.findById(payment.appointment);
  if (appointment && appointment.status === 'completed') {
    return next(new ErrorResponse('Cannot refund payment for a completed appointment', 400));
  }

  if (req.user.role === 'patient') {
    // Patient can only request refund for their own payment
    if (payment.patient.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 403));
    }
    // Mark as refund_requested
    payment.status = 'refund_requested';
    payment.refundReason = req.body.reason || 'Patient requested refund';
    payment.refundRequestedAt = new Date();
    await payment.save();
    return res.status(200).json({ success: true, message: 'Refund request submitted. Admin will review shortly.', data: payment });
  }

  if (req.user.role === 'admin') {
    // Admin approves refund
    payment.status = 'refunded';
    payment.refundReason = req.body.reason || payment.refundReason || 'Admin approved refund';
    payment.refundedAt = new Date();
    await payment.save();

    // Cancel the appointment
    if (appointment) {
      appointment.status = 'cancelled';
      appointment.paymentStatus = 'unpaid';
      await appointment.save();
    }

    return res.status(200).json({ success: true, message: 'Refund processed successfully', data: payment });
  }

  return next(new ErrorResponse('Not authorized', 403));
});

// @desc    Get refund requests (admin)
// @route   GET /api/v1/payments/refund-requests
// @access  Private/Admin
export const getRefundRequests = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ status: 'refund_requested' })
    .populate('patient', 'name email phone')
    .populate({
      path: 'appointment',
      populate: { path: 'doctor', populate: { path: 'user', select: 'name' } },
    })
    .sort('-refundRequestedAt');

  res.status(200).json({ success: true, count: payments.length, data: payments });
});
