import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";

// 1. Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Set up Multer Memory Storage (Crucial for platforms like Render)
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed"));
    }
  },
});

// 3. Centralized Upload Function for all routes
export const uploadToCloudinary = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: `talentbridge/${folderName}`, 
        resource_type: "auto" // Handles images AND PDFs automatically
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url); // Returns the permanent live HTTPS link
      }
    );
    
    uploadStream.end(fileBuffer);
  });
};