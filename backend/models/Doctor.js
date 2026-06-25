import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Please add a department'],
    },
    specialization: {
      type: String,
      required: [true, 'Please add specialization'],
    },
    experience: {
      type: Number,
      required: [true, 'Please add years of experience'],
    },
    degree: {
      type: String,
      required: [true, 'Please add degree (e.g. MBBS, MD)'],
    },
    fees: {
      type: Number,
      required: [true, 'Please add consultation fees'],
    },
    about: {
      type: String,
      maxlength: [500, 'About cannot be more than 500 characters'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    schedule: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        startTime: String,
        endTime: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Doctor', DoctorSchema);
