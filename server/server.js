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

// Test: Add a direct route to verify routing is working
console.log('Adding direct educator test route...');

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
    'https://lms-client-coral-rho.vercel.app',
    'https://lms-client-one-lemon.vercel.app' // <-- ADD YOUR FRONTEND HERE
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from origin: ${req.headers.origin}`);
  console.log('CORS allowed for:', allowedOrigins.includes(origin) ? origin : 'NOT ALLOWED');
  
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
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'https://lms-admin-theta-two.vercel.app',
      'https://lms-client-coral-rho.vercel.app',
      'https://lms-client-one-lemon.vercel.app'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// SIMPLE TEST ROUTE - to verify deployment is working
app.get('/api/test-deployment', (req, res) => {
  res.json({ success: true, message: 'Deployment is working!', timestamp: new Date().toISOString() });
});

app.use('/api/educator', (req, res, next) => {
  console.log(`>>>> /api/educator${req.url} route hit - Method: ${req.method}`);
  if (req.url.startsWith('/add-course')) {
    console.log('>>>> /api/educator/add-course route hit');
  }
  if (req.url.startsWith('/add-lecture-cloudinary')) {
    console.log('>>>> /api/educator/add-lecture-cloudinary route hit - this should work!');
  }
  next();
}, educatorRouter)
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)
app.use('/api/testimonials', testimonialRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/course', courseRouter)

// DIRECT TEST ROUTE - to verify if ANY educator routes work
app.get('/api/educator/direct-test', (req, res) => {
  res.json({ success: true, message: 'Direct educator route works!', timestamp: new Date().toISOString() });
});

// Handle favicon.ico requests gracefully to avoid 500 errors
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Port
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('>>>> LMS server startup log: This is the latest code running.');
})