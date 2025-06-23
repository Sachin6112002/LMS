import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import connectCloudinary from './configs/cloudinary.js'
import userRouter from './routes/userRoutes.js'
import educatorRouter from './routes/educatorRoutes.js'
import courseRouter from './routes/courseRoute.js'
import adminRouter from './routes/adminRoutes.js'
import path from 'path';
import { fileURLToPath } from 'url';
import testimonialRoutes from './routes/testimonialRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

// Initialize Express
const app = express()

// Connect to database
await connectDB()
await connectCloudinary()

// Middlewares
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'https://lms-client-one-lemon.vercel.app',
    'http://localhost:3000',
    'https://lms-admin-blond.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Add this line to handle all OPTIONS preflight requests for CORS
app.options('*', cors());

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
app.use('/api/educator', (req, res, next) => {
  if (req.url.startsWith('/add-course')) {
    console.log('>>>> /api/educator/add-course route hit');
  }
  next();
}, educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)
app.use('/api/testimonials', testimonialRoutes)

// Handle favicon.ico requests gracefully to avoid 500 errors
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Port
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('>>>> LMS server startup log: This is the latest code running.');
})