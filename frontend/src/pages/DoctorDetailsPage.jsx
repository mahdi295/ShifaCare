import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import NeumorphicBox from '../components/ui/NeumorphicBox';
import {
  Calendar, Clock, Info, Loader2, CheckCircle2, ArrowLeft, User, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import PublicLayout from '../layouts/PublicLayout';

// ─── Slot button sub-component ────────────────────────────────────────────────
const SlotButton = ({ slot, selected, booked, onClick }) => {
  if (booked) {
    return (
      <div className="px-3 py-2 rounded-lg text-xs text-center opacity-40 bg-background rounded-lg border border-border cursor-not-allowed line-through text-muted">
        {slot}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onClick(slot)}
      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
        selected
          ? 'bg-background rounded-lg border border-border text-primary font-bold ring-2 ring-primary/30'
          : 'bg-surface rounded-xl border border-border shadow-card hover:bg-background rounded-lg border border-border text-muted hover:text-text'
      }`}
    >
      {slot}
    </button>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const DoctorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');

  // Slot state
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotData, setSlotData] = useState(null); // full API response
  const [slotMessage, setSlotMessage] = useState('');

  const [bookingLoading, setBookingLoading] = useState(false);

  // ── Fetch doctor profile ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await api.get(`/doctors/${id}`);
        setDoctor(data.data);
      } catch {
        toast.error('Could not load doctor details');
      } finally {
        setPageLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  // ── Fetch real slots whenever date changes ───────────────────────────────
  const fetchSlots = useCallback(async (date) => {
    if (!date || !id) return;

    setSlotData(null);
    setSlotMessage('');
    setSelectedSlot('');
    setSlotsLoading(true);

    try {
      const { data } = await api.get(`/doctors/${id}/slots?date=${date}`);
      setSlotData(data);

      if (data.available.length === 0) {
        setSlotMessage(data.message || `No slots available on ${data.dayName}`);
      }
    } catch (err) {
      toast.error('Could not load available slots');
      setSlotMessage('Failed to load slots. Please try again.');
    } finally {
      setSlotsLoading(false);
    }
  }, [id]);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchSlots(date);
  };

  // ── Book appointment ─────────────────────────────────────────────────────
  const handleBooking = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to book an appointment');
      navigate('/login');
      return;
    }

    if (user?.role !== 'patient') {
      toast.error('Only patients can book appointments');
      return;
    }

    if (!selectedDate || !selectedSlot) {
      toast.error('Please select a date and time slot');
      return;
    }

    if (!symptoms.trim()) {
      toast.error('Please describe your symptoms');
      return;
    }

    setBookingLoading(true);
    try {
      await api.post('/appointments', {
        doctor: id,
        appointmentDate: selectedDate,
        slot: selectedSlot,
        symptoms: symptoms.trim(),
      });
      toast.success('Appointment booked successfully!');
      navigate('/dashboard/appointments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Minimum bookable date = today ────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];

  // ── Loading state ────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <NeumorphicBox className="p-10 text-center">
          <p className="text-muted text-lg">Doctor not found.</p>
          <Link to="/doctors" className="text-primary font-semibold mt-4 block hover:underline">
            ← Back to Doctors
          </Link>
        </NeumorphicBox>
      </div>
    );
  }

  const avatarUrl =
    !doctor.user?.avatar || doctor.user.avatar === 'no-photo.jpg'
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.user?.name || 'D')}&size=300&background=6C63FF&color=fff`
      : doctor.user.avatar;

  return (
    <PublicLayout>
    <div className="bg-background p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link
          to="/doctors"
          className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to All Doctors
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Doctor Info ──────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <NeumorphicBox className="p-6 lg:sticky lg:top-10">
              <div className="w-full aspect-square rounded-xl mb-6 overflow-hidden bg-background rounded-lg border border-border p-1">
                <img
                  src={avatarUrl}
                  className="w-full h-full object-cover rounded-xl"
                  alt={`Dr. ${doctor.user?.name}`}
                />
              </div>

              <h2 className="text-2xl font-bold">Dr. {doctor.user?.name}</h2>
              <p className="text-primary font-semibold text-sm mt-1">{doctor.specialization}</p>
              <p className="text-muted text-xs mt-1">{doctor.department?.name}</p>

              <div className="mt-5 space-y-3 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-primary-secondary shrink-0" />
                  <span>{doctor.degree}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-primary-secondary shrink-0" />
                  <span>{doctor.experience} years experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={15}
                    className={doctor.isAvailable ? 'text-green-500 shrink-0' : 'text-red-400 shrink-0'}
                  />
                  <span className={doctor.isAvailable ? 'text-green-600 font-medium' : 'text-red-400'}>
                    {doctor.isAvailable ? 'Available for Booking' : 'Currently Unavailable'}
                  </span>
                </div>
              </div>

              {/* Working days from schedule */}
              {doctor.schedule?.length > 0 && (
                <div className="mt-5 pt-4 border-t border-border">
                  <p className="text-xs text-muted uppercase tracking-wider mb-3">Working Days</p>
                  <div className="flex flex-wrap gap-1.5">
                    {doctor.schedule.map((s) => (
                      <span
                        key={s.day}
                        className="text-xs px-2 py-0.5 bg-background rounded-lg border border-border rounded-lg text-primary font-medium"
                      >
                        {s.day.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {doctor.about && (
                <p className="mt-5 text-xs text-muted leading-relaxed border-t border-border pt-4">
                  {doctor.about}
                </p>
              )}

              <div className="mt-5 pt-4 border-t border-border">
                <p className="text-xs text-muted uppercase tracking-wider">Consultation Fee</p>
                <p className="text-3xl font-bold text-primary mt-1">৳ {doctor.fees}</p>
              </div>
            </NeumorphicBox>
          </div>

          {/* ── Booking Form ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <NeumorphicBox className="p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="text-primary" />
                Book an Appointment
              </h3>

              {!doctor.isAvailable ? (
                <div className="p-8 bg-background rounded-lg border border-border text-center">
                  <AlertCircle className="mx-auto text-muted mb-3" size={32} />
                  <p className="text-muted">
                    This doctor is currently not accepting new appointments.
                    Please choose another doctor or check back later.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-8">

                  {/* Date picker */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 px-1">
                      Select Appointment Date
                    </label>
                    <input
                      type="date"
                      className="nm-input w-full"
                      min={today}
                      value={selectedDate}
                      onChange={handleDateChange}
                      required
                    />
                  </div>

                  {/* Slot picker — only shows after date is chosen */}
                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-semibold mb-3 px-1">
                        Available Time Slots
                        {slotData && (
                          <span className="ml-2 text-xs text-muted font-normal">
                            ({slotData.availableCount} of {slotData.totalSlots} slots available)
                          </span>
                        )}
                      </label>

                      {/* Loading slots */}
                      {slotsLoading && (
                        <div className="bg-background rounded-lg border border-border p-6 flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin text-primary" size={20} />
                          <span className="text-sm text-muted">Checking available slots...</span>
                        </div>
                      )}

                      {/* No slots / message */}
                      {!slotsLoading && slotMessage && (
                        <div className="bg-background rounded-lg border border-border p-5 flex items-start gap-3">
                          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                          <p className="text-sm text-muted">{slotMessage}</p>
                        </div>
                      )}

                      {/* Slot grid */}
                      {!slotsLoading && slotData && slotData.available.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                          {/* All slots — booked ones shown greyed out */}
                          {[...slotData.available, ...slotData.booked]
                            .sort()
                            .map((slot) => (
                              <SlotButton
                                key={slot}
                                slot={slot}
                                selected={selectedSlot === slot}
                                booked={slotData.booked.includes(slot)}
                                onClick={(s) => setSelectedSlot(s)}
                              />
                            ))}
                        </div>
                      )}

                      {/* Schedule window hint */}
                      {!slotsLoading && slotData?.scheduleWindow && (
                        <p className="text-xs text-muted mt-3 px-1">
                          Schedule: {slotData.scheduleWindow} — every 30 mins
                        </p>
                      )}
                    </div>
                  )}

                  {/* Symptoms */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 px-1">
                      Describe Your Symptoms
                    </label>
                    <textarea
                      className="nm-input w-full min-h-[120px] resize-none"
                      placeholder="Briefly describe your health concern or reason for visit..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      required
                    />
                  </div>

                  {/* Info box */}
                  <div className="bg-background rounded-lg border border-border p-4 flex gap-3 items-start">
                    <Info className="text-primary shrink-0 mt-0.5" size={17} />
                    <p className="text-xs text-muted leading-relaxed">
                      Your appointment is confirmed immediately after booking.
                      Pay online via bKash, Nagad, Rocket, or card — or pay cash at the reception.
                    </p>
                  </div>

                  {/* Login nudge */}
                  {!isAuthenticated && (
                    <div className="bg-background rounded-lg border border-border p-4 text-center">
                      <p className="text-sm text-muted">
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                          Log in
                        </Link>{' '}
                        or{' '}
                        <Link to="/register" className="text-primary font-semibold hover:underline">
                          create an account
                        </Link>{' '}
                        to book this appointment
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingLoading || !isAuthenticated || !selectedSlot}
                    className="nm-button-accent w-full py-4 flex items-center justify-center gap-2 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {bookingLoading ? (
                      <Loader2 className="animate-spin" size={22} />
                    ) : (
                      <>
                        <Calendar size={20} />
                        {selectedSlot ? `Confirm ${selectedSlot} Appointment` : 'Select a Slot to Continue'}
                      </>
                    )}
                  </button>
                </form>
              )}
            </NeumorphicBox>
          </div>

        </div>
      </div>
    </div>
    </PublicLayout>
  );
};

export default DoctorDetailsPage;
