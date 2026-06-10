import express from "express";
import path from "path";
import multer from "multer";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  getMe,
  changePassword,
  checkEmail,
  resetPasswordDirect,
  submitContact,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Rate limiter setup
const failedAttempts = new Map();

const loginLimiter = async (req, res, next) => {
  const email = req.body.email?.toLowerCase();
  const ip = req.ip;
  const key = `${ip}-${email}`;
  
  const attempts = failedAttempts.get(key) || { count: 0, firstAttempt: Date.now() };
  
  if (Date.now() - attempts.firstAttempt > 15 * 60 * 1000) {
    attempts.count = 0;
    attempts.firstAttempt = Date.now();
  }
  
  if (attempts.count >= 5) {
    const waitTime = Math.ceil((15 * 60 * 1000 - (Date.now() - attempts.firstAttempt)) / 1000 / 60);
    return res.status(429).json({ 
      message: `Too many failed login attempts. Please try again after ${waitTime} minutes.` 
    });
  }
  
  req.rateLimitKey = key;
  req.rateLimitAttempts = attempts;
  next();
};

const handleLoginAttempt = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    const isSuccess = data && data.token;
    
    if (isSuccess) {
      const key = `${req.ip}-${req.body.email?.toLowerCase()}`;
      failedAttempts.delete(key);
      console.log(`Login successful - cleared failed attempts for ${req.body.email}`);
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      const attempts = failedAttempts.get(req.rateLimitKey);
      if (attempts) {
        attempts.count++;
        if (attempts.count === 1) attempts.firstAttempt = Date.now();
        failedAttempts.set(req.rateLimitKey, attempts);
        console.log(`Failed login attempt ${attempts.count}/5 for ${req.body.email}`);
      } else {
        const newAttempts = { count: 1, firstAttempt: Date.now() };
        failedAttempts.set(req.rateLimitKey, newAttempts);
      }
    }
    
    originalJson.call(this, data);
  };
  
  next();
};

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { message: "Too many registration attempts. Please try again after an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- EXTRA LAYER: Contact Form Rate Limiter ---
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 contact submissions per 15 minutes
  message: { message: "Too many messages sent from this IP. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/"));
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
    const uniqueName = `company-${Date.now()}-${cleanName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed"));
    }
  },
});

// ─── PUBLIC ROUTES (No authentication required) ───
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, handleLoginAttempt, login);
router.post("/check-email", checkEmail);
router.post("/reset-password-direct", resetPasswordDirect);
router.post("/contact", contactLimiter, submitContact); // Applied the contact rate-limiter layer

// ─── PROTECTED ROUTES (Authentication required) ───
router.put("/change-password", authMiddleware, changePassword);
router.get("/me", authMiddleware, getMe);
router.post("/upload-company-doc", upload.single("companyDocument"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ filename: req.file.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

router.post("/clear-login-attempts", (req, res) => {
  const email = req.body.email?.toLowerCase();
  const ip = req.ip;
  const key = `${ip}-${email}`;
  failedAttempts.delete(key);
  res.json({ message: "Login attempts cleared for this IP/email" });
});

export default router;