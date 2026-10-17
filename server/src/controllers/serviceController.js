import { Service } from '../models/Service.js';
import { Booking } from '../models/Booking.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getAllServices = asyncHandler(async (req, res) => {
  const { category, city, q } = req.query;
  const query = { isActive: true };

  if (category) query.category = category;
  if (city) query.city = new RegExp(`^${city}$`, 'i');
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { supportedBrands: { $in: [new RegExp(q, 'i')] } },
    ];
  }

  const services = await Service.find(query).sort({ 'rating.avg': -1 }).lean();
  return sendSuccess(res, services, 'Services retrieved successfully.');
});

export const getServiceById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const service = await Service.findById(id).populate('provider', 'name email phone avatar');

  if (!service) {
    return next(new AppError('Service not found.', 404));
  }

  return sendSuccess(res, service, 'Service details retrieved.');
});

export const createService = asyncHandler(async (req, res) => {
  const service = await Service.create({
    ...req.body,
    provider: req.user._id,
    providerName: req.user.name,
  });

  return sendSuccess(res, service, 'Service created successfully.', 201);
});

export const updateService = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const service = await Service.findById(id);

  if (!service) return next(new AppError('Service not found.', 404));

  if (req.user.role !== 'admin' && service.provider.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to update this service.', 403));
  }

  const updated = await Service.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  return sendSuccess(res, updated, 'Service updated successfully.');
});

export const deleteService = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const service = await Service.findById(id);

  if (!service) return next(new AppError('Service not found.', 404));

  if (req.user.role !== 'admin' && service.provider.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to delete this service.', 403));
  }

  await Service.findByIdAndDelete(id);
  return sendSuccess(res, null, 'Service deleted successfully.');
});

// Bookings
export const bookService = asyncHandler(async (req, res, next) => {
  const { serviceId, deviceModel, issueDescription, appointmentDate, appointmentSlot, serviceAddress } = req.body;

  const service = await Service.findById(serviceId);
  if (!service) {
    return next(new AppError('Service not found.', 404));
  }

  const booking = await Booking.create({
    service: service._id,
    customer: req.user._id,
    provider: service.provider,
    deviceModel,
    issueDescription,
    appointmentDate: new Date(appointmentDate),
    appointmentSlot,
    serviceAddress: serviceAddress || {
      street: req.user.addresses?.[0]?.street || 'Doorstep Service',
      city: service.city,
      pincode: req.user.addresses?.[0]?.pincode || '560001',
      phone: req.user.phone,
    },
    estimatedPrice: service.basePrice,
  });

  return sendSuccess(res, booking, 'Repair booking scheduled successfully!', 201);
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ customer: req.user._id })
    .populate('service', 'title category basePrice images city')
    .sort({ createdAt: -1 })
    .lean();

  return sendSuccess(res, bookings, 'Your bookings retrieved.');
});

export const getProviderBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ provider: req.user._id })
    .populate('service', 'title category basePrice')
    .populate('customer', 'name email phone')
    .sort({ createdAt: -1 })
    .lean();

  return sendSuccess(res, bookings, 'Provider bookings retrieved.');
});

export const updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, finalPrice, notes } = req.body;

  const booking = await Booking.findById(id);
  if (!booking) return next(new AppError('Booking not found.', 404));

  if (status) booking.status = status;
  if (finalPrice !== undefined) booking.finalPrice = finalPrice;
  if (notes) booking.notes = notes;

  await booking.save();
  return sendSuccess(res, booking, 'Booking status updated.');
});
