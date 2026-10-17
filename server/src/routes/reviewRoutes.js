import express from 'express';
import {
  getItemReviews,
  createReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { reviewValidationRules } from '../middleware/validators.js';

const router = express.Router();

router.get('/:itemType/:itemId', getItemReviews);
router.post('/', protect, reviewValidationRules, createReview);
router.delete('/:id', protect, deleteReview);

export default router;
