import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/axios';
import NeumorphicBox from '../components/ui/NeumorphicBox';
import PageTransition from '../components/ui/PageTransition';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard, CheckCircle, XCircle, Clock,
  Loader2, Calendar, TrendingUp, FileText,
  Printer, X, RefreshCw, RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_UI = {
  successful:       { label: 'Paid',             color: 'text-green-600 bg-green-50',    icon: CheckCircle },
  pending:          { label: 'Pending',           color: 'text-amber-500 bg-amber-50',   icon: Clock       },
  failed:           { label: 'Failed',            color: 'text-red-500 bg-red-50',       icon: XCircle     },
  cancelled:        { label: 'Cancelled',         color: 'text-gray-500 bg-gray-100',    icon: XCircle     },
  refund_requested: { label: 'Refund Requested',  color: 'text-orange-600 bg-orange-50', icon: RotateCcw   },
  refunded:         { label: 'Refunded',          color: 'text-purple-600 bg-purple-50', icon: RotateCcw   },
};

/* ─── Receipt Modal (inline) ─────────────────────────────────────────────── */
const ReceiptModal = ({ payment, onClose }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Receipt – ShifaCare</title>
    <style>
      body{font-family:'Segoe UI',sans-serif;margin:0;padding:32px;color:#1a1a2e}
      .logo{font-size:26px;font-weight:800;color:#1A6BCC;text-align:center}
      .sub{font-size:12px;color:#6B7280;text-align:center;margin-top:4px}
      .divider{border-top:2px solid #1A6BCC;margin:20px 0}
      .badge{display:block;text-align:center;margin:8px auto;background:#D1FAE5;color:#065F46;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;width:fit-content}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      td{padding:9px 0;font-size:13px;border-bottom:1px solid #F3F4F6}
      td:first-child{color:#6B7280;width:45%}
      td:last-child{font-weight:600;text-align:right}
      .total td{font-size:17px;font-weight:800;color:#1A6BCC;border-top:2px solid #1A6BCC;border-bottom:none;padding-top:14px}
      .footer{margin-top:32px;text-align:center;font-size:11px;color:#9CA3AF}
    </style></head><body>${content}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 300);
  };

  const doctorName = payment.appointment?.doctor?.user?.name;
  const receiptNo  = `SCR-${payment._id.toString().slice(-8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <NeumorphicBox className="w-full max-w-lg p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-bold flex items-center gap-2"><FileText size={17} className="text-primary" /> Payment Receipt</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background text-muted"><X size={16} /></button>
        </div>
        <div ref={printRef} className="p-6">
          <div className="logo">ShifaCare</div>
          <div className="sub" style={{ textAlign:'center', fontSize:12, color:'#6B7280' }}>Hospital Management System · Dhaka, Bangladesh</div>
          <div className="badge" style={{ display:'block', textAlign:'center', margin:'8px auto', background:'#D1FAE5', color:'#065F46', padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700, width:'fit-content' }}>✓ PAYMENT CONFIRMED</div>
          <div className="divider" style={{ borderTop:'2px solid #1A6BCC', margin:'20px 0' }} />
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <tbody>
              {[
                ['Receipt No.',    receiptNo],
                ['Patient',        payment.patient?.name || '—'],
                ['Doctor',         doctorName ? `Dr. ${doctorName}` : '—'],
                ['Appointment Date', payment.appointment?.appointmentDate
                  ? new Date(payment.appointment.appointmentDate).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
                  : '—'],
                ['Transaction ID', payment.transactionId],
                ['Payment Method', payment.method || 'Online'],
                ['Payment Date',   payment.paidAt
                  ? new Date(payment.paidAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
                  : new Date(payment.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })],
              ].map(([l, v]) => (
                <tr key={l}>
                  <td style={{ padding:'9px 0', fontSize:13, color:'#6B7280', borderBottom:'1px solid #F3F4F6', width:'45%' }}>{l}</td>
                  <td style={{ padding:'9px 0', fontSize:13, fontWeight:600, textAlign:'right', borderBottom:'1px solid #F3F4F6' }}>{v}</td>
                </tr>
              ))}
              <tr className="total">
                <td style={{ padding:'14px 0 0', fontSize:17, fontWeight:800, color:'#1A6BCC', borderTop:'2px solid #1A6BCC' }}>Amount Paid</td>
                <td style={{ padding:'14px 0 0', fontSize:17, fontWeight:800, color:'#1A6BCC', textAlign:'right', borderTop:'2px solid #1A6BCC' }}>৳{payment.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop:32, textAlign:'center', fontSize:11, color:'#9CA3AF' }}>
            Thank you for choosing ShifaCare.<br />care@shifacare.health · +880 1234-567890
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Printer size={16} /> Print / Save PDF
          </button>
          <button onClick={onClose} className="px-5 py-3 nm-button text-sm text-muted hover:text-primary">Close</button>
        </div>
      </NeumorphicBox>
    </div>
  );
};

/* ─── Main ───────────────────────────────────────────────────────────────── */
const PaymentsPage = () => {
  const { user }  = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [receiptFor, setReceiptFor] = useState(null);
  const [refundingId, setRefundingId] = useState(null);

  const fetchPayments = () => {
    setLoading(true);
    api.get('/payments/me')
      .then((r) => setPayments(r.data.data))
      .catch(() => toast.error('Failed to load payment history'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleRefundRequest = async (paymentId) => {
    const reason = window.prompt('Reason for refund (optional):') ?? '';
    if (reason === null) return; // cancelled
    setRefundingId(paymentId);
    try {
      await api.post(`/payments/${paymentId}/refund`, { reason: reason || 'Patient requested refund' });
      toast.success('Refund request submitted. Admin will review shortly.');
      fetchPayments();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Refund request failed');
    } finally {
      setRefundingId(null);
    }
  };

  const FILTERS = ['all', 'successful', 'pending', 'failed', 'cancelled', 'refund_requested', 'refunded'];

  const displayed = filter === 'all' ? payments : payments.filter((p) => p.status === filter);
  const totalPaid = payments.filter((p) => p.status === 'successful').reduce((s, p) => s + p.amount, 0);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <PageTransition>
      {receiptFor && <ReceiptModal payment={receiptFor} onClose={() => setReceiptFor(null)} />}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">Payment History</h3>
            <p className="text-muted text-sm mt-1">All your transactions in one place</p>
          </div>
          <button onClick={fetchPayments} className="nm-button flex items-center gap-2 text-sm text-muted hover:text-primary px-4 py-2">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Transactions', value: payments.length,                                                              color: 'text-primary'   },
            { label: 'Total Paid',         value: `৳${totalPaid.toLocaleString()}`,                                             color: 'text-green-600' },
            { label: 'Successful',         value: payments.filter((p) => p.status === 'successful').length,                    color: 'text-green-500' },
            { label: 'Pending Refunds',    value: payments.filter((p) => p.status === 'refund_requested').length,               color: 'text-orange-500' },
          ].map(({ label, value, color }) => (
            <NeumorphicBox key={label} className="p-5 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted mt-1">{label}</p>
            </NeumorphicBox>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filter === f
                  ? 'bg-background rounded-lg border border-border text-primary'
                  : 'bg-surface rounded-xl border border-border shadow-card text-muted'
              }`}
            >
              {f === 'refund_requested' ? 'Refund Pending' : f === 'all' ? 'All' : f}
              {f !== 'all' && (
                <span className="ml-1.5 opacity-60">({payments.filter((p) => p.status === f).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {displayed.length === 0 ? (
          <NeumorphicBox className="p-14 text-center">
            <CreditCard className="mx-auto text-muted mb-4" size={36} />
            <p className="font-semibold">No payments found</p>
            <p className="text-muted text-sm mt-2">
              {filter === 'all'
                ? 'Your payment history will appear here after you pay for an appointment.'
                : `No ${filter} payments.`}
            </p>
          </NeumorphicBox>
        ) : (
          <div className="space-y-4">
            {displayed.map((pay) => {
              const ui = STATUS_UI[pay.status] || STATUS_UI.pending;
              const Icon = ui.icon;
              const canRefund = user?.role === 'patient' && pay.status === 'successful';
              const canReceipt = pay.status === 'successful';
              return (
                <NeumorphicBox key={pay._id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left */}
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-background rounded-lg border border-border flex items-center justify-center shrink-0">
                        <CreditCard size={19} className="text-primary" />
                      </div>
                      <div>
                        {user?.role === 'admin'
                          ? <p className="font-bold text-sm">{pay.patient?.name}</p>
                          : <p className="font-bold text-sm">Dr. {pay.appointment?.doctor?.user?.name || 'Doctor'}</p>
                        }
                        <p className="text-xs text-muted mt-0.5">Tx: {pay.transactionId}</p>
                        <div className="flex items-center gap-3 text-xs text-muted mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(pay.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                          </span>
                          {pay.method && <span className="capitalize">{pay.method}</span>}
                        </div>
                        {pay.refundReason && (
                          <p className="text-xs text-orange-500 mt-1 italic">"{pay.refundReason}"</p>
                        )}
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${ui.color}`}>
                        <Icon size={12} /> {ui.label}
                      </span>
                      <p className="text-xl font-bold text-primary">৳{pay.amount.toLocaleString()}</p>
                      {canReceipt && (
                        <button
                          onClick={() => setReceiptFor(pay)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-blue-600 text-xs font-medium border border-blue-200 hover:bg-blue-50 transition-colors"
                        >
                          <FileText size={12} /> Receipt
                        </button>
                      )}
                      {canRefund && (
                        <button
                          onClick={() => handleRefundRequest(pay._id)}
                          disabled={refundingId === pay._id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 text-xs font-medium border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {refundingId === pay._id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                          Refund
                        </button>
                      )}
                    </div>
                  </div>
                </NeumorphicBox>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default PaymentsPage;
