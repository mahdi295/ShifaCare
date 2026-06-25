import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { generateSlots, getDayName } from '../utils/slotGenerator.js';

// @desc    Get available slots for a doctor on a specific date
// @route   GET /api/v1/doctors/:id/slots?date=YYYY-MM-DD
// @access  Public
export const getAvailableSlots = asyncHandler(async (req, res, next) => {
  const { date } = req.query;

  // ── Validate date param ────────────────────────────────────────────────────
  if (!date) {
    return next(new ErrorResponse('Please provide a date as ?date=YYYY-MM-DD', 400));
  }

  const requestedDate = new Date(date);
  if (isNaN(requestedDate.getTime())) {
    return next(new ErrorResponse('Invalid date format. Use YYYY-MM-DD', 400));
  }

  // Prevent fetching slots for past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (requestedDate < today) {
    return res.status(200).json({
      success: true,
      date,
      dayName: getDayName(requestedDate),
      available: [],
      booked: [],
      message: 'Cannot book appointments for past dates',
    });
  }

  // ── Fetch doctor with schedule ─────────────────────────────────────────────
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return next(new ErrorResponse('Doctor not found', 404));
  }

  if (!doctor.isAvailable) {
    return res.status(200).json({
      success: true,
      date,
      available: [],
      booked: [],
      message: 'This doctor is currently not available for bookings',
    });
  }

  // ── Find doctor's schedule entry for that day of the week ─────────────────
  const dayName = getDayName(requestedDate);
  const scheduleEntry = doctor.schedule.find((s) => s.day === dayName);

  if (!scheduleEntry) {
    return res.status(200).json({
      success: true,
      date,
      dayName,
      available: [],
      booked: [],
      message: `Dr. ${req.params.id} does not work on ${dayName}s`,
    });
  }

  // ── Generate all possible slots for that day ───────────────────────────────
  const allSlots = generateSlots(scheduleEntry.startTime, scheduleEntry.endTime, 30);

  if (allSlots.length === 0) {
    return res.status(200).json({
      success: true,
      date,
      dayName,
      available: [],
      booked: [],
      message: 'No slots could be generated for this schedule entry',
    });
  }

  // ── Fetch already booked slots for that doctor on that date ───────────────
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookedAppointments = await Appointment.find({
    doctor: req.params.id,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: 'cancelled' }, // cancelled slots become available again
  }).select('slot');

  const bookedSlots = bookedAppointments.map((a) => a.slot);

  // ── Subtract booked from all → available ──────────────────────────────────
  const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

  res.status(200).json({
    success: true,
    date,
    dayName,
    scheduleWindow: `${scheduleEntry.startTime} – ${scheduleEntry.endTime}`,
    totalSlots: allSlots.length,
    bookedCount: bookedSlots.length,
    availableCount: availableSlots.length,
    available: availableSlots,
    booked: bookedSlots,   // sent so frontend can show "slot taken" UI if needed
  });
});
