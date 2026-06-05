import express from "express";
import upload from "../middleware/upload.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getJobs,
  getJobById,
  applyToJob,
  getMyApplications,
  getProfile,
  updateProfile,
  uploadResume,
  getNotifications,
  markNotificationsRead,
  markNotificationRead,
  deleteNotification,
  deleteAllNotifications,
  markAllNotificationsRead,
  updateContact,
  uploadProfilePicture,
  deleteProfilePicture,
  uploadCoverPicture,
  deleteCoverPicture,
} from "../controllers/seeker.controller.js";

const router = express.Router();
router.use(authMiddleware);

// Job routes
router.get("/jobs", getJobs);
router.get("/jobs/:id", getJobById);
router.post("/jobs/:id/apply", upload.single("resume"), applyToJob);

// Application routes
router.get("/applications", getMyApplications);

// Profile routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/resume", upload.single("resume"), uploadResume);
router.post("/profile-picture", upload.single("profilePicture"), uploadProfilePicture);
router.delete("/profile-picture", deleteProfilePicture);
router.post("/cover-picture", upload.single("coverPicture"), uploadCoverPicture);
router.delete("/cover-picture", deleteCoverPicture);
router.put("/contact", updateContact);

// Notification routes
router.get("/notifications", getNotifications);
router.put("/notifications/mark-read", markNotificationsRead);
router.put("/notifications/:notificationId/read", markNotificationRead);
router.delete("/notifications/:notificationId", deleteNotification);
router.delete("/notifications", deleteAllNotifications);
router.put("/notifications/read-all", markAllNotificationsRead);

export default router;