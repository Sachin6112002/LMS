import multer from "multer";

// Multer config for image uploads (for thumbnails)
const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage for serverless compatibility
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Multer config for video uploads (no file size limit, only video files)
export const videoUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'videos/'); // Store in /videos (make sure this folder exists and is not public)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  }),
  // No fileSize limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  }
});

export default upload;