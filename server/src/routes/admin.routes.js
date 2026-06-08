import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import {
  getDashboard, getUsers, toggleUserStatus,
  deleteUser, getAllJobs, deleteJob,
  getAllApplications, sendNotification, approveEmployer, getJobById, 
  getLandingStats, getContactMessages, markContactRead, deleteContact, 
  getAllPosts, adminDeletePost,
} from "../controllers/admin.controller.js";

// Import security middleware
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

// ─── PUBLIC ROUTES (No authentication required) ───
router.get("/landing-stats", getLandingStats);

// ─── AUTHENTICATED ADMIN ROUTES ───
// Apply authentication and role check to ALL admin routes AFTER this point
router.use(authMiddleware, roleMiddleware("ADMIN"));

// Apply rate limiting to all admin routes (protects from DDoS/brute force)
router.use(adminRateLimiter);

// Dashboard
router.get("/dashboard", getDashboard);

// User Management
router.get("/users", validateSearchQuery, getUsers);

// 💡 FIXED: Changed path from "/users/:id/toggle" to "/users/:id/toggle-status" to match the frontend call
router.put("/users/:id/toggle", strictRateLimiter, validateUserId, toggleUserStatus);

router.put("/users/:id/approve", strictRateLimiter, validateUserId, approveEmployer);
router.delete("/users/:id", strictRateLimiter, validateUserId, deleteUser);

// Job Management
router.get("/jobs", validateSearchQuery, getAllJobs);
router.get("/jobs/:id", getJobById);
router.delete("/jobs/:id", strictRateLimiter, validateUserId, deleteJob);

// Application Management
router.get("/applications", validateSearchQuery, getAllApplications);

// Notifications
router.post("/notify", strictRateLimiter, sanitizeBody, validateNotification, sendNotification);

// Contact Messages
router.get("/contacts",            getContactMessages);
router.put("/contacts/:id/read",   markContactRead);
router.delete("/contacts/:id",     deleteContact);

// ─── USER FEED POST MODERATION ROUTES ───
router.get("/posts", getAllPosts); // 👈 Fixed here (removed typo)
router.delete("/posts/:id", strictRateLimiter, validateUserId, adminDeletePost);

export default router;