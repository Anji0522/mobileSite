import express from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  bookService,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
} from '../controllers/serviceController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Customer bookings
router.post('/book', protect, bookService);
router.get('/my/bookings', protect, getMyBookings);

// Provider bookings
router.get('/provider/bookings', protect, restrictTo('provider', 'admin'), getProviderBookings);
router.patch('/bookings/:id/status', protect, restrictTo('provider', 'admin'), updateBookingStatus);

// Service CRUD
router.post('/', protect, restrictTo('provider', 'admin'), createService);
router.put('/:id', protect, restrictTo('provider', 'admin'), updateService);
router.delete('/:id', protect, restrictTo('provider', 'admin'), deleteService);

export default router;
