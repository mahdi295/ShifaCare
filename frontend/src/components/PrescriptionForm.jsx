import React, { useState } from 'react';
import api from '../utils/axios';
import NeumorphicBox from '../components/ui/NeumorphicBox';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PrescriptionForm = ({ appointment, onComplete }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', instructions: '' }]);
  const [loading, setLoading] = useState(false);

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '', instructions: '' }]);
  };

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/prescriptions', {
        appointment: appointment._id,
        diagnosis,
        medicines,
        advice
      });
      toast.success('Prescription issued successfully');
      onComplete();
    } catch (error) {
      toast.error('Failed to issue prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <NeumorphicBox className="p-8">
      <h3 className="text-xl font-bold mb-6">Issue Prescription for {appointment.patient.name}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Diagnosis</label>
          <input 
            className="nm-input w-full"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Viral Fever"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-medium">Medicines</label>
            <button 
              type="button" 
              onClick={addMedicine}
              className="text-primary text-sm font-bold flex items-center gap-1"
            >
              <Plus size={16} /> Add Medicine
            </button>
          </div>
          
          <div className="space-y-4">
            {medicines.map((med, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 nm-inset rounded-xl relative">
                <input 
                  className="bg-transparent outline-none text-sm"
                  placeholder="Medicine Name"
                  value={med.name}
                  onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                  required
                />
                <input 
                  className="bg-transparent outline-none text-sm"
                  placeholder="Dosage (1+0+1)"
                  value={med.dosage}
                  onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                />
                <input 
                  className="bg-transparent outline-none text-sm"
                  placeholder="Duration (5 days)"
                  value={med.duration}
                  onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <input 
                    className="bg-transparent outline-none text-sm flex-1"
                    placeholder="Instructions"
                    value={med.instructions}
                    onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                  />
                  {medicines.length > 1 && (
                    <button onClick={() => removeMedicine(index)} className="text-red-400">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">General Advice</label>
          <textarea 
            className="nm-input w-full min-h-[100px]"
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            placeholder="Rest and drink plenty of fluids..."
          ></textarea>
        </div>

        <button 
          disabled={loading}
          type="submit" 
          className="nm-button-accent w-full py-4 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          Save & Issue Prescription
        </button>
      </form>
    </NeumorphicBox>
  );
};

export default PrescriptionForm;
