import { body, validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return sendError(res, 'Validation failed. Please correct the highlighted errors.', 422, formattedErrors);
  }
  next();
};

export const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()[\]{}+=\-_`~|:;"'<>,./]).*$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^(?:(?:\+91)|(?:91)|0)?[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian phone number starting with 6-9'),
  body('role')
    .optional()
    .isIn(['customer', 'provider', 'admin'])
    .withMessage('Role must be customer, provider, or admin'),
  validateRequest,
];

export const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest,
];

export const addressValidationRules = [
  body('name').trim().notEmpty().withMessage('Recipient name is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Contact phone number is required')
    .matches(/^(?:(?:\+91)|(?:91)|0)?[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian phone number'),
  body('street').trim().notEmpty().withMessage('Street / Flat / Building is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('pincode')
    .trim()
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Please enter a valid 6-digit Indian PIN code'),
  validateRequest,
];

export const contactValidationRules = [
  body('name').trim().notEmpty().withMessage('Your name is required'),
  body('email').trim().isEmail().withMessage('A valid email address is required'),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^(?:(?:\+91)|(?:91)|0)?[6-9]\d{9}$/)
    .withMessage('Please enter a valid Indian mobile number'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters long'),
  validateRequest,
];

export const reviewValidationRules = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5 stars'),
  body('comment')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Review comment must be between 5 and 1000 characters'),
  validateRequest,
];
