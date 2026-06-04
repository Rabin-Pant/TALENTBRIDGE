import express from "express";
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
} from "../controllers/employer.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/jobs", getMyJobs);
router.post("/jobs", createJob);
router.put("/jobs/:id", updateJob);
router.delete("/jobs/:id", deleteJob);
router.get("/applicants", getApplications);
router.get("/applicants/:id", getApplicationById);
router.put("/applications/:id/status", updateApplicationStatus);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/notifications", getNotifications);
router.put("/notifications/mark-read", markNotificationsRead);
router.put("/notifications/:notificationId/read", markNotificationRead);
router.delete("/notifications/:notificationId", deleteNotification);
router.delete("/notifications", deleteAllNotifications);
router.put("/notifications/read-all", markAllNotificationsRead);

export default router;