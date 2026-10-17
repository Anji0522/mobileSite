import { User } from '../models/User.js';
import { ProviderProfile } from '../models/ProviderProfile.js';
import { Mobile } from '../models/Mobile.js';
import { Order } from '../models/Order.js';
import { PriceHistory } from '../models/PriceHistory.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { syncPricesJob } from '../jobs/priceSyncJob.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProviders,
    totalMobiles,
    pendingMobiles,
    orders,
    recentOrders,
    priceDropsCount,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'provider' }),
    Mobile.countDocuments({ status: 'available' }),
    Mobile.countDocuments({ status: 'pending_review' }),
    Order.find().lean(),
    Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email').lean(),
    PriceHistory.countDocuments({ isPriceDrop: true }),
  ]);

  const totalRevenue = orders
    .filter((o) => o.payment.status === 'paid')
    .reduce((sum, o) => sum + (o.pricing.grandTotal || 0), 0);

  const orderStats = {
    total: orders.length,
    confirmed: orders.filter((o) => o.orderStatus === 'confirmed').length,
    shipped: orders.filter((o) => o.orderStatus === 'shipped').length,
    delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
    cancelled: orders.filter((o) => o.orderStatus === 'cancelled').length,
  };

  return sendSuccess(
    res,
    {
      totalUsers,
      totalProviders,
      totalMobiles,
      pendingMobiles,
      totalRevenue,
      orderStats,
      priceDropsCount,
      recentOrders,
    },
    'Admin dashboard statistics fetched.'
  );
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, status, q } = req.query;
  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;
  if (q) {
    query.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
  }

  const users = await User.find(query).sort({ createdAt: -1 }).lean();
  return sendSuccess(res, users, 'Users retrieved.');
});

export const updateUserStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { role, status } = req.body;

  const user = await User.findById(id);
  if (!user) return next(new AppError('User not found.', 404));

  if (role) user.role = role;
  if (status) user.status = status;
  await user.save();

  return sendSuccess(res, user, 'User updated successfully.');
});

export const getAllProviders = asyncHandler(async (req, res) => {
  const providers = await ProviderProfile.find().populate('user', 'name email phone avatar status').lean();
  return sendSuccess(res, providers, 'Providers retrieved.');
});

export const verifyProvider = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { isVerified, commissionRate } = req.body;

  const provider = await ProviderProfile.findById(id);
  if (!provider) return next(new AppError('Provider profile not found.', 404));

  if (isVerified !== undefined) provider.isVerified = isVerified;
  if (commissionRate !== undefined) provider.commissionRate = commissionRate;
  await provider.save();

  return sendSuccess(res, provider, 'Provider verification updated.');
});

export const getPendingListings = asyncHandler(async (req, res) => {
  const mobiles = await Mobile.find({ status: 'pending_review' }).populate('addedBy', 'name email').lean();
  return sendSuccess(res, mobiles, 'Pending listings fetched.');
});

export const approveListing = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status = 'available' } = req.body;

  const mobile = await Mobile.findByIdAndUpdate(id, { status }, { new: true });
  if (!mobile) return next(new AppError('Mobile not found.', 404));

  return sendSuccess(res, mobile, `Mobile listing marked as ${status}.`);
});

export const triggerPriceSyncNow = asyncHandler(async (req, res) => {
  const result = await syncPricesJob();
  return sendSuccess(res, result, 'Price sync completed successfully.');
});

export const getPriceHistory = asyncHandler(async (req, res) => {
  const history = await PriceHistory.find().sort({ recordedAt: -1 }).limit(50).lean();
  return sendSuccess(res, history, 'Price history records retrieved.');
});
