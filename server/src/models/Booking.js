import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deviceModel: {
      type: String,
      required: true,
    },
    issueDescription: {
      type: String,
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    serviceAddress: {
      street: String,
      city: String,
      pincode: String,
      phone: String,
    },
    estimatedPrice: {
      type: Number,
      required: true,
    },
    finalPrice: {
      type: Number,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', BookingSchema);
