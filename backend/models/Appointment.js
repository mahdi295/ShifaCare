import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    slot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    fees: {
      type: Number,
      required: true,
    },
    symptoms: {
      type: String,
      required: [true, 'Please describe your symptoms'],
    },
    notes: {
      type: String,
      default: '',
    },
    serialNumber: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: slot availability queries (doctor + date + status)
AppointmentSchema.index({ doctor: 1, appointmentDate: 1, status: 1 });

// Compound index: patient history queries
AppointmentSchema.index({ patient: 1, appointmentDate: -1 });

// Unique constraint: no same doctor + date + slot (unless cancelled)
// NOTE: this is enforced in the controller with a query check
// because MongoDB partial indexes on enum values are complex.
// The controller's duplicate check is the enforcement layer.

export default mongoose.model('Appointment', AppointmentSchema);
