import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error for debugging in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('💥 Error Stack:', err.stack || err);
  }

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    return sendError(res, message, 404);
  }

  // Handle Mongoose Duplicate Key (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    return sendError(res, message, 409);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    return sendError(res, 'Validation failed', 422, errors);
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authorization token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Your session has expired. Please log in again.', 401);
  }

  // Custom AppError
  if (err.isOperational) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // Unhandled / Generic Errors (Do not leak internal details in production)
  const isProd = process.env.NODE_ENV === 'production';
  const responseMessage = isProd ? 'Internal server error. Something went wrong.' : (err.message || 'Server error');
  return sendError(res, responseMessage, error.statusCode || 500);
};
