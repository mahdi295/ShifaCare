import mongoose from 'mongoose';

const PrescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Please add diagnosis'],
    },
    medicines: [
      {
        name: String,
        dosage: String,
        duration: String,
        instructions: String,
      },
    ],
    advice: String,
    followUpDate: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Prescription', PrescriptionSchema);
