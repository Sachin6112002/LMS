// Test script to verify file upload limits
import express from 'express';
import multer from 'multer';
import 'dotenv/config';

const app = express();

// Configure multer with same settings as production
const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  }
});

// Body parser with same limits
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Error handler
app.use((err, req, res, next) => {
  console.log('Error caught:', err.message, err.code, err.type);
  
  if (err.type === 'entity.too.large' || err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File is too large. Maximum size allowed is 15MB.',
      error: err.message,
      code: err.code || err.type
    });
  }
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + err.message,
      code: err.code
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error: ' + err.message
  });
});

// Test endpoint
app.post('/test-upload', videoUpload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  res.json({
    success: true,
    message: 'File uploaded successfully',
    fileInfo: {
      name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      sizeInMB: (req.file.size / 1024 / 1024).toFixed(2)
    }
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'File upload test server running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Test file upload limits:');
  console.log('- JSON/URL-encoded: 15MB');
  console.log('- Video files: 15MB');
  console.log('- Send POST to /test-upload with file field');
});
