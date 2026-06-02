import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";
import {
  getDashboard,
  getJobs,
  getJobById,
  applyToJob,
  getMyApplications,
  getProfile,
  updateProfile,
  uploadResume,
  getNotifications,
} from "../controllers/seeker.controller.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("SEEKER"));

router.get("/dashboard", getDashboard);
router.get("/jobs", getJobs);
router.get("/jobs/:id", getJobById);
router.post("/jobs/:id/apply", applyToJob);
router.get("/applications", getMyApplications);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/resume", upload.single("resume"), uploadResume);
router.get("/notifications", getNotifications);

export default router;