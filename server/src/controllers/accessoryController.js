import { Accessory } from '../models/Accessory.js';
import { Mobile } from '../models/Mobile.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getAllAccessories = asyncHandler(async (req, res) => {
  const {
    q,
    type,
    brand,
    mobileSlug,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const query = {};

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { brand: { $regex: q, $options: 'i' } },
      { type: { $regex: q, $options: 'i' } },
    ];
  }

  if (type) {
    const types = type.split(',').map((t) => t.trim());
    query.type = { $in: types };
  }

  if (brand) {
    const brands = brand.split(',').map((b) => new RegExp(`^${b.trim()}$`, 'i'));
    query.brand = { $in: brands };
  }

  if (mobileSlug) {
    const mobile = await Mobile.findOne({ slug: mobileSlug });
    if (mobile) {
      query.$or = [
        { compatibleMobiles: mobile._id },
        { compatibleBrands: mobile.brandName },
      ];
    }
  }

  if (minPrice || maxPrice) {
    query['price.current'] = {};
    if (minPrice) query['price.current'].$gte = Number(minPrice);
    if (maxPrice) query['price.current'].$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { 'price.current': 1 };
  else if (sort === 'price_desc') sortOption = { 'price.current': -1 };
  else if (sort === 'rating_desc') sortOption = { 'rating.avg': -1 };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [accessories, total] = await Promise.all([
    Accessory.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
    Accessory.countDocuments(query),
  ]);

  return sendSuccess(
    res,
    accessories,
    'Accessories retrieved successfully.',
    200,
    {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    }
  );
});

export const getAccessoryBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const accessory = await Accessory.findOne({ slug }).populate('compatibleMobiles', 'name slug images price');

  if (!accessory) {
    return next(new AppError(`No accessory found with slug "${slug}".`, 404));
  }

  return sendSuccess(res, accessory, 'Accessory details retrieved.');
});

export const createAccessory = asyncHandler(async (req, res) => {
  const accessory = await Accessory.create(req.body);
  return sendSuccess(res, accessory, 'Accessory added successfully.', 201);
});

export const updateAccessory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const accessory = await Accessory.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!accessory) {
    return next(new AppError('Accessory not found.', 404));
  }

  return sendSuccess(res, accessory, 'Accessory updated successfully.');
});

export const deleteAccessory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const accessory = await Accessory.findByIdAndDelete(id);

  if (!accessory) {
    return next(new AppError('Accessory not found.', 404));
  }

  return sendSuccess(res, null, 'Accessory deleted successfully.');
});
