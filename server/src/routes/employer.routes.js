import express from "express";
import upload from "../middleware/upload.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getMyJobs,
  createJob,
  updateJob,
  deleteJob,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationsRead,
  markNotificationRead,
  deleteNotification,
  deleteAllNotifications,
  markAllNotificationsRead,
  uploadProfilePicture,
  deleteProfilePicture,
  uploadCoverPicture,
  deleteCoverPicture,
} from "../controllers/employer.controller.js";

const router = express.Router();
router.use(authMiddleware);

// Job routes
router.get("/jobs", getMyJobs);
router.post("/jobs", createJob);
router.put("/jobs/:id", updateJob);
router.delete("/jobs/:id", deleteJob);

// Application routes
router.get("/applicants", getApplications);
router.get("/applicants/:id", getApplicationById);
router.put("/applications/:id/status", updateApplicationStatus);

// Profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/profile-picture", upload.single("profilePicture"), uploadProfilePicture);
router.delete("/profile-picture", deleteProfilePicture);
router.post("/cover-picture", upload.single("coverPicture"), uploadCoverPicture);
router.delete("/cover-picture", deleteCoverPicture);

// Notification routes
router.get("/notifications", getNotifications);
router.put("/notifications/mark-read", markNotificationsRead);
router.put("/notifications/:notificationId/read", markNotificationRead);
router.delete("/notifications/:notificationId", deleteNotification);
router.delete("/notifications", deleteAllNotifications);
router.put("/notifications/read-all", markAllNotificationsRead);

export default router;