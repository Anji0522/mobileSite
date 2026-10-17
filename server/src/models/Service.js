import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerName: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'screen_repair',
        'battery_replacement',
        'water_damage',
        'software_recovery',
        'charging_port',
        'camera_repair',
        'inspection',
      ],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    supportedBrands: [String],
    estimatedHours: {
      type: Number,
      default: 2,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    warrantyDays: {
      type: Number,
      default: 90,
    },
    images: [String],
    city: {
      type: String,
      required: true,
      default: 'Bengaluru',
      index: true,
    },
    address: {
      type: String,
      default: '',
    },
    rating: {
      avg: { type: Number, default: 4.8 },
      count: { type: Number, default: 12 },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

ServiceSchema.index({ title: 'text', description: 'text', city: 'text' });

export const Service = mongoose.model('Service', ServiceSchema);
