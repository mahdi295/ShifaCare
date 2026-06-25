import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import NeumorphicBox from '../../components/ui/NeumorphicBox';
import PageTransition from '../../components/ui/PageTransition';
import { Plus, Pencil, Trash2, Building2, Loader2, X, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const schema = z.object({
  name:        z.string().min(2, 'Name is required'),
  description: z.string().optional(),
});

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-md rounded-xl bg-surface rounded-xl border border-border shadow-card bg-background p-6 z-10">
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

const AdminDepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal,   setModal]           = useState(null); // null | 'add' | 'edit'
  const [editing, setEditing]         = useState(null);
  const [saving,  setSaving]          = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const fetchData = () => {
    setLoading(true);
    api.get('/departments')
      .then((r) => setDepartments(r.data.data))
      .catch(() => toast.error('Failed to load departments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    reset({ name: '', description: '' });
    setEditing(null);
    setModal('add');
  };

  const openEdit = (dept) => {
    reset({ name: dept.name, description: dept.description || '' });
    setEditing(dept);
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setEditing(null); };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/departments', values);
        toast.success('Department created');
      } else {
        await api.put(`/departments/${editing._id}`, values);
        toast.success('Department updated');
      }
      closeModal();
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Delete "${dept.name}"? Doctors assigned here must be reassigned first.`)) return;
    try {
      await api.delete(`/departments/${dept._id}`);
      toast.success('Department deleted');
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  const DEPT_EMOJIS = {
  cardio: "❤️",       // Cardiology
  neuro: "🧠",        // Neurology
  pediatr: "👶",      // Pediatrics
  ortho: "🦴",        // Orthopedics
  eye: "👁️",         // Eye
  ophthal: "👁️",     // Ophthalmology
  derm: "🧴",         // Dermatology
  ent: "👂",          // ENT
  gyn: "🌸",          // Gynecology
  gyne: "🌸",         // Gynecology
  obst: "🌸",         // Obstetrics
  dent: "🦷",         // Dentistry
  uro: "🧍",          // Urology
  neph: "🩸",         // Nephrology
  pulmo: "🫁",        // Pulmonology
  onco: "🧬",         // Oncology
  psych: "🧘",        // Psychiatry / Psychology
  general: "🩺"       // General Medicine
};

const getEmoji = (name = "") => {
  const n = name.toLowerCase();
  return Object.entries(DEPT_EMOJIS).find(([k]) => n.includes(k))?.[1] || "🏥";
};


  return (
    <PageTransition>
      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Department Management</h3>
            <p className="text-muted text-sm mt-1">{departments.length} departments</p>
          </div>
          <button onClick={openAdd} className="nm-button-accent py-2.5 px-6 text-sm flex items-center gap-2">
            <Plus size={17} /> Add Department
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={36} /></div>
        ) : departments.length === 0 ? (
          <NeumorphicBox className="p-14 text-center">
            <Building2 className="mx-auto text-muted mb-4" size={36} />
            <p className="font-semibold">No departments yet</p>
            <p className="text-muted text-sm mt-2">Click "Add Department" to create one.</p>
          </NeumorphicBox>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {departments.map((dept) => (
              <NeumorphicBox key={dept._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{getEmoji(dept.name)}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(dept)}
                      className="p-2 rounded-xl bg-surface rounded-xl border border-border shadow-card text-muted hover:text-primary transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(dept)}
                      className="p-2 rounded-xl bg-surface rounded-xl border border-border shadow-card text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <h4 className="font-bold">{dept.name}</h4>
                {dept.description && (
                  <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">{dept.description}</p>
                )}
              </NeumorphicBox>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Department' : `Edit — ${editing?.name}`} onClose={closeModal}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 px-1">Department Name</label>
              <input type="text" className="nm-input w-full" placeholder="e.g. Cardiology" {...register('name')} />
              {errors.name && <p className="text-red-500 text-xs mt-1 px-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 px-1">Description (optional)</label>
              <textarea
                className="nm-input w-full min-h-[90px] resize-none"
                placeholder="Brief description of the department..."
                {...register('description')}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeModal} className="nm-button text-sm py-2.5 px-6 text-muted">Cancel</button>
              <button type="submit" disabled={saving} className="nm-button-accent text-sm py-2.5 px-6 flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {modal === 'add' ? 'Create' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </PageTransition>
  );
};

export default AdminDepartmentsPage;
