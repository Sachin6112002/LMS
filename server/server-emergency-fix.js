import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import cloudinary from './configs/cloudinary.js'
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

// CRITICAL FIX: Handle ALL OPTIONS requests FIRST before any other middleware
app.use((req, res, next) => {
  // Set CORS headers for ALL requests
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.headers.origin || 'no-origin'}`);
  
  // IMMEDIATELY handle OPTIONS - this is the critical fix
  if (req.method === 'OPTIONS') {
    console.log(`OPTIONS handled for: ${req.url}`);
    return res.status(200).end();
  }
  
  next();
});

// Simple CORS middleware (backup)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Register webhook route FIRST, before any body parser (for Stripe raw body)
app.use('/api/webhook', webhookRoutes);

// Body parsers (after webhooks)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'favicon.ico')));

// Test endpoints
app.get('/', (req, res) => res.json({ success: true, message: "LMS API Working", timestamp: new Date().toISOString() }));

app.get('/api/cors-test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'CORS is working!', 
    origin: req.headers.origin,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

app.all('/api/options-test', (req, res) => {
  res.json({
    success: true,
    method: req.method,
    message: `${req.method} request handled successfully`,
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/user', userRouter)
app.use('/api/educator', educatorRouter)
app.use('/api/admin', adminRouter)
app.use('/api/testimonials', testimonialRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/course', courseRouter)

// Handle favicon gracefully
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Port
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 LMS Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for all origins`);
  console.log(`✅ OPTIONS requests handled at top level`);
})
