import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { searchUsers } from "../controllers/search.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/users", searchUsers);

export default router;