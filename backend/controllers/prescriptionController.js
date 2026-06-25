import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

// @desc    Create prescription
// @route   POST /api/v1/prescriptions
// @access  Private/Doctor
export const createPrescription = asyncHandler(async (req, res, next) => {
  const { appointment: appointmentId, diagnosis, medicines, advice, followUpDate } = req.body;

  if (!diagnosis || !appointmentId) {
    return next(new ErrorResponse('Appointment ID and diagnosis are required', 400));
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(new ErrorResponse('Appointment not found', 404));
  }

  // FIX: null-check for doctor profile
  const doctor = await Doctor.findOne({ user: req.user.id });
  if (!doctor) {
    return next(new ErrorResponse('Doctor profile not found for your account. Contact admin.', 404));
  }

  if (appointment.doctor.toString() !== doctor._id.toString()) {
    return next(new ErrorResponse('You are not authorized to prescribe for this appointment', 403));
  }

  // Check if prescription already exists for this appointment
  const existing = await Prescription.findOne({ appointment: appointmentId });
  if (existing) {
    return next(new ErrorResponse('A prescription already exists for this appointment', 400));
  }

  const prescription = await Prescription.create({
    appointment: appointmentId,
    doctor: doctor._id,
    patient: appointment.patient,
    diagnosis,
    medicines: medicines || [],
    advice,
    followUpDate,
  });

  // Mark appointment as completed
  appointment.status = 'completed';
  await appointment.save();

  const populated = await Prescription.findById(prescription._id)
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
    .populate('patient', 'name email phone');

  res.status(201).json({
    success: true,
    message: 'Prescription issued successfully',
    data: populated,
  });
});

// @desc    Get my prescriptions (patient sees theirs, doctor sees ones they wrote)
// @route   GET /api/v1/prescriptions/me
// @access  Private/Patient/Doctor
export const getMyPrescriptions = asyncHandler(async (req, res, next) => {
  let query;

  if (req.user.role === 'patient') {
    query = Prescription.find({ patient: req.user.id });

  } else if (req.user.role === 'doctor') {
    // FIX: null-check
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }
    query = Prescription.find({ doctor: doctor._id });

  } else if (req.user.role === 'admin') {
    query = Prescription.find();

  } else {
    return next(new ErrorResponse('Not authorized', 403));
  }

  const prescriptions = await query
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
    .populate('patient', 'name email')
    .populate('appointment', 'appointmentDate slot')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: prescriptions.length,
    data: prescriptions,
  });
});

// @desc    Get single prescription
// @route   GET /api/v1/prescriptions/:id
// @access  Private
export const getPrescription = asyncHandler(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
    .populate('patient', 'name email phone')
    .populate('appointment', 'appointmentDate slot symptoms');

  if (!prescription) {
    return next(new ErrorResponse('Prescription not found', 404));
  }

  // Patients can only see their own prescriptions
  if (
    req.user.role === 'patient' &&
    prescription.patient._id.toString() !== req.user.id
  ) {
    return next(new ErrorResponse('Not authorized to view this prescription', 403));
  }

  res.status(200).json({ success: true, data: prescription });
});
