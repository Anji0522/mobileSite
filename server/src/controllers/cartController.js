import { Cart } from '../models/Cart.js';
import { Mobile } from '../models/Mobile.js';
import { Accessory } from '../models/Accessory.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

const calculateCartSummary = (cart) => {
  const itemsTotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemsMrpTotal = cart.items.reduce((acc, item) => acc + item.mrp * item.quantity, 0);
  const discountTotal = Math.max(0, itemsMrpTotal - itemsTotal + (cart.discountAmount || 0));

  // In India, GST is typically 18% on electronics, but consumer prices are GST-inclusive
  const gstInclusiveRate = 0.18;
  const taxableAmount = Math.round(itemsTotal / (1 + gstInclusiveRate));
  const gstAmount = itemsTotal - taxableAmount;
  const shippingFee = itemsTotal > 999 ? 0 : 99; // Free delivery above Rs 999
  const grandTotal = Math.max(0, itemsTotal - (cart.discountAmount || 0) + shippingFee);

  return {
    itemsCount: cart.items.reduce((acc, item) => acc + item.quantity, 0),
    itemsTotal,
    itemsMrpTotal,
    discountTotal,
    gstBreakup: {
      cgst: Math.round(gstAmount / 2),
      sgst: Math.round(gstAmount / 2),
      totalGst: gstAmount,
    },
    shippingFee,
    couponCode: cart.couponCode,
    couponDiscount: cart.discountAmount || 0,
    grandTotal,
  };
};

export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const summary = calculateCartSummary(cart);
  return sendSuccess(res, { cart, summary }, 'Cart retrieved.');
});

export const addToCart = asyncHandler(async (req, res, next) => {
  const { itemType, itemId, variantSku, quantity = 1 } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  let price = 0;
  let mrp = 0;
  let name = '';
  let image = '';
  let variantDetails = null;

  if (itemType === 'mobile') {
    const mobile = await Mobile.findById(itemId);
    if (!mobile) return next(new AppError('Mobile not found.', 404));

    let selectedVariant = mobile.variants.find((v) => v.sku === variantSku);
    if (!selectedVariant && mobile.variants.length > 0) {
      selectedVariant = mobile.variants[0];
    }

    price = selectedVariant ? selectedVariant.price : mobile.price.current;
    mrp = selectedVariant ? selectedVariant.mrp : mobile.price.mrp;
    name = `${mobile.name} ${selectedVariant ? `(${selectedVariant.ram}/${selectedVariant.storage}, ${selectedVariant.color})` : ''}`;
    image = selectedVariant?.image || mobile.images[0];
    variantDetails = selectedVariant
      ? { ram: selectedVariant.ram, storage: selectedVariant.storage, color: selectedVariant.color }
      : null;

    // Check existing item
    const existingIndex = cart.items.findIndex(
      (item) => item.mobile?.toString() === itemId && item.variantSku === (selectedVariant?.sku || '')
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        itemType: 'mobile',
        mobile: mobile._id,
        variantSku: selectedVariant?.sku || '',
        variantDetails,
        name,
        image,
        quantity: Number(quantity),
        price,
        mrp,
      });
    }
  } else if (itemType === 'accessory') {
    const accessory = await Accessory.findById(itemId);
    if (!accessory) return next(new AppError('Accessory not found.', 404));

    price = accessory.price.current;
    mrp = accessory.price.mrp;
    name = accessory.name;
    image = accessory.images[0];

    const existingIndex = cart.items.findIndex((item) => item.accessory?.toString() === itemId);

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        itemType: 'accessory',
        accessory: accessory._id,
        name,
        image,
        quantity: Number(quantity),
        price,
        mrp,
      });
    }
  } else {
    return next(new AppError('Invalid itemType specified.', 400));
  }

  await cart.save();
  const summary = calculateCartSummary(cart);
  return sendSuccess(res, { cart, summary }, 'Item added to cart.');
});

export const updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError('Cart not found.', 404));

  const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
  if (itemIndex === -1) return next(new AppError('Item not found in cart.', 404));

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();
  const summary = calculateCartSummary(cart);
  return sendSuccess(res, { cart, summary }, 'Cart quantity updated.');
});

export const removeCartItem = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new AppError('Cart not found.', 404));

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
  await cart.save();

  const summary = calculateCartSummary(cart);
  return sendSuccess(res, { cart, summary }, 'Item removed from cart.');
});

export const applyCoupon = asyncHandler(async (req, res, next) => {
  const { couponCode } = req.body;
  const code = (couponCode || '').trim().toUpperCase();

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    return next(new AppError('Your cart is empty.', 400));
  }

  const itemsTotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discount = 0;
  if (code === 'FESTIVE500') {
    if (itemsTotal < 2000) {
      return next(new AppError('Coupon FESTIVE500 requires a minimum order of ₹2,000.', 400));
    }
    discount = 500;
  } else if (code === 'MOBIVERSE10') {
    discount = Math.min(1500, Math.round(itemsTotal * 0.10));
  } else if (code === 'FREESHIP') {
    discount = 99;
  } else {
    return next(new AppError(`Coupon code "${code}" is invalid or expired. Try MOBIVERSE10 or FESTIVE500.`, 400));
  }

  cart.couponCode = code;
  cart.discountAmount = discount;
  await cart.save();

  const summary = calculateCartSummary(cart);
  return sendSuccess(res, { cart, summary }, `Coupon "${code}" applied successfully! Saved ₹${discount}`);
});

export const clearCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.couponCode = '';
    cart.discountAmount = 0;
    await cart.save();
  }
  return sendSuccess(res, { cart, summary: calculateCartSummary(cart || { items: [] }) }, 'Cart cleared.');
});
