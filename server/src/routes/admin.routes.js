import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import {
  getDashboard, getUsers, toggleUserStatus,
  deleteUser, getAllJobs, deleteJob,
  getAllApplications, sendNotification, approveEmployer,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("ADMIN"));
router.put("/users/:id/approve", approveEmployer);
router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.put("/users/:id/toggle", toggleUserStatus);
router.delete("/users/:id", deleteUser);
router.get("/jobs", getAllJobs);
router.delete("/jobs/:id", deleteJob);
router.get("/applications", getAllApplications);
router.post("/notify", sendNotification);

export default router;