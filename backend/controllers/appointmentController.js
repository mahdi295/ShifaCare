import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Payment from '../models/Payment.js';

// @desc    Book appointment
// @route   POST /api/v1/appointments
// @access  Private/Patient
export const bookAppointment = asyncHandler(async (req, res, next) => {
  const { doctor: doctorId, appointmentDate, slot, symptoms } = req.body;

  if (!doctorId || !appointmentDate || !slot || !symptoms) {
    return next(new ErrorResponse('Please provide doctor, date, slot, and symptoms', 400));
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return next(new ErrorResponse('Doctor not found', 404));
  if (!doctor.isAvailable) return next(new ErrorResponse('This doctor is currently not available for bookings', 400));

  // Prevent booking past dates (UTC-safe)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const bookingDate = new Date(appointmentDate);
  if (isNaN(bookingDate.getTime())) return next(new ErrorResponse('Invalid appointment date', 400));
  bookingDate.setUTCHours(0, 0, 0, 0);
  if (bookingDate < today) return next(new ErrorResponse('Cannot book an appointment for a past date', 400));

  // Prevent duplicate slot booking (same doctor + date + slot, not cancelled)
  const slotTaken = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate: bookingDate,
    slot,
    status: { $ne: 'cancelled' },
  });
  if (slotTaken) return next(new ErrorResponse('This time slot is already booked. Please choose another.', 400));

  // Prevent same patient booking same doctor twice on same day
  const patientDuplicate = await Appointment.findOne({
    patient: req.user.id,
    doctor: doctorId,
    appointmentDate: bookingDate,
    status: { $ne: 'cancelled' },
  });
  if (patientDuplicate) return next(new ErrorResponse('You already have an appointment with this doctor on this day', 400));

  // Serial number
  const count = await Appointment.countDocuments({
    doctor: doctorId,
    appointmentDate: bookingDate,
    status: { $ne: 'cancelled' },
  });

  const appointment = await Appointment.create({
    patient: req.user.id,
    doctor: doctorId,
    appointmentDate: bookingDate,
    slot,
    symptoms,
    fees: doctor.fees,
    serialNumber: count + 1,
  });

  const populated = await Appointment.findById(appointment._id)
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
    .populate('patient', 'name email phone');

  res.status(201).json({ success: true, message: 'Appointment booked successfully', data: populated });
});

// @desc    Get my appointments (role-aware)
// @route   GET /api/v1/appointments/me
// @access  Private
export const getMyAppointments = asyncHandler(async (req, res, next) => {
  let query;

  if (req.user.role === 'patient') {
    query = Appointment.find({ patient: req.user.id });
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.status(200).json({ success: true, count: 0, data: [] });
    query = Appointment.find({ doctor: doctor._id });
  } else if (req.user.role === 'admin') {
    query = Appointment.find();
  } else {
    return next(new ErrorResponse('Not authorized', 403));
  }

  const appointments = await query
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
    .populate('patient', 'name email phone avatar')
    .sort('-appointmentDate');

  // FIX: the Appointment model only tracks paymentStatus as 'paid'/'unpaid'.
  // Refund progress (refund_requested / refunded) lives on the separate
  // Payment document, so the Appointments page had no way to show it —
  // patient would submit a refund and see no visual change at all. Attach
  // the related payment's refund status here so the frontend can show a
  // proper "Refund Requested" / "Refunded" badge and hide the Refund button.
  const appointmentIds = appointments.map((a) => a._id);
  const payments = await Payment.find({
    appointment: { $in: appointmentIds },
    status: { $in: ['refund_requested', 'refunded'] },
  }).select('appointment status refundReason');

  const refundByAppointmentId = {};
  payments.forEach((p) => { refundByAppointmentId[p.appointment.toString()] = p; });

  const appointmentsWithRefundInfo = appointments.map((apt) => {
    const refundPayment = refundByAppointmentId[apt._id.toString()];
    return {
      ...apt.toObject(),
      refundStatus: refundPayment ? refundPayment.status : null,
      refundReason: refundPayment ? refundPayment.refundReason : null,
    };
  });

  res.status(200).json({ success: true, count: appointmentsWithRefundInfo.length, data: appointmentsWithRefundInfo });
});

// @desc    Get single appointment
// @route   GET /api/v1/appointments/:id
// @access  Private
export const getAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
    .populate('patient', 'name email phone avatar');

  if (!appointment) return next(new ErrorResponse('Appointment not found', 404));

  if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to view this appointment', 403));
  }

  res.status(200).json({ success: true, data: appointment });
});

// @desc    Update appointment status
// @route   PUT /api/v1/appointments/:id/status
// @access  Private/Doctor/Admin
export const updateAppointmentStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const allowedStatuses = ['confirmed', 'completed', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    return next(new ErrorResponse(`Status must be one of: ${allowedStatuses.join(', ')}`, 400));
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return next(new ErrorResponse('Appointment not found', 404));

  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
      return next(new ErrorResponse('Not authorized to update this appointment', 403));
    }
  }

  if (status === 'confirmed' && appointment.paymentStatus === 'unpaid' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Cannot confirm appointment until payment is completed', 400));
  }

  appointment.status = status;
  if (req.body.notes) appointment.notes = req.body.notes;
  await appointment.save();

  res.status(200).json({ success: true, message: `Appointment marked as ${status}`, data: appointment });
});

// @desc    Cancel appointment
// @route   PUT /api/v1/appointments/:id/cancel
// @access  Private (patient owns it, or admin)
export const cancelAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return next(new ErrorResponse('Appointment not found', 404));

  const isOwner = appointment.patient.toString() === req.user.id;
  const isStaff = req.user.role === 'admin';

  if (!isOwner && !isStaff) return next(new ErrorResponse('Not authorized to cancel this appointment', 403));
  if (appointment.status === 'completed') return next(new ErrorResponse('Cannot cancel a completed appointment', 400));

  // FIX: block direct cancel of already-paid appointments for patients.
  // Paid appointments must go through the refund flow so the Payment record
  // is updated and the admin can see/approve it. Without this, a patient could
  // cancel a paid appointment directly and the money would be stuck as
  // "successful" with no refund trail.
  if (appointment.paymentStatus === 'paid' && !isStaff) {
    return next(new ErrorResponse('This appointment is already paid. Please request a refund instead of cancelling directly.', 400));
  }

  appointment.status = 'cancelled';
  await appointment.save();

  res.status(200).json({ success: true, message: 'Appointment cancelled', data: appointment });
});

// @desc    Get today's appointments (UTC-safe)
// @route   GET /api/v1/appointments/today
// @access  Private/Doctor/Admin
export const getTodayAppointments = asyncHandler(async (req, res, next) => {
  // UTC-safe today range — avoids server timezone mismatch
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const end   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  let filter = { appointmentDate: { $gte: start, $lte: end } };

  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.status(200).json({ success: true, count: 0, data: [] });
    filter.doctor = doctor._id;
  }

  const appointments = await Appointment.find(filter)
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
    .populate('patient', 'name email phone avatar')
    .sort('slot');

  res.status(200).json({ success: true, count: appointments.length, data: appointments });
});

// @desc    Reschedule appointment
// @route   PUT /api/v1/appointments/:id/reschedule
// @access  Private/Patient (owner) or Admin
export const rescheduleAppointment = asyncHandler(async (req, res, next) => {
  const { appointmentDate, slot } = req.body;

  if (!appointmentDate || !slot) {
    return next(new ErrorResponse('Please provide new date and slot', 400));
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return next(new ErrorResponse('Appointment not found', 404));

  const isOwner = appointment.patient.toString() === req.user.id;
  const isStaff = req.user.role === 'admin';
  if (!isOwner && !isStaff) return next(new ErrorResponse('Not authorized', 403));

  if (appointment.status === 'completed' || appointment.status === 'cancelled') {
    return next(new ErrorResponse('Cannot reschedule a completed or cancelled appointment', 400));
  }

  // Prevent reschedule to past date
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const newDate = new Date(appointmentDate);
  if (isNaN(newDate.getTime())) return next(new ErrorResponse('Invalid date', 400));
  newDate.setUTCHours(0, 0, 0, 0);
  if (newDate < today) return next(new ErrorResponse('Cannot reschedule to a past date', 400));

  // Check new slot is not taken
  const slotTaken = await Appointment.findOne({
    _id: { $ne: appointment._id },
    doctor: appointment.doctor,
    appointmentDate: newDate,
    slot,
    status: { $ne: 'cancelled' },
  });
  if (slotTaken) return next(new ErrorResponse('This time slot is already booked. Choose another.', 400));

  // Recalculate serial
  const count = await Appointment.countDocuments({
    _id: { $ne: appointment._id },
    doctor: appointment.doctor,
    appointmentDate: newDate,
    status: { $ne: 'cancelled' },
  });

  appointment.appointmentDate = newDate;
  appointment.slot = slot;
  appointment.status = 'pending'; // reset to pending after reschedule
  appointment.serialNumber = count + 1;
  appointment.rescheduledAt = new Date();
  await appointment.save();

  const populated = await Appointment.findById(appointment._id)
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
    .populate('patient', 'name email phone');

  res.status(200).json({ success: true, message: 'Appointment rescheduled successfully', data: populated });
});
