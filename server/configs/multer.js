import multer from "multer";

// Multer config for image uploads (for thumbnails)
const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage for serverless compatibility
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for image files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Multer config for video uploads (use memory storage for serverless compatibility)
export const videoUpload = multer({
  storage: multer.memoryStorage(), // Use memory storage for serverless compatibility
  // No fileSize limit for video files
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  }
});

export default upload;