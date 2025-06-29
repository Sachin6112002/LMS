import express from 'express'
import cors from 'cors'
import multer from 'multer'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import cloudinary from './configs/cloudinary.js' // updated import, no function call
import userRouter from './routes/userRoutes.js'
import educatorRouter from './routes/educatorRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import path from 'path';
import { fileURLToPath } from 'url';
import testimonialRoutes from './routes/testimonialRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import courseRouter from './routes/courseRoute.js';
import User from './models/User.js';

// Initialize Express
const app = express()

// Connect to database
await connectDB()
// cloudinary config is imported and runs on import, no need to call a function

// EMERGENCY CORS FIX - Handle ALL requests first
app.use((req, res, next) => {
  // Set CORS headers for ALL requests
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000', 
    'http://localhost:5174',
    'https://lms-admin-theta-two.vercel.app',
    'https://lms-client-coral-rho.vercel.app'
  ];
  
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from origin: ${req.headers.origin}`);
  
  // Handle OPTIONS requests immediately - CRITICAL FIX
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request handled immediately for:', req.path);
    return res.status(200).end();
  }
  
  next();
});

// Middlewares
// Simplified CORS configuration
app.use(cors({
  origin: true, // Allow all origins for debugging
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Register webhook route FIRST, before any body parser
app.use('/api/webhook', webhookRoutes);

// Add early 413 error handling middleware 
app.use((err, req, res, next) => {
  if (err.status === 413 || err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large. Maximum file size is 8MB for videos.',
      maxSize: '8MB'
    });
  }
  next(err);
});

// Now add body parsers for the rest of the app with limits suitable for Vercel
app.use(express.json({ limit: '8mb' })); // 8MB JSON payload limit (Vercel compatible)
app.use(express.urlencoded({ extended: true, limit: '8mb' })); // 8MB URL-encoded payload limit

// Serve uploaded videos statically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// Serve favicon.ico statically if present
app.use('/favicon.ico', express.static(path.join(__dirname, 'favicon.ico')));

// Global error handler for payload too large and multer errors
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large' || err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File is too large. Maximum size allowed is 8MB for videos. Please compress your video or use a smaller file.',
      maxSize: '8MB'
    });
  }
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'Video file is too large. Maximum size allowed is 8MB. Please compress your video.',
        maxSize: '8MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + err.message
    });
  }
  
  next(err);
});

// Routes
app.get('/', (req, res) => res.send("API Working"))

// EMERGENCY DIRECT ROUTE - bypassing educatorRouter import issue
app.post('/api/educator/add-lecture-cloudinary', async (req, res) => {
  try {
    console.log('EMERGENCY ROUTE HIT: /api/educator/add-lecture-cloudinary');
    console.log('Request body:', req.body);
    
    // Import the controller function dynamically
    const { addLectureWithCloudinaryUrl } = await import('./controllers/educatorController.js');
    
    // Apply middleware manually
    const { jwtMiddleware } = await import('./middlewares/jwtMiddleware.js');
    const { protectEducator } = await import('./middlewares/authMiddleware.js');
    
    // Run middleware
    jwtMiddleware(req, res, (err) => {
      if (err) return res.status(401).json({ success: false, message: 'JWT middleware failed' });
      
      protectEducator(req, res, (err) => {
        if (err) return res.status(403).json({ success: false, message: 'Educator protection failed' });
        
        // Call the actual controller function
        addLectureWithCloudinaryUrl(req, res);
      });
    });
    
  } catch (error) {
    console.error('Emergency route error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

app.use('/api/educator', educatorRouter)
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)
app.use('/api/testimonials', testimonialRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/course', courseRouter)

// Handle favicon.ico requests gracefully to avoid 500 errors
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Port
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('>>>> LMS server startup log: This is the latest code running.');
})