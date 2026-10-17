import express from 'express';
import {
  getAllAccessories,
  getAccessoryBySlug,
  createAccessory,
  updateAccessory,
  deleteAccessory,
} from '../controllers/accessoryController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllAccessories);
router.get('/:slug', getAccessoryBySlug);

// Protected
router.post('/', protect, restrictTo('admin', 'provider'), createAccessory);
router.put('/:id', protect, restrictTo('admin', 'provider'), updateAccessory);
router.delete('/:id', protect, restrictTo('admin'), deleteAccessory);

export default router;
