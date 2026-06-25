import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed', 'cancelled', 'refund_requested', 'refunded'],
      default: 'pending',
    },
    method: String,
    paidAt: Date,
    refundReason: String,
    refundRequestedAt: Date,
    refundedAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Payment', PaymentSchema);
