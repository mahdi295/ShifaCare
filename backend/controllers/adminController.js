import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';
import Department from '../models/Department.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get full analytics for admin dashboard
// @route   GET /api/v1/admin/analytics
// @access  Private/Admin
export const getAnalytics = asyncHandler(async (req, res) => {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalDoctors,
    totalPatients,
    totalAppointments,
    todayAppointments,
    pendingAppointments,
    completedAppointments,
    cancelledAppointments,
    totalDepartments,
    paymentsThisMonth,
    recentAppointments,
    recentPayments,
  ] = await Promise.all([
    Doctor.countDocuments(),
    User.countDocuments({ role: 'patient' }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ appointmentDate: { $gte: today, $lte: todayEnd } }),
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.countDocuments({ status: 'completed' }),
    Appointment.countDocuments({ status: 'cancelled' }),
    Department.countDocuments(),

    // Revenue this month (successful payments only)
    Payment.aggregate([
      { $match: { status: 'successful', createdAt: { $gte: firstDayThisMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // Last 5 appointments for activity feed
    Appointment.find()
      .sort('-createdAt')
      .limit(5)
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('patient', 'name'),

    // Last 5 payments
    Payment.find({ status: 'successful' })
      .sort('-createdAt')
      .limit(5)
      .populate('patient', 'name'),
  ]);

  const revenueThisMonth = paymentsThisMonth[0]?.total || 0;

  res.status(200).json({
    success: true,
    data: {
      counts: {
        doctors:      totalDoctors,
        patients:     totalPatients,
        appointments: totalAppointments,
        departments:  totalDepartments,
        today:        todayAppointments,
        pending:      pendingAppointments,
        completed:    completedAppointments,
        cancelled:    cancelledAppointments,
      },
      revenue: { thisMonth: revenueThisMonth },
      recentAppointments,
      recentPayments,
    },
  });
});

// @desc    Get all users (admin)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const users = await User.find(filter).sort('-createdAt');

  res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Toggle user active/inactive
// @route   PUT /api/v1/admin/users/:id/toggle
// @access  Private/Admin
export const toggleUserActive = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));

  // Prevent admin deactivating themselves
  if (user._id.toString() === req.user.id) {
    return next(new ErrorResponse('You cannot deactivate your own account', 400));
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
    data: { isActive: user.isActive },
  });
});

// @desc    Manually confirm payment (admin override)
// @route   PUT /api/v1/admin/payments/:id/confirm
// @access  Private/Admin
export const confirmPayment = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    return next(new ErrorResponse('Payment not found', 404));
  }

  if (payment.status === 'successful') {
    return next(new ErrorResponse('This payment is already confirmed', 400));
  }

  // Update payment status
  payment.status = 'successful';
  payment.method = req.body.method || 'manual';
  payment.paidAt = new Date();
  await payment.save();

  // Update appointment payment status
  await Appointment.findByIdAndUpdate(
    payment.appointment,
    { paymentStatus: 'paid' },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Payment confirmed successfully',
    data: payment,
  });
});

// @desc    Get all pending payments
// @route   GET /api/v1/admin/payments/pending
// @access  Private/Admin
export const getPendingPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ status: 'pending' })
    .populate('patient', 'name email')
    .populate({
      path: 'appointment',
      populate: { path: 'doctor', populate: { path: 'user', select: 'name' } },
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments,
  });
});

// @desc    Get all appointments (admin) with filters
// @route   GET /api/v1/admin/appointments
// @access  Private/Admin
export const getAllAppointments = asyncHandler(async (req, res) => {
  const { status, date, doctorId, search } = req.query;
  const filter = {};

  if (status && status !== 'all') filter.status = status;
  if (doctorId) filter.doctor = doctorId;
  if (date) {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    const dEnd = new Date(date);
    dEnd.setUTCHours(23, 59, 59, 999);
    filter.appointmentDate = { $gte: d, $lte: dEnd };
  }

  let appointments = await Appointment.find(filter)
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
    .populate('patient', 'name email phone avatar')
    .sort('-appointmentDate');

  // Patient name search (post-populate)
  if (search) {
    const q = search.toLowerCase();
    appointments = appointments.filter(
      (a) =>
        a.patient?.name?.toLowerCase().includes(q) ||
        a.doctor?.user?.name?.toLowerCase().includes(q)
    );
  }

  res.status(200).json({ success: true, count: appointments.length, data: appointments });
});

// @desc    Get revenue chart data (monthly breakdown + by doctor)
// @route   GET /api/v1/admin/revenue-chart
// @access  Private/Admin
export const getRevenueChart = asyncHandler(async (req, res) => {
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  // Monthly revenue last 12 months
  const rawMonthlyRevenue = await Payment.aggregate([
    {
      $match: {
        status: 'successful',
        paidAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year:  { $year: '$paidAt' },
          month: { $month: '$paidAt' },
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Fill in missing months with zero
  const monthlyRevenue = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    const found = rawMonthlyRevenue.find(
      (m) => m._id.year === year && m._id.month === month
    );

    monthlyRevenue.push(
      found || { _id: { year, month }, total: 0, count: 0 }
    );
  }

  // Top doctors by revenue (All Time)
  const topDoctors = await Payment.aggregate([
    { $match: { status: 'successful' } },
    {
      $lookup: {
        from: 'appointments',
        localField: 'appointment',
        foreignField: '_id',
        as: 'appt',
      },
    },
    { $unwind: '$appt' },
    {
      $group: {
        _id: '$appt.doctor',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'doctors',
        localField: '_id',
        foreignField: '_id',
        as: 'doctor',
      },
    },
    { $unwind: '$doctor' },
    {
      $lookup: {
        from: 'users',
        localField: 'doctor.user',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        name: '$user.name',
        total: 1,
        count: 1,
      },
    },
  ]);

  // Appointment status breakdown
  const statusBreakdown = await Appointment.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      monthlyRevenue,
      topDoctors,
      statusBreakdown,
    },
  });
});

// @desc    Get refund requests (admin)
// @route   GET /api/v1/admin/refunds
// @access  Private/Admin
export const getAdminRefunds = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ status: { $in: ['refund_requested', 'refunded'] } })
    .populate('patient', 'name email phone')
    .populate({
      path: 'appointment',
      populate: { path: 'doctor', populate: { path: 'user', select: 'name' } },
    })
    .sort('-updatedAt');

  res.status(200).json({ success: true, count: payments.length, data: payments });
});
