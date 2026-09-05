import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { searchUsers, searchPosts, searchJobs } from "../controllers/search.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/users", searchUsers);
router.get("/posts", searchPosts);
router.get("/jobs", searchJobs);

export default router;