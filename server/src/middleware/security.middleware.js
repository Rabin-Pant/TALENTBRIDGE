import rateLimit from 'express-rate-limit';
import { body, query, validationResult } from 'express-validator';

// Rate limiter for admin APIs
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for sensitive operations
export const strictRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 requests per hour
  message: 'Too many sensitive operations, please try again later.',
});

// Validate user ID parameter
export const validateUserId = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validate search query
export const validateSearchQuery = [
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .matches(/^[a-zA-Z0-9\s\-_,.@]*$/)
    .withMessage('Search contains invalid characters'),
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];