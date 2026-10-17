import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['mobile', 'accessory'],
    required: true,
  },
  mobile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mobile',
  },
  variantSku: {
    type: String,
    default: '',
  },
  variantDetails: {
    ram: String,
    storage: String,
    color: String,
  },
  accessory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Accessory',
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  mrp: {
    type: Number,
    required: true,
  },
});

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
    couponCode: {
      type: String,
      default: '',
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Cart = mongoose.model('Cart', CartSchema);
