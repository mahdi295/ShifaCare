import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import NeumorphicBox from '../../components/ui/NeumorphicBox';
import PageTransition from '../../components/ui/PageTransition';
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Loader2, Stethoscope, X, Check, Search,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

// ── Validation schema ─────────────────────────────────────────────────────────
const staffSchema = z.object({
  name:     z.string().min(2, 'Name required'),
  email:    z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters').optional().or(z.literal('')),
  phone:    z.string().optional(),
});

const profileSchema = z.object({
  department:     z.string().min(1, 'Select a department'),
  specialization: z.string().min(2, 'Specialization required'),
  degree:         z.string().min(2, 'Degree required'),
  experience:     z.coerce.number().min(0, 'Must be 0 or more'),
  fees:           z.coerce.number().min(1, 'Fee required'),
  about:          z.string().optional(),
});

// ── Schedule day editor ───────────────────────────────────────────────────────
const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const ScheduleEditor = ({ schedule, onChange }) => {
  const toggle = (day) => {
    const exists = schedule.find((s) => s.day === day);
    if (exists) {
      onChange(schedule.filter((s) => s.day !== day));
    } else {
      onChange([...schedule, { day, startTime: '09:00', endTime: '17:00' }]);
    }
  };

  const update = (day, field, value) => {
    onChange(schedule.map((s) => s.day === day ? { ...s, [field]: value } : s));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">Working Schedule</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {DAYS.map((day) => {
          const active = schedule.find((s) => s.day === day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggle(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                active ? 'bg-background rounded-lg border border-border text-primary' : 'bg-surface rounded-xl border border-border shadow-card text-muted'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          );
        })}
      </div>
      {schedule.map((s) => (
        <div key={s.day} className="flex items-center gap-3 bg-background rounded-lg border border-border p-3">
          <span className="text-xs font-bold text-primary w-16 shrink-0">{s.day.slice(0, 3)}</span>
          <input
            type="time"
            value={s.startTime}
            onChange={(e) => update(s.day, 'startTime', e.target.value)}
            className="nm-input py-1.5 px-3 text-xs flex-1"
          />
          <span className="text-xs text-muted">to</span>
          <input
            type="time"
            value={s.endTime}
            onChange={(e) => update(s.day, 'endTime', e.target.value)}
            className="nm-input py-1.5 px-3 text-xs flex-1"
          />
        </div>
      ))}
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-surface rounded-xl border border-border shadow-card bg-background p-6 z-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">{title}</h3>
        <button onClick={onClose} className="p-2 rounded-xl bg-surface rounded-xl border border-border shadow-card text-muted hover:text-red-500">
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminDoctorsPage = () => {
  const [doctors,     setDoctors]     = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [modal,       setModal]       = useState(null); // null | 'add' | 'edit'
  const [editing,     setEditing]     = useState(null); // doctor being edited
  const [step,        setStep]        = useState(1);    // add wizard: step 1 = user, step 2 = profile
  const [createdUser, setCreatedUser] = useState(null); // user created in step 1
  const [schedule,    setSchedule]    = useState([]);
  const [saving,      setSaving]      = useState(false);

  const staffForm = useForm({ resolver: zodResolver(staffSchema) });
  const profileForm = useForm({ resolver: zodResolver(profileSchema) });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, deptRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/departments'),
      ]);
      setDoctors(docRes.data.data);
      setDepartments(deptRes.data.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    staffForm.reset();
    profileForm.reset();
    setSchedule([]);
    setCreatedUser(null);
    setStep(1);
    setModal('add');
  };

  const openEdit = (doc) => {
    setEditing(doc);
    profileForm.reset({
      department:     doc.department?._id || '',
      specialization: doc.specialization || '',
      degree:         doc.degree || '',
      experience:     doc.experience || 0,
      fees:           doc.fees || 0,
      about:          doc.about || '',
    });
    setSchedule(doc.schedule || []);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
    setStep(1);
    setCreatedUser(null);
  };

  // Step 1 — create staff user account
  const handleCreateUser = async (values) => {
    setSaving(true);
    try {
      const { data } = await api.post('/auth/create-staff', { ...values, role: 'doctor' });
      setCreatedUser(data.data);
      setStep(2);
      toast.success('User account created. Now set up the doctor profile.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create account');
    } finally {
      setSaving(false);
    }
  };

  // Step 2 — create doctor profile linked to the user
  const handleCreateProfile = async (values) => {
    if (!createdUser?.id) return;
    setSaving(true);
    try {
      await api.post('/doctors', {
        ...values,
        user: createdUser.id,
        schedule,
      });
      toast.success('Doctor added successfully!');
      closeModal();
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create doctor profile');
    } finally {
      setSaving(false);
    }
  };

  // Edit existing doctor profile
  const handleUpdateProfile = async (values) => {
    setSaving(true);
    try {
      await api.put(`/doctors/${editing._id}`, { ...values, schedule });
      toast.success('Doctor profile updated');
      closeModal();
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (doc) => {
    try {
      const res = await api.put(`/doctors/${doc._id}/toggle-availability`);
      toast.success(res.data.message);
      fetchData();
    } catch {
      toast.error('Toggle failed');
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete Dr. ${doc.user?.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/doctors/${doc._id}`);
      toast.success('Doctor deleted');
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  const filtered = doctors.filter((d) =>
    d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Doctor Management</h3>
            <p className="text-muted text-sm mt-1">{doctors.length} doctors registered</p>
          </div>
          <button onClick={openAdd} className="nm-button-accent py-2.5 px-6 text-sm flex items-center gap-2">
            <Plus size={17} /> Add Doctor
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder="Search by name or specialization..."
            className="nm-input w-full pl-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={36} /></div>
        ) : filtered.length === 0 ? (
          <NeumorphicBox className="p-14 text-center">
            <Stethoscope className="mx-auto text-muted mb-4" size={36} />
            <p className="font-semibold">No doctors found</p>
          </NeumorphicBox>
        ) : (
          <div className="space-y-3">
            {filtered.map((doc) => (
              <NeumorphicBox key={doc._id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-background rounded-lg border border-border overflow-hidden p-0.5 shrink-0">
                      <img
                        src={
                          !doc.user?.avatar || doc.user.avatar === 'no-photo.jpg'
                            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.user?.name || 'D')}&background=6C63FF&color=fff&size=80`
                            : doc.user.avatar
                        }
                        className="w-full h-full object-cover rounded-lg"
                        alt={`Dr. ${doc.user?.name}`}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Dr. {doc.user?.name}</p>
                      <p className="text-xs text-primary">{doc.specialization}</p>
                      <p className="text-xs text-muted">{doc.department?.name} · {doc.experience} yrs · ৳{doc.fees}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Availability toggle */}
                    <button
                      onClick={() => handleToggle(doc)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-surface rounded-xl border border-border shadow-card transition-all ${
                        doc.isAvailable ? 'text-green-600' : 'text-muted'
                      }`}
                    >
                      {doc.isAvailable ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      {doc.isAvailable ? 'Available' : 'Off'}
                    </button>
                    <button
                      onClick={() => openEdit(doc)}
                      className="p-2.5 rounded-xl bg-surface rounded-xl border border-border shadow-card text-muted hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-2.5 rounded-xl bg-surface rounded-xl border border-border shadow-card text-muted hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </NeumorphicBox>
            ))}
          </div>
        )}
      </div>

      {/* ── ADD DOCTOR MODAL ───────────────────────────────────────────────── */}
      {modal === 'add' && (
        <Modal title={step === 1 ? 'Add Doctor — Step 1: Account' : 'Add Doctor — Step 2: Profile'} onClose={closeModal}>
          {step === 1 ? (
            <form onSubmit={staffForm.handleSubmit(handleCreateUser)} className="space-y-4">
              <p className="text-xs text-muted">First create a user account. The doctor will use this email to log in.</p>

              {[
                { name: 'name',     label: 'Full Name',    type: 'text',     ph: 'Dr. John Doe' },
                { name: 'email',    label: 'Email Address',type: 'email',    ph: 'doctor@example.com' },
                { name: 'password', label: 'Password',     type: 'password', ph: 'Min 6 characters (default: ShifaCare@2024)' },
                { name: 'phone',    label: 'Phone',        type: 'text',     ph: '01XXXXXXXXX' },
              ].map(({ name, label, type, ph }) => (
                <div key={name}>
                  <label className="block text-sm font-medium mb-1.5 px-1">{label}</label>
                  <input type={type} className="nm-input w-full" placeholder={ph} {...staffForm.register(name)} />
                  {staffForm.formState.errors[name] && (
                    <p className="text-red-500 text-xs mt-1 px-1">{staffForm.formState.errors[name].message}</p>
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="nm-button text-sm py-2.5 px-6 text-muted">Cancel</button>
                <button type="submit" disabled={saving} className="nm-button-accent text-sm py-2.5 px-6 flex items-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  Next Step
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={profileForm.handleSubmit(handleCreateProfile)} className="space-y-4">
              <div className="bg-background rounded-lg border border-border p-3 text-xs text-green-700 bg-green-50 font-medium">
                ✓ Account created for {createdUser?.name}. Now fill in the doctor profile.
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium mb-1.5 px-1">Department</label>
                <select className="nm-input w-full bg-background" {...profileForm.register('department')}>
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
                {profileForm.formState.errors.department && (
                  <p className="text-red-500 text-xs mt-1 px-1">{profileForm.formState.errors.department.message}</p>
                )}
              </div>

              {[
                { name: 'specialization', label: 'Specialization', ph: 'e.g. Cardiologist' },
                { name: 'degree',         label: 'Degree',         ph: 'e.g. MBBS, MD' },
              ].map(({ name, label, ph }) => (
                <div key={name}>
                  <label className="block text-sm font-medium mb-1.5 px-1">{label}</label>
                  <input type="text" className="nm-input w-full" placeholder={ph} {...profileForm.register(name)} />
                  {profileForm.formState.errors[name] && (
                    <p className="text-red-500 text-xs mt-1 px-1">{profileForm.formState.errors[name].message}</p>
                  )}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 px-1">Experience (years)</label>
                  <input type="number" className="nm-input w-full" placeholder="0" min="0" step="1" onWheel={(e) => e.target.blur()} {...profileForm.register('experience')} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 px-1">Consultation Fee (৳)</label>
                  <input type="number" className="nm-input w-full" placeholder="500" step="1" min="1" onWheel={(e) => e.target.blur()} {...profileForm.register('fees')} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 px-1">About (optional)</label>
                <textarea className="nm-input w-full min-h-[70px] resize-none" placeholder="Short bio..." {...profileForm.register('about')} />
              </div>

              <ScheduleEditor schedule={schedule} onChange={setSchedule} />

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="nm-button text-sm py-2.5 px-6 text-muted">Back</button>
                <button type="submit" disabled={saving} className="nm-button-accent text-sm py-2.5 px-6 flex items-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  Save Doctor
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* ── EDIT DOCTOR MODAL ──────────────────────────────────────────────── */}
      {modal === 'edit' && editing && (
        <Modal title={`Edit — Dr. ${editing.user?.name}`} onClose={closeModal}>
          <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 px-1">Department</label>
              <select className="nm-input w-full bg-background" {...profileForm.register('department')}>
                <option value="">Select department</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>

            {[
              { name: 'specialization', label: 'Specialization' },
              { name: 'degree',         label: 'Degree'         },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1.5 px-1">{label}</label>
                <input type="text" className="nm-input w-full" {...profileForm.register(name)} />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 px-1">Experience (yrs)</label>
                <input type="number" className="nm-input w-full" min="0" step="1" onWheel={(e) => e.target.blur()} {...profileForm.register('experience')} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 px-1">Fee (৳)</label>
                <input type="number" className="nm-input w-full" step="1" min="1" onWheel={(e) => e.target.blur()} {...profileForm.register('fees')} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 px-1">About</label>
              <textarea className="nm-input w-full min-h-[70px] resize-none" {...profileForm.register('about')} />
            </div>

            <ScheduleEditor schedule={schedule} onChange={setSchedule} />

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeModal} className="nm-button text-sm py-2.5 px-6 text-muted">Cancel</button>
              <button type="submit" disabled={saving} className="nm-button-accent text-sm py-2.5 px-6 flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </PageTransition>
  );
};

export default AdminDoctorsPage;
