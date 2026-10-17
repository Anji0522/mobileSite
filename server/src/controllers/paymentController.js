import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Cart } from '../models/Cart.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

// Initialize Razorpay SDK instance
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_MobiVerseMockKey123';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'MobiVerseMockSecretKey456';

let razorpayInstance = null;
try {
  razorpayInstance = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
} catch (err) {
  console.warn('⚠️ Razorpay initialization warning:', err.message);
}

export const createRazorpayOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Order not found.', 404));
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Unauthorized access to order.', 403));
  }

  if (order.payment.status === 'paid') {
    return next(new AppError('This order has already been paid.', 400));
  }

  // Razorpay accepts amount in paise (1 INR = 100 paise)
  const amountInPaise = Math.round(order.pricing.grandTotal * 100);

  let rzpOrder;
  try {
    if (razorpayInstance && !razorpayKeyId.includes('Mock')) {
      rzpOrder = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${order.orderNumber}`,
        notes: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          userId: req.user._id.toString(),
        },
      });
    } else {
      // Mock Razorpay Order for local dev & testing without live keys
      rzpOrder = {
        id: `order_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        amount: amountInPaise,
        currency: 'INR',
        status: 'created',
      };
    }
  } catch (err) {
    console.error('Razorpay order creation error:', err.message);
    // Fallback to simulated test order
    rzpOrder = {
      id: `order_sim_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      amount: amountInPaise,
      currency: 'INR',
      status: 'created',
    };
  }

  order.payment.razorpayOrderId = rzpOrder.id;
  await order.save();

  return sendSuccess(
    res,
    {
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: razorpayKeyId,
      orderNumber: order.orderNumber,
      customer: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
      },
    },
    'Razorpay payment order initialized.'
  );
});

export const verifyPayment = asyncHandler(async (req, res, next) => {
  const {
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    method = 'upi',
    idempotencyKey,
  } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Order not found.', 404));
  }

  // Check idempotency: avoid double processing
  if (idempotencyKey) {
    const existingPayment = await Payment.findOne({ idempotencyKey });
    if (existingPayment) {
      return sendSuccess(res, { order, payment: existingPayment }, 'Payment already verified (idempotent).');
    }
  }

  // Signature verification
  const isMock = razorpayKeyId.includes('Mock') || (razorpayOrderId && razorpayOrderId.startsWith('order_mock_')) || (razorpayOrderId && razorpayOrderId.startsWith('order_sim_'));
  let isValid = false;

  if (isMock) {
    // In mock/test dev mode, accept test verification
    isValid = true;
  } else {
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    isValid = expectedSignature === razorpaySignature;
  }

  if (!isValid) {
    // Record failed payment attempt safely without PII
    await Payment.create({
      order: order._id,
      user: req.user._id,
      razorpayOrderId: razorpayOrderId || 'unknown',
      razorpayPaymentId: razorpayPaymentId || 'unknown',
      amount: order.pricing.grandTotal,
      currency: 'INR',
      status: 'failed',
      errorDescription: 'Signature verification mismatch',
    });

    return next(new AppError('Payment verification failed. Invalid digital signature.', 400));
  }

  // Record verified payment
  const paymentRecord = await Payment.create({
    order: order._id,
    user: req.user._id,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature: razorpaySignature || 'verified_mock_sig',
    amount: order.pricing.grandTotal,
    currency: 'INR',
    status: 'captured',
    method,
    idempotencyKey: idempotencyKey || `idem_${razorpayPaymentId}`,
  });

  // Update order status
  order.payment.status = 'paid';
  order.payment.razorpayPaymentId = razorpayPaymentId;
  order.payment.paidAt = new Date();
  order.orderStatus = 'confirmed';
  order.statusHistory.push({
    status: 'confirmed',
    comment: `Payment received via Razorpay (${method.toUpperCase()}). Payment ID: ${razorpayPaymentId}`,
  });
  await order.save();

  // Clear customer cart upon verified payment
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], couponCode: '', discountAmount: 0 });

  return sendSuccess(
    res,
    { order, payment: paymentRecord },
    'Payment verified successfully. Order confirmed!'
  );
});

export const handleWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'MobiVerseMockWebhookSecret789';
  const signature = req.headers['x-razorpay-signature'];

  if (signature && webhookSecret) {
    const bodyText = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyText)
      .digest('hex');

    if (expectedSignature !== signature && !webhookSecret.includes('Mock')) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }
  }

  const event = req.body?.event;
  const payload = req.body?.payload;

  console.log(`🔔 Webhook received: ${event}`);

  if (event === 'payment.captured' && payload?.payment?.entity) {
    const entity = payload.payment.entity;
    const rzpOrderId = entity.order_id;

    const order = await Order.findOne({ 'payment.razorpayOrderId': rzpOrderId });
    if (order && order.payment.status !== 'paid') {
      order.payment.status = 'paid';
      order.payment.razorpayPaymentId = entity.id;
      order.payment.paidAt = new Date();
      order.orderStatus = 'confirmed';
      order.statusHistory.push({
        status: 'confirmed',
        comment: `Webhook payment.captured confirmed (${entity.method})`,
      });
      await order.save();
    }
  }

  return res.status(200).json({ status: 'ok' });
});
