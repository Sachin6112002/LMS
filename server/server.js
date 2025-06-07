import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import connectCloudinary from './configs/cloudinary.js'
import userRouter from './routes/userRoutes.js'
import educatorRouter from './routes/educatorRoutes.js'
import courseRouter from './routes/courseRoute.js'
import adminRouter from './routes/adminRoutes.js'
import { stripeWebhook } from './controllers/stripeWebhook.js';
import bodyParser from 'body-parser';

// Initialize Express
const app = express()

// Connect to database
await connectDB()
await connectCloudinary()

// Middlewares
app.use(cors())
app.use(express.json())

// Stripe webhook must use raw body
app.post('/api/webhook/stripe', bodyParser.raw({ type: 'application/json' }), stripeWebhook);

// Routes
app.get('/', (req, res) => res.send("API Working"))
app.use('/api/educator', educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)

// Port
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})