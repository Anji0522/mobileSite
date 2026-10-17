import express from 'express';
import {
  getAllBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllBrands);
router.get('/:slug', getBrandBySlug);

// Protected
router.post('/', protect, restrictTo('admin'), createBrand);
router.put('/:id', protect, restrictTo('admin'), updateBrand);
router.delete('/:id', protect, restrictTo('admin'), deleteBrand);

export default router;
