import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { Mobile } from '../models/Mobile.js';
import { Accessory } from '../models/Accessory.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MV-${dateStr}-${randomSuffix}`;
};

export const createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress, paymentMethod = 'razorpay' } = req.body;

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.pincode) {
    return next(new AppError('A valid Indian delivery address with PIN code is required.', 400));
  }

  // Get current cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    return next(new AppError('Your cart is empty. Please add items before checkout.', 400));
  }

  // Calculate prices securely strictly from database
  let itemsTotal = 0;
  const verifiedOrderItems = [];

  for (const item of cart.items) {
    if (item.itemType === 'mobile') {
      const mobile = await Mobile.findById(item.mobile);
      if (!mobile) return next(new AppError(`Product "${item.name}" is no longer available.`, 404));

      let currentPrice = mobile.price.current;
      if (item.variantSku) {
        const variant = mobile.variants.find((v) => v.sku === item.variantSku);
        if (variant) currentPrice = variant.price;
      }

      const itemTotal = currentPrice * item.quantity;
      itemsTotal += itemTotal;

      verifiedOrderItems.push({
        itemType: 'mobile',
        productName: item.name,
        productImage: item.image,
        mobile: mobile._id,
        variantInfo: item.variantDetails ? { ...item.variantDetails, sku: item.variantSku } : null,
        quantity: item.quantity,
        price: currentPrice,
        total: itemTotal,
      });
    } else if (item.itemType === 'accessory') {
      const accessory = await Accessory.findById(item.accessory);
      if (!accessory) return next(new AppError(`Accessory "${item.name}" is no longer available.`, 404));

      const itemTotal = accessory.price.current * item.quantity;
      itemsTotal += itemTotal;

      verifiedOrderItems.push({
        itemType: 'accessory',
        productName: accessory.name,
        productImage: accessory.images[0] || '',
        accessory: accessory._id,
        quantity: item.quantity,
        price: accessory.price.current,
        total: itemTotal,
      });
    }
  }

  const shippingFee = itemsTotal > 999 ? 0 : 99;
  const discount = Math.min(itemsTotal, cart.discountAmount || 0);
  const taxable = Math.round((itemsTotal - discount) / 1.18);
  const gst = itemsTotal - discount - taxable;
  const grandTotal = Math.max(0, itemsTotal - discount + shippingFee);

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    items: verifiedOrderItems,
    pricing: {
      itemsTotal,
      discount,
      shippingFee,
      gst,
      grandTotal,
    },
    shippingAddress,
    payment: {
      method: paymentMethod,
      status: paymentMethod === 'cod' ? 'pending' : 'pending',
    },
    orderStatus: paymentMethod === 'cod' ? 'confirmed' : 'created',
    statusHistory: [
      {
        status: paymentMethod === 'cod' ? 'confirmed' : 'created',
        comment: paymentMethod === 'cod' ? 'Order placed with Cash on Delivery' : 'Order initiated',
      },
    ],
  });

  // If COD, clear cart immediately
  if (paymentMethod === 'cod') {
    cart.items = [];
    cart.couponCode = '';
    cart.discountAmount = 0;
    await cart.save();
  }

  return sendSuccess(res, order, 'Order created successfully.', 201);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  return sendSuccess(res, orders, 'Orders fetched.');
});

export const getOrderById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError('Order not found.', 404));
  }

  // Authorization check
  if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to view this order.', 403));
  }

  return sendSuccess(res, order, 'Order details retrieved.');
});

export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id);

  if (!order) return next(new AppError('Order not found.', 404));

  if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Unauthorized', 403));
  }

  if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
    return next(new AppError(`Cannot cancel order in status: ${order.orderStatus}`, 400));
  }

  order.orderStatus = 'cancelled';
  order.statusHistory.push({
    status: 'cancelled',
    comment: req.body.reason || 'Cancelled by customer',
  });
  await order.save();

  return sendSuccess(res, order, 'Order cancelled successfully.');
});

export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, comment, trackingNumber, courierPartner } = req.body;

  const order = await Order.findById(id);
  if (!order) return next(new AppError('Order not found.', 404));

  if (status) order.orderStatus = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (courierPartner) order.courierPartner = courierPartner;

  order.statusHistory.push({
    status: status || order.orderStatus,
    comment: comment || `Status updated to ${status}`,
  });

  await order.save();
  return sendSuccess(res, order, 'Order status updated successfully.');
});
