import express from "express";
import path from "path";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { register, login, getMe } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ─── CUSTOM RATE LIMITER THAT ONLY COUNTS FAILED LOGINS ───
// This stores failed attempts in memory and resets on successful login
const failedAttempts = new Map();

const loginLimiter = async (req, res, next) => {
  const email = req.body.email?.toLowerCase();
  const ip = req.ip;
  const key = `${ip}-${email}`;
  
  const attempts = failedAttempts.get(key) || { count: 0, firstAttempt: Date.now() };
  
  // Reset if more than 15 minutes have passed
  if (Date.now() - attempts.firstAttempt > 15 * 60 * 1000) {
    attempts.count = 0;
    attempts.firstAttempt = Date.now();
  }
  
  // Check if blocked
  if (attempts.count >= 5) {
    const waitTime = Math.ceil((15 * 60 * 1000 - (Date.now() - attempts.firstAttempt)) / 1000 / 60);
    return res.status(429).json({ 
      message: `Too many failed login attempts. Please try again after ${waitTime} minutes.` 
    });
  }
  
  // Store attempts for potential failure
  req.rateLimitKey = key;
  req.rateLimitAttempts = attempts;
  next();
};

// Middleware to record failed attempt or clear on success
const handleLoginAttempt = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;
  
  res.json = function(data) {
    // Check if login was successful (has token in response)
    const isSuccess = data && data.token;
    
    if (isSuccess) {
      // On successful login, clear failed attempts for this email+IP
      const key = `${req.ip}-${req.body.email?.toLowerCase()}`;
      failedAttempts.delete(key);
      console.log(`Login successful - cleared failed attempts for ${req.body.email}`);
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      // On failed login, increment counter
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

// Rate limiter for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { message: "Too many registration attempts. Please try again after an hour." },
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

// ─── ROUTES ───
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, handleLoginAttempt, login);
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

// Optional: Endpoint to clear failed attempts (for testing)
router.post("/clear-login-attempts", (req, res) => {
  const email = req.body.email?.toLowerCase();
  const ip = req.ip;
  const key = `${ip}-${email}`;
  failedAttempts.delete(key);
  res.json({ message: "Login attempts cleared for this IP/email" });
});

export default router;