import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import {
  getDashboard, getUsers, toggleUserStatus,
  deleteUser, getAllJobs, deleteJob,
  getAllApplications, sendNotification, approveEmployer, getJobById,
} from "../controllers/admin.controller.js";

// Import security middleware from the UPDATED file
import { 
  adminRateLimiter, 
  strictRateLimiter,
  validateUserId,
  validateSearchQuery,
  validateNotification,
  sanitizeBody,
  securityHeaders
} from "../middleware/security.middleware.js";

const router = express.Router();

// Apply security headers to all admin routes
router.use(securityHeaders);

// Apply authentication and role check to ALL admin routes
router.use(authMiddleware, roleMiddleware("ADMIN"));

// Apply rate limiting to all admin routes (protects from DDoS/brute force)
router.use(adminRateLimiter);

// ─── ADMIN ENDPOINTS ───

// Dashboard (no additional validation needed)
router.get("/dashboard", getDashboard);

// User Management
router.get("/users", validateSearchQuery, getUsers);
router.put("/users/:id/toggle", strictRateLimiter, validateUserId, toggleUserStatus);
router.put("/users/:id/approve", strictRateLimiter, validateUserId, approveEmployer);
router.delete("/users/:id", strictRateLimiter, validateUserId, deleteUser);

// Job Management
router.get("/jobs", validateSearchQuery, getAllJobs);
router.delete("/jobs/:id", strictRateLimiter, validateUserId, deleteJob);
router.get("/jobs/:id", getJobById);
// Application Management
router.get("/applications", validateSearchQuery, getAllApplications);

// Notifications
router.post("/notify", strictRateLimiter, sanitizeBody, validateNotification, sendNotification);

export default router;