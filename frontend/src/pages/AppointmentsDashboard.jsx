import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/axios';
import PageTransition from '../components/ui/PageTransition';
import NeumorphicBox from '../components/ui/NeumorphicBox';
import {
  Calendar, Clock, CheckCircle, XCircle, Loader2, User,
  CreditCard, AlertCircle, RefreshCw, FileText, Printer,
  RotateCcw, X, Video,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import PrescriptionForm from '../components/PrescriptionForm';

const STATUS_STYLES = {
  pending:   'text-orange-600 bg-orange-50 border border-orange-200',
  confirmed: 'text-green-600 bg-green-50 border border-green-200',
  completed: 'text-blue-600 bg-blue-50 border border-blue-200',
  cancelled: 'text-red-500 bg-red-50 border border-red-200',
};

/* ─── Receipt Modal ──────────────────────────────────────────────────────── */
const ReceiptModal = ({ appointment, onClose }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Payment Receipt – ShifaCare</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 32px; color: #1a1a2e; }
        .header { text-align: center; border-bottom: 2px solid #1A6BCC; padding-bottom: 20px; margin-bottom: 24px; }
        .logo { font-size: 28px; font-weight: 800; color: #1A6BCC; }
        .subtitle { font-size: 13px; color: #6B7280; margin-top: 4px; }
        .badge { display: inline-block; background: #D1FAE5; color: #065F46; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        td { padding: 10px 0; font-size: 14px; border-bottom: 1px solid #F3F4F6; }
        td:first-child { color: #6B7280; width: 45%; }
        td:last-child { font-weight: 600; text-align: right; }
        .total-row td { font-size: 18px; font-weight: 800; color: #1A6BCC; border-top: 2px solid #1A6BCC; border-bottom: none; padding-top: 16px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9CA3AF; }
        @media print { body { padding: 16px; } }
      </style></head><body>${content}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 300);
  };

  const apt = appointment;
  const doctor = apt.doctor?.user?.name;
  const dept = apt.doctor?.department?.name || apt.doctor?.specialization || '';
  const receiptNo = `SCR-${apt._id.toString().slice(-8).toUpperCase()}`;
  const paidDate = apt.paidAt
    ? new Date(apt.paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <NeumorphicBox className="w-full max-w-lg p-0 overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-bold flex items-center gap-2"><FileText size={17} className="text-primary" /> Payment Receipt</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background text-muted"><X size={16} /></button>
        </div>

        {/* Receipt content (printed) */}
        <div ref={printRef} className="p-6">
          <div className="header" style={{ textAlign:'center', borderBottom:'2px solid #1A6BCC', paddingBottom:20, marginBottom:24 }}>
            <div className="logo" style={{ fontSize:26, fontWeight:800, color:'#1A6BCC' }}>ShifaCare</div>
            <div className="subtitle" style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>Hospital Management System · Dhaka, Bangladesh</div>
            <div className="badge" style={{ display:'inline-block', background:'#D1FAE5', color:'#065F46', padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700, marginTop:8 }}>
              ✓ PAYMENT CONFIRMED
            </div>
          </div>

          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <tbody>
              {[
                ['Receipt No.',    receiptNo],
                ['Patient Name',   apt.patient?.name || '—'],
                ['Doctor',         doctor ? `Dr. ${doctor}` : '—'],
                ['Specialization', dept || '—'],
                ['Appointment Date', new Date(apt.appointmentDate).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })],
                ['Time Slot',      apt.slot],
                ['Serial No.',     `#${apt.serialNumber}`],
                ['Payment Date',   paidDate],
                ['Transaction ID', apt.transactionId || 'N/A'],
                ['Payment Method', apt.paymentMethod || 'Online (SSLCommerz)'],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ padding:'9px 0', fontSize:13, color:'#6B7280', borderBottom:'1px solid #F3F4F6', width:'45%' }}>{label}</td>
                  <td style={{ padding:'9px 0', fontSize:13, fontWeight:600, textAlign:'right', borderBottom:'1px solid #F3F4F6' }}>{value}</td>
                </tr>
              ))}
              <tr>
                <td style={{ padding:'16px 0 0', fontSize:17, fontWeight:800, color:'#1A6BCC', borderTop:'2px solid #1A6BCC' }}>Amount Paid</td>
                <td style={{ padding:'16px 0 0', fontSize:17, fontWeight:800, color:'#1A6BCC', textAlign:'right', borderTop:'2px solid #1A6BCC' }}>৳{apt.fees?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop:32, textAlign:'center', fontSize:11, color:'#9CA3AF' }}>
            Thank you for choosing ShifaCare. Keep this receipt for your records.<br />
            care@shifacare.health · +880 1234-567890
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Printer size={16} /> Print / Save PDF
          </button>
          <button onClick={onClose} className="px-5 py-3 nm-button text-sm text-muted hover:text-primary">Close</button>
        </div>
      </NeumorphicBox>
    </div>
  );
};

/* ─── Reschedule Modal ───────────────────────────────────────────────────── */
const RescheduleModal = ({ appointment, onClose, onSuccess }) => {
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlot('');
    api.get(`/doctors/${appointment.doctor._id}/slots?date=${selectedDate}`)
      .then((r) => setSlots(r.data.data || []))
      .catch(() => toast.error('Failed to load slots'))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, appointment.doctor._id]);

  const handleReschedule = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Please select a date and slot');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/appointments/${appointment._id}/reschedule`, {
        appointmentDate: selectedDate,
        slot: selectedSlot,
      });
      toast.success('Appointment rescheduled successfully!');
      onSuccess();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Reschedule failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <NeumorphicBox className="w-full max-w-md p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-bold flex items-center gap-2"><RotateCcw size={17} className="text-primary" /> Reschedule Appointment</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background text-muted"><X size={16} /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-3 bg-background rounded-lg border border-border text-sm">
            <p className="font-medium">Dr. {appointment.doctor?.user?.name}</p>
            <p className="text-muted text-xs mt-0.5">
              Current: {new Date(appointment.appointmentDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })} · {appointment.slot}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">New Date</label>
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="nm-input w-full py-2.5"
            />
          </div>

          {selectedDate && (
            <div>
              <label className="block text-sm font-medium mb-2">Available Slots</label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-muted text-sm">
                  <Loader2 size={15} className="animate-spin" /> Loading slots…
                </div>
              ) : slots.length === 0 ? (
                <p className="text-muted text-sm">No slots available for this date.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSlot(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selectedSlot === s
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface border-border text-muted hover:border-primary hover:text-primary'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleReschedule}
            disabled={!selectedDate || !selectedSlot || saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
            Confirm Reschedule
          </button>
          <button onClick={onClose} className="px-5 py-3 nm-button text-sm text-muted hover:text-primary">Cancel</button>
        </div>
      </NeumorphicBox>
    </div>
  );
};

/* ─── Refund Modal ───────────────────────────────────────────────────────── */
const RefundModal = ({ appointment, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleRefund = async () => {
    setSaving(true);
    try {
      // find payment for this appointment — get from payments/me
      const { data: payData } = await api.get('/payments/me');
      const payment = payData.data.find((p) => p.appointment?._id === appointment._id && p.status === 'successful');
      if (!payment) {
        toast.error('No successful payment found for this appointment');
        setSaving(false);
        return;
      }
      await api.post(`/payments/${payment._id}/refund`, { reason: reason || 'Patient requested refund' });
      toast.success('Refund request submitted! Admin will review shortly.');
      onSuccess();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Refund request failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <NeumorphicBox className="w-full max-w-md p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-bold flex items-center gap-2 text-red-500"><XCircle size={17} /> Request Refund</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background text-muted"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            Refunds are reviewed by admin within 1–2 business days. Your appointment will be cancelled upon approval.
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Reason (optional)</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Schedule conflict, doctor unavailable…"
              className="nm-input w-full resize-none text-sm"
            />
          </div>
          <p className="text-sm font-semibold">Amount: <span className="text-primary">৳{appointment.fees}</span></p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleRefund}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
            Submit Refund Request
          </button>
          <button onClick={onClose} className="px-5 py-3 nm-button text-sm text-muted hover:text-primary">Cancel</button>
        </div>
      </NeumorphicBox>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
const AppointmentsDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prescribingFor, setPrescribingFor] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [receiptFor, setReceiptFor] = useState(null);
  const [rescheduleFor, setRescheduleFor] = useState(null);
  const [refundFor, setRefundFor] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success')    toast.success('Payment successful! Your appointment is confirmed.', { duration: 6000 });
    else if (payment === 'failed')    toast.error('Payment failed. Please try again.');
    else if (payment === 'cancelled') toast.info('Payment was cancelled.');
    else if (payment === 'error')     toast.error('Payment error. Please contact support.');
    if (payment) window.history.replaceState({}, '', window.location.pathname);
  }, []);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments/me');
      setAppointments(data.data);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Cancellation failed');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Marked as ${status}`);
      fetchAppointments();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  // Simple, free video consultation room — no signup, no API key needed.
  // Both patient and doctor open the exact same room because it's built
  // from the appointment's own id, so it's always unique per appointment.
  const joinVideoCall = (appointmentId) => {
    const roomName = `ShifaCare-Consult-${appointmentId}`;
    window.open(`https://meet.jit.si/${roomName}`, '_blank', 'noopener,noreferrer');
  };

  const handlePayment = async (appointmentId) => {
    setPayingId(appointmentId);
    try {
      const { data } = await api.post(`/payments/init/${appointmentId}`);
      if (data.url) window.location.href = data.url;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Payment initialization failed');
      setPayingId(null);
    }
  };

  const displayed = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

  if (prescribingFor) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <button onClick={() => setPrescribingFor(null)} className="text-sm text-muted hover:text-primary flex items-center gap-1 font-medium">
            ← Back to Appointments
          </button>
          <PrescriptionForm appointment={prescribingFor} onComplete={() => { setPrescribingFor(null); fetchAppointments(); }} />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      {receiptFor    && <ReceiptModal    appointment={receiptFor}    onClose={() => setReceiptFor(null)} />}
      {rescheduleFor && <RescheduleModal appointment={rescheduleFor} onClose={() => setRescheduleFor(null)} onSuccess={() => { setRescheduleFor(null); fetchAppointments(); }} />}
      {refundFor     && <RefundModal     appointment={refundFor}     onClose={() => setRefundFor(null)}  onSuccess={() => { setRefundFor(null); fetchAppointments(); }} />}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-text">Appointments</h2>
            <p className="text-sm text-muted mt-0.5">{appointments.length} total records</p>
          </div>
          <button onClick={fetchAppointments} className="nm-button flex items-center gap-2 text-sm text-muted hover:text-primary px-4 py-2">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all border ${
                filter === f
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-surface text-muted border-border hover:border-gray-300'
              }`}
            >
              {f}
              {f !== 'all' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({appointments.filter((a) => a.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((n) => (
              <div key={n} className="h-28 bg-surface rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-xl border border-border">
            <Calendar className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-muted font-medium">No appointments found</p>
            {user?.role === 'patient' && (
              <p className="text-sm text-muted mt-2">
                <Link to="/doctors" className="text-primary hover:underline">Book an appointment</Link>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((apt) => (
              <div key={apt._id} className="bg-surface rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                  {/* Left */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-text">
                        {user?.role === 'patient'
                          ? (`Dr. ${apt.doctor?.user?.name}` || 'Doctor')
                          : (apt.patient?.name || 'Patient')}
                      </p>
                      <p className="text-xs text-muted">
                        {user?.role === 'patient'
                          ? apt.doctor?.specialization
                          : apt.patient?.email}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(apt.appointmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1"><Clock size={11} />{apt.slot}</span>
                        <span className="font-medium text-text/70">Token #{apt.serialNumber}</span>
                        {apt.rescheduledAt && (
                          <span className="text-amber-500 flex items-center gap-0.5"><RotateCcw size={10} /> Rescheduled</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right — badges + actions */}
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <span className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-md ${STATUS_STYLES[apt.status] || ''}`}>
                      {apt.status}
                    </span>

                    {apt.paymentStatus === 'paid' ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md text-green-600 bg-green-50 border border-green-200 flex items-center gap-1">
                        <CheckCircle size={11} /> Paid ৳{apt.fees}
                      </span>
                    ) : user?.role !== 'patient' ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md text-orange-600 bg-orange-50 border border-orange-200">
                        Unpaid
                      </span>
                    ) : null}

                    {/* Refund status badge — shows the patient/admin the real
                        state of a refund instead of leaving the card looking
                        unchanged after a refund is requested. */}
                    {apt.refundStatus === 'refund_requested' && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md text-orange-600 bg-orange-50 border border-orange-200 flex items-center gap-1">
                        <RotateCcw size={11} /> Refund Requested
                      </span>
                    )}
                    {apt.refundStatus === 'refunded' && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md text-purple-600 bg-purple-50 border border-purple-200 flex items-center gap-1">
                        <RotateCcw size={11} /> Refunded
                      </span>
                    )}

                    {/* Patient: pay */}
                    {user?.role === 'patient' && apt.status !== 'cancelled' && apt.paymentStatus === 'unpaid' && (
                      <button
                        onClick={() => handlePayment(apt._id)}
                        disabled={payingId === apt._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                      >
                        {payingId === apt._id
                          ? <><Loader2 size={12} className="animate-spin" /> Redirecting…</>
                          : <><CreditCard size={12} /> Pay ৳{apt.fees}</>}
                      </button>
                    )}

                    {/* Patient: reschedule (pending/confirmed only) */}
                    {user?.role === 'patient' && ['pending', 'confirmed'].includes(apt.status) && (
                      <button
                        onClick={() => setRescheduleFor(apt)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-amber-600 text-xs font-medium border border-amber-200 hover:bg-amber-50 transition-colors"
                      >
                        <RotateCcw size={11} /> Reschedule
                      </button>
                    )}

                    {/* Patient: join video call (confirmed appointments only) */}
                    {user?.role === 'patient' && apt.status === 'confirmed' && (
                      <button
                        onClick={() => joinVideoCall(apt._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
                      >
                        <Video size={12} /> Join Video Call
                      </button>
                    )}

                    {/* Patient: cancel (only when NOT paid — paid appts must use Refund flow) */}
                    {user?.role === 'patient' && ['pending', 'confirmed'].includes(apt.status) && apt.paymentStatus !== 'paid' && (
                      <button
                        onClick={() => handleCancel(apt._id)}
                        className="px-3 py-1.5 rounded-lg text-red-500 text-xs font-medium border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}

                    {/* Patient: receipt for paid */}
                    {user?.role === 'patient' && apt.paymentStatus === 'paid' && (
                      <button
                        onClick={() => setReceiptFor(apt)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-blue-600 text-xs font-medium border border-blue-200 hover:bg-blue-50 transition-colors"
                      >
                        <FileText size={11} /> Receipt
                      </button>
                    )}

                    {/* Patient: refund for paid, not completed, not already requested/refunded */}
                    {user?.role === 'patient' && apt.paymentStatus === 'paid' && apt.status !== 'completed' && apt.status !== 'cancelled' && !apt.refundStatus && (
                      <button
                        onClick={() => setRefundFor(apt)}
                        className="px-3 py-1.5 rounded-lg text-red-500 text-xs font-medium border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        Refund
                      </button>
                    )}

                    {/* Doctor: confirm paid */}
                    {user?.role === 'doctor' && apt.status === 'pending' && apt.paymentStatus === 'paid' && (
                      <button
                        onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={12} /> Confirm
                      </button>
                    )}

                    {/* Doctor: prescribe */}
                    {user?.role === 'doctor' && apt.status === 'confirmed' && (
                      <button
                        onClick={() => setPrescribingFor(apt)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Issue Prescription
                      </button>
                    )}

                    {/* Doctor: join video call */}
                    {user?.role === 'doctor' && apt.status === 'confirmed' && (
                      <button
                        onClick={() => joinVideoCall(apt._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
                      >
                        <Video size={12} /> Join Video Call
                      </button>
                    )}

                    {/* Doctor: complete */}
                    {user?.role === 'doctor' && apt.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(apt._id, 'completed')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Complete
                      </button>
                    )}

                    {/* Admin: confirm */}
                    {user?.role === 'admin' && apt.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                        disabled={apt.paymentStatus === 'unpaid'}
                        title={apt.paymentStatus === 'unpaid' ? 'Payment must be received first' : ''}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <CheckCircle size={12} /> Confirm
                      </button>
                    )}

                    {/* Admin: receipt */}
                    {user?.role === 'admin' && apt.paymentStatus === 'paid' && (
                      <button
                        onClick={() => setReceiptFor(apt)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-blue-600 text-xs font-medium border border-blue-200 hover:bg-blue-50 transition-colors"
                      >
                        <FileText size={11} /> Receipt
                      </button>
                    )}
                  </div>
                </div>

                {apt.symptoms && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-muted">
                    <span className="font-semibold text-text/70">Symptoms: </span>{apt.symptoms}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AppointmentsDashboard;
