import { Brand } from '../models/Brand.js';
import { Mobile } from '../models/Mobile.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find().sort({ isFeatured: -1, name: 1 }).lean();
  return sendSuccess(res, brands, 'Brands fetched successfully.');
});

export const getBrandBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const brand = await Brand.findOne({ slug });

  if (!brand) {
    return next(new AppError(`Brand "${slug}" not found.`, 404));
  }

  const mobiles = await Mobile.find({ brandName: new RegExp(`^${brand.name}$`, 'i'), status: 'available' })
    .sort({ launchDate: -1 })
    .lean();

  return sendSuccess(res, { brand, mobiles }, 'Brand and products fetched.');
});

export const createBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.create(req.body);
  return sendSuccess(res, brand, 'Brand created successfully.', 201);
});

export const updateBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await Brand.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!brand) return next(new AppError('Brand not found.', 404));
  return sendSuccess(res, brand, 'Brand updated successfully.');
});

export const deleteBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await Brand.findByIdAndDelete(id);
  if (!brand) return next(new AppError('Brand not found.', 404));
  return sendSuccess(res, null, 'Brand deleted successfully.');
});
