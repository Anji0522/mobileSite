import mongoose from 'mongoose';

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: 'India',
    },
    establishedYear: {
      type: Number,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    marketShareIndia: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Brand = mongoose.model('Brand', BrandSchema);
