import { Mobile } from '../models/Mobile.js';
import { Accessory } from '../models/Accessory.js';
import { Review } from '../models/Review.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getAllMobiles = asyncHandler(async (req, res) => {
  const {
    q,
    brand,
    minPrice,
    maxPrice,
    ram,
    storage,
    has5G,
    minRating,
    status,
    isDeal,
    isFeatured,
    isTrending,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const query = {};

  // Status filter (default to 'available' unless specifically asked or admin)
  if (status) {
    query.status = status;
  } else {
    query.status = { $in: ['available', 'upcoming'] };
  }

  // Text / Keyword Search
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { brandName: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } },
    ];
  }

  // Brand filter
  if (brand) {
    const brandsList = brand.split(',').map((b) => new RegExp(`^${b.trim()}$`, 'i'));
    query.brandName = { $in: brandsList };
  }

  // Price range
  if (minPrice || maxPrice) {
    query['price.current'] = {};
    if (minPrice) query['price.current'].$gte = Number(minPrice);
    if (maxPrice) query['price.current'].$lte = Number(maxPrice);
  }

  // RAM filter
  if (ram) {
    const ramsList = ram.split(',').map((r) => new RegExp(r.trim(), 'i'));
    query['specs.memory.ram'] = { $in: ramsList };
  }

  // Storage filter
  if (storage) {
    const storagesList = storage.split(',').map((s) => new RegExp(s.trim(), 'i'));
    query['specs.memory.storage'] = { $in: storagesList };
  }

  // 5G Network
  if (has5G !== undefined) {
    query['specs.network.has5G'] = has5G === 'true' || has5G === true;
  }

  // Rating
  if (minRating) {
    query['rating.avg'] = { $gte: Number(minRating) };
  }

  // Special flags
  if (isDeal === 'true') query.isDeal = true;
  if (isFeatured === 'true') query.isFeatured = true;
  if (isTrending === 'true') query.isTrending = true;

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { 'price.current': 1 };
  else if (sort === 'price_desc') sortOption = { 'price.current': -1 };
  else if (sort === 'rating_desc') sortOption = { 'rating.avg': -1 };
  else if (sort === 'newest') sortOption = { launchDate: -1 };
  else if (sort === 'popular') sortOption = { 'rating.count': -1, 'rating.avg': -1 };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [mobiles, total] = await Promise.all([
    Mobile.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
    Mobile.countDocuments(query),
  ]);

  return sendSuccess(
    res,
    mobiles,
    'Mobiles retrieved successfully.',
    200,
    {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    }
  );
});

export const getMobileBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const mobile = await Mobile.findOne({ slug }).populate('brand');
  if (!mobile) {
    return next(new AppError(`No mobile phone found with slug "${slug}".`, 404));
  }

  // Fetch compatible accessories
  const accessories = await Accessory.find({
    $or: [
      { compatibleMobiles: mobile._id },
      { compatibleBrands: mobile.brandName },
    ],
  })
    .limit(8)
    .lean();

  // Fetch similar phones (same brand or close price)
  const priceMin = mobile.price.current * 0.75;
  const priceMax = mobile.price.current * 1.25;

  const similarMobiles = await Mobile.find({
    _id: { $ne: mobile._id },
    status: 'available',
    $or: [
      { brandName: mobile.brandName },
      { 'price.current': { $gte: priceMin, $lte: priceMax } },
    ],
  })
    .limit(6)
    .lean();

  // Fetch recent customer reviews
  const reviews = await Review.find({
    itemType: 'mobile',
    item: mobile._id,
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return sendSuccess(
    res,
    {
      mobile,
      accessories,
      similarMobiles,
      reviews,
    },
    'Mobile details retrieved successfully.'
  );
});

export const compareMobiles = asyncHandler(async (req, res, next) => {
  const { slugs } = req.query;
  if (!slugs) {
    return next(new AppError('Please specify slugs of mobiles to compare (e.g. ?slugs=s24-ultra,iphone-15-pro)', 400));
  }

  const slugList = slugs.split(',').map((s) => s.trim().toLowerCase());
  const mobiles = await Mobile.find({ slug: { $in: slugList } }).lean();

  return sendSuccess(res, mobiles, 'Comparison data retrieved successfully.');
});

export const getFeaturedCategories = asyncHandler(async (req, res) => {
  const [deals, trending, newLaunches] = await Promise.all([
    Mobile.find({ isDeal: true, status: 'available' }).limit(8).lean(),
    Mobile.find({ isTrending: true, status: 'available' }).limit(8).lean(),
    Mobile.find({ status: 'available' }).sort({ launchDate: -1 }).limit(8).lean(),
  ]);

  return sendSuccess(
    res,
    { deals, trending, newLaunches },
    'Featured phones fetched.'
  );
});

export const createMobile = asyncHandler(async (req, res) => {
  const status = req.user.role === 'admin' ? 'available' : 'pending_review';
  const mobileData = {
    ...req.body,
    status,
    addedBy: req.user._id,
  };

  const mobile = await Mobile.create(mobileData);
  return sendSuccess(
    res,
    mobile,
    req.user.role === 'admin'
      ? 'Mobile listed successfully.'
      : 'Listing submitted for admin verification.',
    201
  );
});

export const updateMobile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  let mobile = await Mobile.findById(id);
  if (!mobile) {
    return next(new AppError('Mobile not found.', 404));
  }

  // If provider, ensure they can only update their seller offering or their created listing
  if (req.user.role === 'provider' && mobile.addedBy?.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only update listings that you created.', 403));
  }

  mobile = await Mobile.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  return sendSuccess(res, mobile, 'Mobile listing updated successfully.');
});

export const deleteMobile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const mobile = await Mobile.findByIdAndDelete(id);

  if (!mobile) {
    return next(new AppError('Mobile not found.', 404));
  }

  return sendSuccess(res, null, 'Mobile listing deleted successfully.', 200);
});
