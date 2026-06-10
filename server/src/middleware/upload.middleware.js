import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// 1. Initialize Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Set up Multer Memory Storage (files are kept temporarily in RAM buffer)
const storage = multer.memoryStorage();

// 3. File filter - PRESERVED STRICT VALIDATION LAYER
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const docExts = [".pdf", ".doc", ".docx"];
  const companyDocExts = [".pdf", ".jpg", ".jpeg", ".png"];

  if (
    file.fieldname === "profilePicture" || 
    file.fieldname === "coverPicture" || 
    file.fieldname === "image" || 
    file.fieldname === "postImage"
  ) {
    if (imageExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed for this field"), false);
    }
  } else if (file.fieldname === "resume") {
    if (docExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed for resumes"), false);
    }
  } else if (file.fieldname === "companyDocument") {
    if (companyDocExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed for company documents"), false);
    }
  } else {
    // --- CRITICAL FIX: Reject unrecognized or unauthorized field uploads ---
    cb(new Error("Unauthorized or invalid upload field name"), false);
  }
};

// 4. Initialize Multer Instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// 5. Centralized Cloudinary Upload Stream Helper
export const uploadToCloudinary = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: `talentbridge/${folderName}`, 
        resource_type: "auto" // Automatically handles raw documents (PDF/DOC) and pictures
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url); // Returns the persistent live HTTPS link
      }
    );
    
    uploadStream.end(fileBuffer);
  });
};

export default upload;