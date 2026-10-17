import mongoose from 'mongoose';

const AccessorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Accessory name is required'],
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
    brand: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'case',
        'screen_guard',
        'charger',
        'cable',
        'earbuds',
        'power_bank',
        'smartwatch',
        'stand',
        'car_mount',
      ],
      required: true,
      index: true,
    },
    compatibleMobiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mobile' }],
    compatibleBrands: [String],
    price: {
      mrp: { type: Number, required: true },
      current: { type: Number, required: true },
      discountPercentage: { type: Number, default: 0 },
    },
    images: {
      type: [String],
      validate: [(val) => val.length > 0, 'At least one image is required'],
    },
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    stock: {
      type: Number,
      default: 50,
    },
    rating: {
      avg: { type: Number, default: 4.6 },
      count: { type: Number, default: 0 },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    sellerName: {
      type: String,
      default: 'MobiVerse Retail Official',
    },
  },
  { timestamps: true }
);

AccessorySchema.index({ name: 'text', brand: 'text', type: 'text' });

export const Accessory = mongoose.model('Accessory', AccessorySchema);
