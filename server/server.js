import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import connectCloudinary from './configs/cloudinary.js'
import userRouter from './routes/userRoutes.js'
import educatorRouter from './routes/educatorRoutes.js'
import courseRouter from './routes/courseRoute.js'
import adminRouter from './routes/adminRoutes.js'
import { stripeWebhooks } from './controllers/webhooks.js';
import bodyParser from 'body-parser';

// Initialize Express
const app = express()

// Connect to database
await connectDB()
await connectCloudinary()

// Stripe webhook must use raw body - register BEFORE express.json()
app.post('/api/webhook/stripe', bodyParser.raw({ type: 'application/json' }), stripeWebhooks);

// Middlewares
app.use(cors());
app.use(express.json())

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