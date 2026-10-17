import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Webhook endpoint (public with HMAC signature check in controller)
router.post('/webhook', handleWebhook);

// Protected payment actions
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);

export default router;
