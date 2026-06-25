import React, { useEffect, useState } from 'react';
import api from '../../utils/axios';
import NeumorphicBox from '../../components/ui/NeumorphicBox';
import PageTransition from '../../components/ui/PageTransition';
import PrescriptionForm from '../../components/PrescriptionForm';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, User, Loader2, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLOR = {
  pending:   'text-amber-500 bg-amber-50',
  confirmed: 'text-green-600 bg-green-50',
  completed: 'text-blue-600 bg-blue-50',
  cancelled: 'text-red-500 bg-red-50',
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [todayApts, setTodayApts]   = useState([]);
  const [allApts, setAllApts]       = useState([]);
  const [doctorProfile, setProfile] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [prescribing, setPrescribing] = useState(null);
  const [toggling, setToggling]     = useState(false);

  const fetchData = async () => {
    try {
      const [todayRes, allRes] = await Promise.all([
        api.get('/appointments/today'),
        api.get('/appointments/me'),
      ]);
      setTodayApts(todayRes.data.data);
      setAllApts(allRes.data.data);
    } catch {
      toast.error('Failed to load appointments');
    }
  };

  const fetchProfile = async () => {
    try {
      // Find this doctor's profile from the doctors list
      const res = await api.get('/doctors');
      const mine = res.data.data.find((d) => d.user?._id === user?.id || d.user?.email === user?.email);
      setProfile(mine || null);
    } catch { /* non-fatal */ }
  };

  useEffect(() => {
    Promise.all([fetchData(), fetchProfile()]).finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success(`Marked as ${status}`);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  const handleToggleAvailability = async () => {
    if (!doctorProfile?._id) return;
    setToggling(true);
    try {
      const res = await api.put(`/doctors/${doctorProfile._id}/toggle-availability`);
      setProfile((prev) => ({ ...prev, isAvailable: res.data.data.isAvailable }));
      toast.success(res.data.message);
    } catch {
      toast.error('Toggle failed');
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  if (prescribing) {
    return (
      <PageTransition>
        <div className="space-y-5">
          <button onClick={() => setPrescribing(null)} className="text-sm text-muted hover:text-primary flex items-center gap-1">
            ← Back to Dashboard
          </button>
          <PrescriptionForm appointment={prescribing} onComplete={() => { setPrescribing(null); fetchData(); }} />
        </div>
      </PageTransition>
    );
  }

  const confirmed = todayApts.filter((a) => a.status === 'confirmed');
  const pending   = todayApts.filter((a) => a.status === 'pending');

  return (
    <PageTransition>
      <div className="space-y-8">

        {/* Header + availability toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">Doctor Dashboard</h3>
            <p className="text-muted text-sm mt-1">Today's queue and appointments</p>
          </div>
          {doctorProfile && (
            <button
              onClick={handleToggleAvailability}
              disabled={toggling}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-surface rounded-xl border border-border shadow-card transition-all ${
                doctorProfile.isAvailable ? 'text-green-600' : 'text-red-400'
              }`}
            >
              {doctorProfile.isAvailable
                ? <><ToggleRight size={20} /> Available</>
                : <><ToggleLeft size={20} /> Unavailable</>
              }
            </button>
          )}
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Today's Total",    value: todayApts.length,    color: 'text-primary' },
            { label: 'Confirmed',        value: confirmed.length,    color: 'text-green-600' },
            { label: 'Pending',          value: pending.length,      color: 'text-amber-500' },
            { label: 'Total (All Time)', value: allApts.length,      color: 'text-purple-500' },
          ].map(({ label, value, color }) => (
            <NeumorphicBox key={label} className="p-5 text-center">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted mt-1">{label}</p>
            </NeumorphicBox>
          ))}
        </div>

        {/* Today's queue */}
        <NeumorphicBox className="p-6">
          <h4 className="font-bold mb-5 flex items-center gap-2">
            <Clock size={17} className="text-primary" />
            Today's Patient Queue
          </h4>
          {todayApts.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="mx-auto text-muted mb-3" size={32} />
              <p className="text-muted text-sm">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayApts.map((apt) => (
                <div key={apt._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface rounded-xl border border-border shadow-card flex items-center justify-center text-primary shrink-0">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{apt.patient?.name}</p>
                      <p className="text-xs text-muted">{apt.slot} · Token #{apt.serialNumber}</p>
                      {apt.symptoms && <p className="text-xs text-muted mt-0.5 max-w-xs truncate">{apt.symptoms}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-full ${STATUS_COLOR[apt.status]}`}>
                      {apt.status}
                    </span>
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                        className="text-xs nm-button text-green-600 py-1.5 px-3"
                      >
                        Confirm
                      </button>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => setPrescribing(apt)}
                        className="text-xs nm-button-accent py-1.5 px-3 flex items-center gap-1"
                      >
                        <FileText size={13} /> Prescribe
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </NeumorphicBox>

        {/* Recent past appointments */}
        <NeumorphicBox className="p-6">
          <h4 className="font-bold mb-5 flex items-center gap-2">
            <CheckCircle size={17} className="text-primary" />
            All Appointments
          </h4>
          {allApts.length === 0 ? (
            <p className="text-muted text-sm text-center py-6">No appointments found</p>
          ) : (
            <div className="space-y-2">
              {allApts.slice(0, 10).map((apt) => (
                <div key={apt._id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-semibold">{apt.patient?.name}</p>
                    <p className="text-xs text-muted">
                      {new Date(apt.appointmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {apt.slot}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-full ${STATUS_COLOR[apt.status]}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </NeumorphicBox>

      </div>
    </PageTransition>
  );
};

export default DoctorDashboard;
