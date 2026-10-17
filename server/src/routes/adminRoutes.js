import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllProviders,
  verifyProvider,
  getPendingListings,
  approveListing,
  triggerPriceSyncNow,
  getPriceHistory,
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Strict Admin-only middleware guard
router.use(protect, restrictTo('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id', updateUserStatus);
router.get('/providers', getAllProviders);
router.patch('/providers/:id', verifyProvider);
router.get('/catalogue/pending', getPendingListings);
router.patch('/catalogue/:id/approve', approveListing);
router.post('/price-sync/trigger', triggerPriceSyncNow);
router.get('/price-sync/history', getPriceHistory);

export default router;
