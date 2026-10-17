import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  registerValidationRules,
  loginValidationRules,
  addressValidationRules,
} from '../middleware/validators.js';

const router = express.Router();

router.post('/register', registerValidationRules, register);
router.post('/login', loginValidationRules, login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.post('/address', protect, addressValidationRules, addAddress);
router.delete('/address/:addressId', protect, deleteAddress);

export default router;
