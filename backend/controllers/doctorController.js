import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';

// @desc    Get all doctors (with optional department/availability filters)
// @route   GET /api/v1/doctors
// @access  Public
export const getDoctors = asyncHandler(async (req, res, next) => {
  const filter = {};

  if (req.query.department) filter.department = req.query.department;
  if (req.query.available === 'true') filter.isAvailable = true;

  const doctors = await Doctor.find(filter)
    .populate('user', 'name email avatar phone')
    .populate('department', 'name')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
});

// @desc    Get single doctor
// @route   GET /api/v1/doctors/:id
// @access  Public
export const getDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('user', 'name email avatar phone')
    .populate('department', 'name description');

  if (!doctor) {
    return next(new ErrorResponse('Doctor not found', 404));
  }

  res.status(200).json({ success: true, data: doctor });
});

// @desc    Add doctor profile (admin creates a User with role=doctor first, then calls this)
// @route   POST /api/v1/doctors
// @access  Private/Admin
export const addDoctor = asyncHandler(async (req, res, next) => {
  // Validate user exists and has doctor role
  const user = await User.findById(req.body.user);
  if (!user) {
    return next(new ErrorResponse('User not found with that ID', 404));
  }
  if (user.role !== 'doctor') {
    return next(new ErrorResponse('User must have the doctor role to get a doctor profile', 400));
  }

  // Prevent duplicate doctor profile
  const existing = await Doctor.findOne({ user: req.body.user });
  if (existing) {
    return next(new ErrorResponse('This user already has a doctor profile', 400));
  }

  const doctor = await Doctor.create(req.body);

  const populated = await Doctor.findById(doctor._id)
    .populate('user', 'name email avatar phone')
    .populate('department', 'name');

  res.status(201).json({
    success: true,
    message: 'Doctor profile created successfully',
    data: populated,
  });
});

// @desc    Update doctor
// @route   PUT /api/v1/doctors/:id
// @access  Private/Admin/Doctor (own profile only)
export const updateDoctor = asyncHandler(async (req, res, next) => {
  let doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new ErrorResponse('Doctor not found', 404));
  }

  // Doctors can only update their own profile; admin can update any
  if (req.user.role === 'doctor' && doctor.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this profile', 403));
  }

  doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('user', 'name email avatar phone').populate('department', 'name');

  res.status(200).json({
    success: true,
    message: 'Doctor profile updated',
    data: doctor,
  });
});

// @desc    Delete doctor
// @route   DELETE /api/v1/doctors/:id
// @access  Private/Admin
export const deleteDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new ErrorResponse('Doctor not found', 404));
  }

  await doctor.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Doctor profile deleted',
    data: {},
  });
});

// @desc    Toggle doctor availability
// @route   PUT /api/v1/doctors/:id/toggle-availability
// @access  Private/Admin/Doctor
export const toggleAvailability = asyncHandler(async (req, res, next) => {
  let doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new ErrorResponse('Doctor not found', 404));
  }

  if (req.user.role === 'doctor' && doctor.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized', 403));
  }

  doctor.isAvailable = !doctor.isAvailable;
  await doctor.save();

  res.status(200).json({
    success: true,
    message: `Doctor is now ${doctor.isAvailable ? 'available' : 'unavailable'}`,
    data: { isAvailable: doctor.isAvailable },
  });
});

// @desc    Get doctor's own earnings
// @route   GET /api/v1/doctors/earnings
// @access  Private/Doctor
export const getDoctorEarnings = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findOne({ user: req.user.id });
  if (!doctor) return next(new ErrorResponse('Doctor profile not found', 404));

  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayLastMonth  = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // All completed appointments for this doctor
  const completedAppointments = await Appointment.find({
    doctor: doctor._id,
    status: 'completed',
    paymentStatus: 'paid',
  }).sort('-appointmentDate');

  // Payments for this doctor's appointments
  const allPayments = await Payment.find({
    appointment: { $in: completedAppointments.map((a) => a._id) },
    status: 'successful',
  }).populate({ path: 'appointment', populate: { path: 'patient', select: 'name' } })
    .populate('patient', 'name email')
    .sort('-paidAt');

  // Monthly revenue (last 12 months)
  const monthlyRevenue = await Payment.aggregate([
    {
      $match: {
        status: 'successful',
        appointment: { $in: completedAppointments.map((a) => a._id) },
      },
    },
    {
      $group: {
        _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  const totalEarnings = allPayments.reduce((sum, p) => sum + p.amount, 0);
  const thisMonthEarnings = allPayments
    .filter((p) => p.paidAt && p.paidAt >= firstDayThisMonth)
    .reduce((sum, p) => sum + p.amount, 0);
  const lastMonthEarnings = allPayments
    .filter((p) => p.paidAt && p.paidAt >= firstDayLastMonth && p.paidAt <= lastDayLastMonth)
    .reduce((sum, p) => sum + p.amount, 0);

  res.status(200).json({
    success: true,
    data: {
      totalEarnings,
      thisMonthEarnings,
      lastMonthEarnings,
      totalPatients: completedAppointments.length,
      recentPayments: allPayments.slice(0, 10),
      monthlyRevenue,
    },
  });
});