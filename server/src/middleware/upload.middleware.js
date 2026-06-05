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
    } else if (file.fieldname === "profilePicture") {
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

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === "profilePicture") {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed for profile picture"));
    }
  } else if (file.fieldname === "resume") {
    const allowed = [".pdf", ".doc", ".docx"];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX files are allowed for resume"));
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;