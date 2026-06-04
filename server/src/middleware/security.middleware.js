import rateLimit from "express-rate-limit";
import { body, param, query, validationResult } from "express-validator";

// ─── RATE LIMITERS ───────────────────────────────────────
// General rate limiter for admin APIs (500 requests per 15 minutes)
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
    retryAfter: 60 * 15 // 15 minutes in seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests too
});

// Strict rate limiter for sensitive operations (50 requests per hour)
export const strictRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 requests per hour
  message: {
    success: false,
    message: "Too many sensitive operations, please try again later.",
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── VALIDATION RULES ───────────────────────────────────

// Validate User ID parameter (UUID format)
export const validateUserId = [
  param("id")
    .isUUID(4)
    .withMessage("Invalid user ID format. Must be a valid UUID."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
      });
    }
    next();
  }
];

// Validate Job ID parameter
export const validateJobId = [
  param("id")
    .isUUID(4)
    .withMessage("Invalid job ID format. Must be a valid UUID."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
      });
    }
    next();
  }
];

// Validate search query parameters
export const validateSearchQuery = [
  query("search")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search term must be less than 100 characters")
    .matches(/^[a-zA-Z0-9\s\-_,.@]*$/)
    .withMessage("Search contains invalid characters"),
  
  query("page")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("Page must be between 1 and 1000")
    .toInt(),
  
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
  
  query("role")
    .optional()
    .isIn(["SEEKER", "EMPLOYER", "ADMIN", "ALL"])
    .withMessage("Invalid role filter"),
  
  query("status")
    .optional()
    .isIn(["ACTIVE", "CLOSED", "DRAFT", "PENDING", "REVIEWING", "SHORTLISTED", "ACCEPTED", "REJECTED", "ALL"])
    .withMessage("Invalid status filter"),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
      });
    }
    next();
  }
];

// Validate role filter
export const validateRoleFilter = [
  query("role")
    .optional()
    .isIn(["SEEKER", "EMPLOYER", "ADMIN", "ALL"])
    .withMessage("Role must be SEEKER, EMPLOYER, ADMIN, or ALL"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Validate status filter for applications
export const validateStatusFilter = [
  query("status")
    .optional()
    .isIn(["PENDING", "REVIEWING", "SHORTLISTED", "ACCEPTED", "REJECTED", "ALL"])
    .withMessage("Invalid application status"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Validate notification data
export const validateNotification = [
  body("recipientId")
    .notEmpty()
    .withMessage("Recipient ID is required")
    .isUUID(4)
    .withMessage("Invalid recipient ID format"),
  
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters")
    .matches(/^[a-zA-Z0-9\s\-_,.!?()]+$/)
    .withMessage("Title contains invalid characters"),
  
  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Message must be between 10 and 500 characters")
    .matches(/^[a-zA-Z0-9\s\-_,.!?()\n]+$/)
    .withMessage("Message contains invalid characters"),
  
  body("link")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Link must be less than 200 characters")
    .matches(/^[a-zA-Z0-9\s\-_./?=&]+$/)
    .withMessage("Link contains invalid characters"),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
      });
    }
    next();
  }
];

// Sanitize request body (XSS protection)
export const sanitizeBody = (req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === "string") {
        // Remove HTML tags and dangerous characters
        req.body[key] = req.body[key]
          .replace(/[<>]/g, "") // Remove < and >
          .replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;")
          .replace(/\//g, "&#x2F;")
          .trim();
      }
    }
  }
  next();
};

// Log all admin actions (for audit trail)
export const auditLog = (action) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    const adminId = req.user?.id;
    const adminEmail = req.user?.email;
    const targetId = req.params.id;
    const ip = req.ip;
    const userAgent = req.get("user-agent");
    
    // Store original json method
    res.json = function(data) {
      // Log after response is sent
      const logEntry = {
        timestamp: new Date().toISOString(),
        adminId,
        adminEmail,
        action,
        targetId,
        ip,
        userAgent,
        success: data?.success !== false,
        response: data
      };
      
      console.log("[AUDIT]", JSON.stringify(logEntry));
      
      // Call original json
      originalJson.call(this, data);
    };
    
    next();
  };
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  // Prevent XSS attacks
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Strict Transport Security (HTTPS only)
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  next();
};