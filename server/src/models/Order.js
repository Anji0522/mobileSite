import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['mobile', 'accessory'],
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productImage: {
    type: String,
    default: '',
  },
  mobile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mobile',
  },
  variantInfo: {
    ram: String,
    storage: String,
    color: String,
    sku: String,
  },
  accessory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Accessory',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const OrderStatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  comment: {
    type: String,
    default: '',
  },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [OrderItemSchema],
    pricing: {
      itemsTotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      shippingFee: { type: Number, default: 0 },
      gst: { type: Number, default: 0 }, // 18% GST in India
      grandTotal: { type: Number, required: true },
    },
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      landmark: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    payment: {
      method: {
        type: String,
        enum: ['razorpay', 'cod'],
        default: 'razorpay',
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      paidAt: Date,
    },
    orderStatus: {
      type: String,
      enum: ['created', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'created',
      index: true,
    },
    statusHistory: [OrderStatusHistorySchema],
    trackingNumber: {
      type: String,
      default: '',
    },
    courierPartner: {
      type: String,
      default: 'BlueDart / Delhivery Express',
    },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, createdAt: -1 });

export const Order = mongoose.model('Order', OrderSchema);
