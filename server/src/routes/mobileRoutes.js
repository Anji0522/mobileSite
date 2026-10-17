import express from 'express';
import {
  getAllMobiles,
  getMobileBySlug,
  compareMobiles,
  getFeaturedCategories,
  createMobile,
  updateMobile,
  deleteMobile,
} from '../controllers/mobileController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllMobiles);
router.get('/featured', getFeaturedCategories);
router.get('/compare', compareMobiles);
router.get('/:slug', getMobileBySlug);

// Protected routes
router.post('/', protect, restrictTo('provider', 'admin'), createMobile);
router.put('/:id', protect, restrictTo('provider', 'admin'), updateMobile);
router.delete('/:id', protect, restrictTo('admin'), deleteMobile);

export default router;
