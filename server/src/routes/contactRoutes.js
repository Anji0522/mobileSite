import express from 'express';
import {
  submitContactMessage,
  getContactMessages,
  updateMessageStatus,
} from '../controllers/contactController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { contactValidationRules } from '../middleware/validators.js';

const router = express.Router();

router.post('/', contactValidationRules, submitContactMessage);
router.get('/', protect, restrictTo('admin'), getContactMessages);
router.patch('/:id', protect, restrictTo('admin'), updateMessageStatus);

export default router;
