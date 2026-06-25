import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';
import NeumorphicBox from '../../components/ui/NeumorphicBox';
import PageTransition from '../../components/ui/PageTransition';
import { StaggerContainer, StaggerItem } from '../../components/ui/PageTransition';
import { StatCardSkeleton } from '../../components/ui/SkeletonLoader';
import {
  Users, Stethoscope, Calendar, Building2,
  TrendingUp, Clock, CheckCircle, XCircle,
  Loader2, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const StatCard = ({ icon: Icon, label, value, color = 'text-primary' }) => (
  <NeumorphicBox className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted font-medium">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? '—'}</p>
      </div>
      <div className="w-11 h-11 bg-background rounded-lg border border-border flex items-center justify-center shrink-0">
        <Icon size={20} className={color} />
      </div>
    </div>
  </NeumorphicBox>
);

const STATUS_COLOR = {
  pending:   'text-amber-500 bg-amber-50',
  confirmed: 'text-green-600 bg-green-50',
  completed: 'text-blue-600 bg-blue-50',
  cancelled: 'text-red-500 bg-red-50',
};

const AdminDashboard = () => {
  const [data, setData]                 = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, paymentsRes] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/payments/pending'),
        ]);
        setData(analyticsRes.data.data);
        setPendingPayments(paymentsRes.data.data || []);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleConfirmPayment = async (paymentId) => {
    if (!window.confirm('Confirm this payment?')) return;
    try {
      setConfirmingId(paymentId);
      await api.put(`/admin/payments/${paymentId}/confirm`, { method: 'manual-confirmation' });
      toast.success('Payment confirmed successfully');
      setPendingPayments(prev => prev.filter(p => p._id !== paymentId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  if (!data)   return <NeumorphicBox className="p-10 text-center"><AlertCircle className="mx-auto text-muted mb-3" size={32} /><p className="text-muted">Could not load data.</p></NeumorphicBox>;

  const { counts, revenue, recentAppointments, recentPayments } = data;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold">Admin Dashboard</h3>
          <p className="text-muted text-sm mt-1">Full system overview</p>
        </div>

        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Stethoscope, label: 'Doctors',      value: counts.doctors,     color: 'text-primary' },
            { icon: Users,       label: 'Patients',     value: counts.patients,     color: 'text-primary-secondary' },
            { icon: Calendar,    label: 'Appointments', value: counts.appointments, color: 'text-purple-500' },
            { icon: Building2,   label: 'Departments',  value: counts.departments,  color: 'text-amber-500' },
          ].map((s) => (
            <StaggerItem key={s.label}>
              <StatCard icon={s.icon} label={s.label} value={s.value} color={s.color} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={TrendingUp}  label="Revenue / Month" value={`৳${revenue.thisMonth.toLocaleString()}`} color="text-green-600" />
          <StatCard icon={Clock}       label="Today"           value={counts.today}     color="text-blue-500" />
          <StatCard icon={CheckCircle} label="Completed"       value={counts.completed} color="text-green-500" />
          <StatCard icon={XCircle}     label="Cancelled"       value={counts.cancelled} color="text-red-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeumorphicBox className="p-6">
            <h4 className="font-bold mb-5 flex items-center gap-2"><Calendar size={17} className="text-primary" />Recent Appointments</h4>
            {recentAppointments.length === 0
              ? <p className="text-muted text-sm text-center py-6">No appointments yet</p>
              : <div className="space-y-3">
                  {recentAppointments.map((apt) => (
                    <div key={apt._id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                      <div>
                        <p className="text-sm font-semibold">{apt.patient?.name}</p>
                        <p className="text-xs text-muted">Dr. {apt.doctor?.user?.name} · {new Date(apt.appointmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} {apt.slot}</p>
                      </div>
                      <span className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-full ${STATUS_COLOR[apt.status]}`}>{apt.status}</span>
                    </div>
                  ))}
                </div>
            }
          </NeumorphicBox>

          <NeumorphicBox className="p-6">
            <h4 className="font-bold mb-5 flex items-center gap-2"><TrendingUp size={17} className="text-primary" />Recent Payments</h4>
            {recentPayments.length === 0
              ? <p className="text-muted text-sm text-center py-6">No payments yet</p>
              : <div className="space-y-3">
                  {recentPayments.map((pay) => (
                    <div key={pay._id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                      <div>
                        <p className="text-sm font-semibold">{pay.patient?.name}</p>
                        <p className="text-xs text-muted">{new Date(pay.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <span className="font-bold text-primary text-sm">৳{pay.amount}</span>
                    </div>
                  ))}
                </div>
            }
          </NeumorphicBox>
        </div>

        {pendingPayments.length > 0 && (
          <NeumorphicBox className="p-6 border-l-4 border-amber-500">
            <h4 className="font-bold mb-5 flex items-center gap-2 text-amber-600">
              <AlertCircle size={17} />
              Pending Payments ({pendingPayments.length})
            </h4>
            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <div key={payment._id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{payment.patient?.name}</p>
                    <p className="text-xs text-muted">
                      Txn: {payment.transactionId} · ৳{payment.amount}
                    </p>
                  </div>
                  <button
                    onClick={() => handleConfirmPayment(payment._id)}
                    disabled={confirmingId === payment._id}
                    className="px-3 py-1 nm-button text-xs font-semibold text-primary hover:text-primary disabled:opacity-50"
                  >
                    {confirmingId === payment._id ? <Loader2 size={14} className="animate-spin inline" /> : 'Confirm'}
                  </button>
                </div>
              ))}
            </div>
          </NeumorphicBox>
        )}

        <NeumorphicBox className="p-6">
          <h4 className="font-bold mb-4">Quick Actions</h4>
          <div className="flex flex-wrap gap-3">
            {[
              ['Manage Doctors',     '/dashboard/doctors'],
              ['Manage Departments', '/dashboard/departments'],
              ['View All Users',     '/dashboard/users'],
              ['All Appointments',   '/dashboard/appointments'],
            ].map(([label, path]) => (
              <Link key={path} to={path} className="nm-button text-sm text-muted hover:text-primary">{label}</Link>
            ))}
          </div>
        </NeumorphicBox>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
