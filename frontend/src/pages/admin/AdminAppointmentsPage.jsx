import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/axios';
import NeumorphicBox from '../../components/ui/NeumorphicBox';
import PageTransition from '../../components/ui/PageTransition';
import {
  Calendar, Search, Filter, Loader2, AlertCircle, User,
  Stethoscope, Clock, CheckCircle, XCircle, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_STYLES = {
  pending:   'text-amber-600 bg-amber-50 border border-amber-200',
  confirmed: 'text-green-600 bg-green-50 border border-green-200',
  completed: 'text-blue-600 bg-blue-50 border border-blue-200',
  cancelled: 'text-red-500 bg-red-50 border border-red-200',
};

const PAY_STYLES = {
  paid:   'text-green-600 bg-green-50',
  unpaid: 'text-amber-600 bg-amber-50',
};

const STATUSES = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (dateFilter) params.set('date', dateFilter);
      if (search) params.set('search', search);
      const { data } = await api.get(`/admin/appointments?${params}`);
      setAppointments(data.data);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter, search]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Mark appointment as "${status}"?`)) return;
    setUpdatingId(id);
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setUpdatingId(id);
    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Cancel failed');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">All Appointments</h3>
            <p className="text-muted text-sm mt-0.5">
              {loading ? '…' : `${appointments.length} appointment${appointments.length !== 1 ? 's' : ''}`} found
            </p>
          </div>
          <button
            onClick={fetchAppointments}
            className="nm-button flex items-center gap-2 text-sm text-muted hover:text-primary px-4 py-2"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <NeumorphicBox className="p-4">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
              <input
                type="text"
                placeholder="Search patient or doctor…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="nm-input w-full pl-9 py-2 text-sm"
              />
            </div>

            {/* Date filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="nm-input py-2 text-sm"
            />

            {/* Status tabs */}
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    statusFilter === s
                      ? 'bg-primary text-white shadow'
                      : 'bg-surface border border-border text-muted hover:text-primary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {(search || dateFilter || statusFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setDateFilter(''); setStatusFilter('all'); }}
                className="text-xs text-red-500 hover:text-red-700 px-2"
              >
                Clear
              </button>
            )}
          </div>
        </NeumorphicBox>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={36} />
          </div>
        ) : appointments.length === 0 ? (
          <NeumorphicBox className="p-16 text-center">
            <AlertCircle className="mx-auto text-muted mb-3" size={32} />
            <p className="text-muted font-medium">No appointments found</p>
            <p className="text-muted text-sm mt-1">Try adjusting your filters</p>
          </NeumorphicBox>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <NeumorphicBox key={apt._id} className="p-4">
                <div className="flex flex-wrap items-start gap-4">
                  {/* Patient */}
                  <div className="flex items-center gap-3 min-w-[160px]">
                    <img
                      src={
                        !apt.patient?.avatar || apt.patient.avatar === 'no-photo.jpg'
                          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.patient?.name || 'P')}&background=1A6BCC&color=fff&size=48`
                          : apt.patient.avatar
                      }
                      alt={apt.patient?.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold">{apt.patient?.name}</p>
                      <p className="text-xs text-muted">{apt.patient?.email}</p>
                    </div>
                  </div>

                  {/* Doctor */}
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <Stethoscope size={15} className="text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Dr. {apt.doctor?.user?.name}</p>
                      <p className="text-xs text-muted">{apt.slot}</p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <Calendar size={15} className="text-muted shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(apt.appointmentDate).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-muted">Serial #{apt.serialNumber}</p>
                    </div>
                  </div>

                  {/* Fees + status */}
                  <div className="flex items-center gap-2 ml-auto flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PAY_STYLES[apt.paymentStatus] || ''}`}>
                      {apt.paymentStatus === 'paid' ? `৳${apt.fees} Paid` : `৳${apt.fees} Unpaid`}
                    </span>
                    <span className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-full ${STATUS_STYLES[apt.status]}`}>
                      {apt.status}
                    </span>
                  </div>

                  {/* Actions */}
                  {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                    <div className="flex gap-2 flex-wrap ml-auto">
                      {apt.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                          disabled={updatingId === apt._id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-600 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={13} /> Confirm
                        </button>
                      )}
                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(apt._id, 'completed')}
                          disabled={updatingId === apt._id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={13} /> Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleCancel(apt._id)}
                        disabled={updatingId === apt._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {updatingId === apt._id ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {apt.symptoms && (
                  <p className="text-xs text-muted mt-3 pl-0 border-t border-border pt-2">
                    <span className="font-medium">Symptoms:</span> {apt.symptoms}
                  </p>
                )}
              </NeumorphicBox>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AdminAppointmentsPage;
