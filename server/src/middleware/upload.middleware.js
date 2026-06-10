import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configure storage based on file type
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/";
    
    if (file.fieldname === "resume") {
      uploadPath = "uploads/resumes/";
    } else if (file.fieldname === "image" || file.fieldname === "postImage") {
      uploadPath = "uploads/posts/";
    } else if (file.fieldname === "companyDocument") {
      uploadPath = "uploads/documents/";
    } else if (file.fieldname === "profilePicture" || file.fieldname === "coverPicture") {
      uploadPath = "uploads/profiles/";
    }
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${req.user?.id || Date.now()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter - STRICT VALIDATION ONLY
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const docExts = [".pdf", ".doc", ".docx"];
  const companyDocExts = [".pdf", ".jpg", ".jpeg", ".png"];

  if (file.fieldname === "profilePicture" || file.fieldname === "coverPicture" || file.fieldname === "image" || file.fieldname === "postImage") {
    if (imageExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed for this field"));
    }
  } else if (file.fieldname === "resume") {
    if (docExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed for resumes"));
    }
  } else if (file.fieldname === "companyDocument") {
    if (companyDocExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed for company documents"));
    }
  } else {
    // --- CRITICAL FIX: Reject unrecognized or unauthorized field uploads ---
    cb(new Error("Unauthorized or invalid upload field name"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export default upload;