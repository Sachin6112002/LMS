import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import connectCloudinary from './configs/cloudinary.js'
import userRouter from './routes/userRoutes.js'
import educatorRouter from './routes/educatorRoutes.js'
import courseRouter from './routes/courseRoute.js'
import adminRouter from './routes/adminRoutes.js'
import bodyParser from 'body-parser';
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
    'https://lms-client-one-lemon.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json())

// Serve uploaded videos statically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// Serve favicon.ico statically if present
app.use('/favicon.ico', express.static(path.join(__dirname, 'favicon.ico')));

// Routes
app.get('/', (req, res) => res.send("API Working"))
app.use('/api/educator', educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)
app.use('/api/testimonials', testimonialRoutes)
app.use('/api/webhook', webhookRoutes)

// Handle favicon.ico requests gracefully to avoid 500 errors
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Port
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})