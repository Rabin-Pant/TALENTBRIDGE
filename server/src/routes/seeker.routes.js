import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
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
} from "../controllers/seeker.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/jobs", getJobs);
router.get("/jobs/:id", getJobById);
router.post("/jobs/:id/apply", applyToJob);
router.get("/applications", getMyApplications);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/resume", upload.single("resume"), uploadResume);
router.get("/notifications", getNotifications);
router.put("/notifications/mark-read", markNotificationsRead);
router.put("/notifications/:notificationId/read", markNotificationRead);
router.delete("/notifications/:notificationId", deleteNotification);
router.delete("/notifications", deleteAllNotifications);
router.put("/notifications/read-all", markAllNotificationsRead);
router.put("/contact", updateContact);

export default router;