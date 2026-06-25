import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';
import NeumorphicBox from '../../components/ui/NeumorphicBox';
import PageTransition from '../../components/ui/PageTransition';
import { useAuth } from '../../context/AuthContext';
import { Calendar, FileText, CreditCard, Clock, Stethoscope, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLOR = {
  pending:   'text-amber-500 bg-amber-50',
  confirmed: 'text-green-600 bg-green-50',
  completed: 'text-blue-600 bg-blue-50',
  cancelled: 'text-red-500 bg-red-50',
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const [apts,  setApts]  = useState([]);
  const [rxs,   setRxs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments/me'),
      api.get('/prescriptions/me'),
    ])
      .then(([aptsRes, rxRes]) => {
        setApts(aptsRes.data.data);
        setRxs(rxRes.data.data);
      })
      .catch(() => toast.error('Failed to load your data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  const upcoming   = apts.filter((a) => a.status === 'pending' || a.status === 'confirmed');
  const completed  = apts.filter((a) => a.status === 'completed');
  const nextApt    = upcoming[0];

  return (
    <PageTransition>
      <div className="space-y-8">

        {/* Greeting */}
        <div>
          <h3 className="text-2xl font-bold">Hello, {user?.name?.split(' ')[0]} 👋</h3>
          <p className="text-muted text-sm mt-1">Here's your health summary</p>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Upcoming',    value: upcoming.length,   icon: Clock,      color: 'text-primary' },
            { label: 'Completed',   value: completed.length,  icon: Calendar,   color: 'text-green-600' },
            { label: 'Prescriptions', value: rxs.length,      icon: FileText,   color: 'text-purple-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <NeumorphicBox key={label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted text-xs font-medium">{label}</p>
                  <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
                <div className="w-10 h-10 bg-background rounded-lg border border-border flex items-center justify-center">
                  <Icon size={18} className={color} />
                </div>
              </div>
            </NeumorphicBox>
          ))}
        </div>

        {/* Next appointment card */}
        {nextApt ? (
          <NeumorphicBox className="p-6">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Clock size={17} className="text-primary" /> Next Appointment
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background rounded-lg border border-border p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface rounded-xl border border-border shadow-card flex items-center justify-center text-primary shrink-0">
                  <Stethoscope size={22} />
                </div>
                <div>
                  <p className="font-bold">Dr. {nextApt.doctor?.user?.name}</p>
                  <p className="text-xs text-muted">{nextApt.doctor?.specialization}</p>
                  <p className="text-xs text-muted mt-1">
                    {new Date(nextApt.appointmentDate).toLocaleDateString('en-GB', {
                      weekday: 'long', day: 'numeric', month: 'long',
                    })} · {nextApt.slot}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold capitalize px-3 py-1 rounded-full ${STATUS_COLOR[nextApt.status]}`}>
                  {nextApt.status}
                </span>
                <span className="text-sm font-bold text-primary">৳{nextApt.fees}</span>
              </div>
            </div>
          </NeumorphicBox>
        ) : (
          <NeumorphicBox className="p-8 text-center">
            <Calendar className="mx-auto text-muted mb-3" size={36} />
            <p className="font-semibold">No upcoming appointments</p>
            <p className="text-muted text-sm mt-1">Book a consultation with one of our doctors</p>
            <Link to="/doctors" className="nm-button-accent inline-block mt-5 text-sm py-2.5 px-6">
              Find a Doctor
            </Link>
          </NeumorphicBox>
        )}

        {/* Recent appointments list */}
        {apts.length > 0 && (
          <NeumorphicBox className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-bold flex items-center gap-2">
                <Calendar size={17} className="text-primary" /> Recent Appointments
              </h4>
              <Link to="/dashboard/appointments" className="text-xs text-primary flex items-center gap-1 hover:underline">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {apts.slice(0, 5).map((apt) => (
                <div key={apt._id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-semibold">Dr. {apt.doctor?.user?.name}</p>
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
          </NeumorphicBox>
        )}

        {/* Recent prescriptions */}
        {rxs.length > 0 && (
          <NeumorphicBox className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-bold flex items-center gap-2">
                <FileText size={17} className="text-primary" /> Recent Prescriptions
              </h4>
              <Link to="/dashboard/prescriptions" className="text-xs text-primary flex items-center gap-1 hover:underline">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {rxs.slice(0, 3).map((rx) => (
                <div key={rx._id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-semibold">Dr. {rx.doctor?.user?.name}</p>
                    <p className="text-xs text-muted">{rx.diagnosis}</p>
                    <p className="text-xs text-muted">{new Date(rx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className="text-xs bg-background rounded-lg border border-border px-3 py-1 text-muted">
                    {rx.medicines?.length || 0} medicines
                  </span>
                </div>
              ))}
            </div>
          </NeumorphicBox>
        )}

      </div>
    </PageTransition>
  );
};

export default PatientDashboard;
