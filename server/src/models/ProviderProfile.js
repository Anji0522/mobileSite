import mongoose from 'mongoose';

const ProviderProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
      default: '',
    },
    panNumber: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      avg: { type: Number, default: 4.8 },
      count: { type: Number, default: 0 },
    },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifsc: String,
      bankName: String,
    },
    commissionRate: {
      type: Number,
      default: 5.0, // 5% marketplace commission
    },
  },
  { timestamps: true }
);

export const ProviderProfile = mongoose.model('ProviderProfile', ProviderProfileSchema);
