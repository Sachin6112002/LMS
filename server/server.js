import express from 'express'
import cors from 'cors'
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

// Initialize Express
const app = express()

// Connect to database
await connectDB()
// cloudinary config is imported and runs on import, no need to call a function

// Middlewares
app.use((req, res, next) => {
  console.log('CORS DEBUG: Incoming origin:', req.headers.origin);
  console.log('CORS DEBUG: Request method:', req.method);
  console.log('CORS DEBUG: Request path:', req.path);
  next();
});

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Always allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      console.log('CORS DEBUG: No origin, allowing request');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://lms-client-one-lemon.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://lms-admin-blond.vercel.app'
    ];
    
    console.log('CORS DEBUG: Origin check:', origin);
    console.log('CORS DEBUG: Allowed origins:', allowedOrigins);
    
    // Allow all origins for debugging - this should fix immediate CORS issues
    console.log('CORS DEBUG: Allowing all origins for debugging');
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
}));

// Handle all OPTIONS preflight requests FIRST - this is critical for CORS
app.options('*', (req, res) => {
  console.log('OPTIONS request received for:', req.path);
  console.log('Origin:', req.headers.origin);
  
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  return res.status(200).end();
});

// Global CORS headers as fallback for all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} from origin: ${req.headers.origin}`);
  
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Double-check: if this is still an OPTIONS request, handle it
  if (req.method === 'OPTIONS') {
    console.log('Fallback OPTIONS handler triggered for:', req.path);
    return res.status(200).end();
  }
  
  next();
});

// Register webhook route FIRST, before any body parser
app.use('/api/webhook', webhookRoutes);

// Now add body parsers for the rest of the app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded videos statically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// Serve favicon.ico statically if present
app.use('/favicon.ico', express.static(path.join(__dirname, 'favicon.ico')));

// Routes
app.get('/', (req, res) => res.send("API Working"))

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'CORS is working!', 
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for OPTIONS specifically
app.all('/api/options-test', (req, res) => {
  res.json({
    success: true,
    method: req.method,
    message: `${req.method} request handled successfully`,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/educator', (req, res, next) => {
  if (req.url.startsWith('/add-course')) {
    console.log('>>>> /api/educator/add-course route hit');
  }
  next();
}, educatorRouter)
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