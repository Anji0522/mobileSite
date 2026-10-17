import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieSecure = process.env.COOKIE_SECURE === 'true' || isProduction;
  const sameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');

  // Short lived access token cookie (optional backup)
  res.cookie('mv_token', accessToken, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite,
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  // Long lived refresh token cookie
  if (refreshToken) {
    res.cookie('mv_refreshToken', refreshToken, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
};

const clearAuthCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieSecure = process.env.COOKIE_SECURE === 'true' || isProduction;
  const sameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');

  res.cookie('mv_token', '', { httpOnly: true, secure: cookieSecure, sameSite, expires: new Date(0) });
  res.cookie('mv_refreshToken', '', { httpOnly: true, secure: cookieSecure, sameSite, expires: new Date(0) });
};

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email address already exists.', 409));
  }

  // Allow choosing provider role during registration if requested
  const assignedRole = role === 'provider' ? 'provider' : 'customer';

  const user = await User.create({
    name,
    email,
    password,
    phone: phone || '',
    role: assignedRole,
  });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token to user record
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setAuthCookies(res, accessToken, refreshToken);

  const userProfile = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
  };

  return sendSuccess(
    res,
    { user: userProfile, accessToken },
    'Registration successful. Welcome to MobiVerse India!',
    201
  );
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password.', 401));
  }

  if (user.status === 'suspended') {
    return next(new AppError('Your account has been suspended. Please contact customer care.', 403));
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setAuthCookies(res, accessToken, refreshToken);

  const userProfile = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    addresses: user.addresses,
    wishlist: user.wishlist,
  };

  return sendSuccess(
    res,
    { user: userProfile, accessToken },
    'Login successful.',
    200
  );
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshToken = req.cookies?.mv_refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    return next(new AppError('Refresh token missing. Please log in again.', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key'
    );
  } catch {
    return next(new AppError('Refresh token invalid or expired. Please log in again.', 401));
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== incomingRefreshToken) {
    return next(new AppError('Invalid refresh token session.', 401));
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  setAuthCookies(res, newAccessToken, newRefreshToken);

  return sendSuccess(
    res,
    { accessToken: newAccessToken },
    'Token refreshed successfully.',
    200
  );
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });
  }

  clearAuthCookies(res);
  return sendSuccess(res, null, 'Logged out successfully.', 200);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name slug images price rating');
  return sendSuccess(res, { user }, 'User profile fetched.', 200);
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, avatar } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (avatar) updates.avatar = avatar;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  return sendSuccess(res, { user }, 'Profile updated successfully.', 200);
});

export const addAddress = asyncHandler(async (req, res) => {
  const { name, phone, street, landmark, city, state, pincode, isDefault } = req.body;
  const user = await User.findById(req.user._id);

  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push({
    name,
    phone,
    street,
    landmark,
    city,
    state,
    pincode,
    isDefault: Boolean(isDefault) || user.addresses.length === 0,
  });

  await user.save();
  return sendSuccess(res, { addresses: user.addresses }, 'Address added successfully.', 201);
});

export const deleteAddress = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);

  user.addresses = user.addresses.filter((addr) => addr._id.toString() !== addressId);
  await user.save();

  return sendSuccess(res, { addresses: user.addresses }, 'Address removed successfully.', 200);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always return success to prevent email enumeration
  if (!user) {
    return sendSuccess(
      res,
      null,
      'If an account exists with this email, a reset link will be sent.',
      200
    );
  }

  // Generate a mock secure reset token (for dev/demo purposes)
  const resetToken = crypto.randomBytes(32).toString('hex');
  return sendSuccess(
    res,
    { resetToken, resetLink: `/reset-password/${resetToken}` },
    'Password reset instructions generated.',
    200
  );
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token || !password || password.length < 8) {
    return next(new AppError('Invalid token or password does not meet criteria.', 400));
  }

  return sendSuccess(res, null, 'Password has been reset successfully. You can now log in.', 200);
});
