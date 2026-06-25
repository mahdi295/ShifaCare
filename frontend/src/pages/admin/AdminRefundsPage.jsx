import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import NeumorphicBox from '../../components/ui/NeumorphicBox';
import PageTransition from '../../components/ui/PageTransition';
import { RefreshCw, Loader2, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_UI = {
  refund_requested: { label: 'Requested', color: 'text-amber-600 bg-amber-50 border border-amber-200', icon: Clock },
  refunded:         { label: 'Refunded',  color: 'text-green-600 bg-green-50 border border-green-200', icon: CheckCircle },
};

const AdminRefundsPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/refunds');
      setRefunds(data.data);
    } catch {
      toast.error('Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRefunds(); }, []);

  const handleApprove = async (paymentId) => {
    if (!window.confirm('Approve this refund? This will cancel the appointment and mark payment as refunded.')) return;
    setProcessingId(paymentId);
    try {
      await api.post(`/payments/${paymentId}/refund`, { reason: 'Admin approved refund' });
      toast.success('Refund approved successfully');
      fetchRefunds();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Refund approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const pending = refunds.filter((r) => r.status === 'refund_requested');
  const processed = refunds.filter((r) => r.status === 'refunded');

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">Refund Requests</h3>
            <p className="text-muted text-sm mt-0.5">
              {pending.length} pending · {processed.length} processed
            </p>
          </div>
          <button onClick={fetchRefunds} className="nm-button flex items-center gap-2 text-sm text-muted hover:text-primary px-4 py-2">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={36} /></div>
        ) : refunds.length === 0 ? (
          <NeumorphicBox className="p-16 text-center">
            <CheckCircle className="mx-auto text-green-500 mb-3" size={32} />
            <p className="font-medium">No refund requests</p>
            <p className="text-muted text-sm mt-1">All payments are settled.</p>
          </NeumorphicBox>
        ) : (
          <div className="space-y-6">
            {pending.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-amber-600 flex items-center gap-2">
                  <Clock size={15} /> Pending Approval ({pending.length})
                </h4>
                {pending.map((r) => <RefundCard key={r._id} refund={r} onApprove={handleApprove} processingId={processingId} />)}
              </div>
            )}
            {processed.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted flex items-center gap-2">
                  <CheckCircle size={15} /> Processed ({processed.length})
                </h4>
                {processed.map((r) => <RefundCard key={r._id} refund={r} onApprove={null} processingId={processingId} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

const RefundCard = ({ refund, onApprove, processingId }) => {
  const ui = STATUS_UI[refund.status] || {};
  const Icon = ui.icon || Clock;
  const appt = refund.appointment;
  const doctor = appt?.doctor?.user?.name;

  return (
    <NeumorphicBox className="p-4">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex-1 min-w-[200px] space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm">{refund.patient?.name}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${ui.color}`}>
              <Icon size={11} /> {ui.label}
            </span>
          </div>
          <p className="text-xs text-muted">{refund.patient?.email}</p>
          {doctor && <p className="text-xs text-muted">Dr. {doctor}</p>}
          {appt?.appointmentDate && (
            <p className="text-xs text-muted">
              {new Date(appt.appointmentDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
              {appt.slot && ` · ${appt.slot}`}
            </p>
          )}
          {refund.refundReason && (
            <p className="text-xs text-muted italic">"{refund.refundReason}"</p>
          )}
          {refund.refundRequestedAt && (
            <p className="text-xs text-muted/60">
              Requested: {new Date(refund.refundRequestedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
            </p>
          )}
          {refund.refundedAt && (
            <p className="text-xs text-green-600/70">
              Refunded: {new Date(refund.refundedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <span className="font-bold text-primary text-lg">৳{refund.amount.toLocaleString()}</span>
          {onApprove && refund.status === 'refund_requested' && (
            <button
              onClick={() => onApprove(refund._id)}
              disabled={processingId === refund._id}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-green-600 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              {processingId === refund._id
                ? <Loader2 size={14} className="animate-spin" />
                : <CheckCircle size={14} />}
              Approve Refund
            </button>
          )}
        </div>
      </div>
    </NeumorphicBox>
  );
};

export default AdminRefundsPage;
