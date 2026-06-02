import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import {
  getDashboard,
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
} from "../controllers/employer.controller.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("EMPLOYER"));

router.get("/dashboard", getDashboard);
router.get("/jobs", getMyJobs);
router.post("/jobs", createJob);
router.put("/jobs/:id", updateJob);
router.delete("/jobs/:id", deleteJob);
router.get("/applications", getApplications);
router.get("/applications/:id", getApplicationById);
router.put("/applications/:id/status", updateApplicationStatus);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/notifications", getNotifications);

export default router;