import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a department name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: 'no-image.jpg',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Department', DepartmentSchema);
