import mongoose from 'mongoose';

const PriceHistorySchema = new mongoose.Schema(
  {
    mobile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mobile',
      required: true,
      index: true,
    },
    mobileName: {
      type: String,
      required: true,
    },
    oldPrice: {
      type: Number,
      required: true,
    },
    newPrice: {
      type: Number,
      required: true,
    },
    difference: {
      type: Number,
      required: true,
    },
    dropPercentage: {
      type: Number,
      default: 0,
    },
    isPriceDrop: {
      type: Boolean,
      default: false,
      index: true,
    },
    source: {
      type: String,
      default: 'sync_job',
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

export const PriceHistory = mongoose.model('PriceHistory', PriceHistorySchema);
