import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getFeed, createPost, deletePost,
  toggleLike, addComment, getComments, getUserPosts,
} from "../controllers/feed.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads/")),
  filename: (req, file, cb) => {
    cb(null, `post-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error("Images only"));
  },
});

const router = express.Router();
router.use(authMiddleware);

router.get("/",                    getFeed);
router.post("/",                   upload.single("image"), createPost);
router.delete("/:id",              deletePost);
router.post("/:id/like",           toggleLike);
router.post("/:id/comment",        addComment);
router.get("/:id/comments",        getComments);
router.get("/user/:userId",        getUserPosts);

export default router;