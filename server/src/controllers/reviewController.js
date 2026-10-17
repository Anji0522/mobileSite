import { Review } from '../models/Review.js';
import { Mobile } from '../models/Mobile.js';
import { Accessory } from '../models/Accessory.js';
import { Service } from '../models/Service.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getItemReviews = asyncHandler(async (req, res) => {
  const { itemType, itemId } = req.params;

  const reviews = await Review.find({ itemType, item: itemId })
    .sort({ createdAt: -1 })
    .populate('user', 'name avatar')
    .lean();

  return sendSuccess(res, reviews, 'Reviews fetched successfully.');
});

export const createReview = asyncHandler(async (req, res, next) => {
  const { itemType, itemId, rating, title, comment, images } = req.body;

  if (!itemType || !itemId || !rating || !comment) {
    return next(new AppError('Please provide itemType, itemId, rating, and comment.', 400));
  }

  // Check if target item exists
  let targetModel;
  if (itemType === 'mobile') targetModel = Mobile;
  else if (itemType === 'accessory') targetModel = Accessory;
  else if (itemType === 'service') targetModel = Service;
  else return next(new AppError('Invalid itemType.', 400));

  const targetItem = await targetModel.findById(itemId);
  if (!targetItem) {
    return next(new AppError('Item to review does not exist.', 404));
  }

  const review = await Review.create({
    user: req.user._id,
    userName: req.user.name,
    userAvatar: req.user.avatar,
    itemType,
    item: itemId,
    rating: Number(rating),
    title: title || '',
    comment,
    images: images || [],
    isVerifiedPurchase: true,
  });

  // Recalculate average rating for the target item
  const allReviews = await Review.find({ itemType, item: itemId });
  const count = allReviews.length;
  const avg = Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1));

  targetItem.rating = { avg, count };
  await targetItem.save();

  return sendSuccess(res, review, 'Review posted successfully. Thank you for your feedback!', 201);
});

export const deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const review = await Review.findById(id);

  if (!review) return next(new AppError('Review not found.', 404));

  if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Unauthorized', 403));
  }

  await Review.findByIdAndDelete(id);
  return sendSuccess(res, null, 'Review deleted.');
});
