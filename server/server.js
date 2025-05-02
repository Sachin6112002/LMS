import express from "express";
import cors from "cors";
import 'dotenv/config';
import connectDB from "./configs/mongodb.js";
import connectCloudinary from "./configs/cloudinary.js";

import { clerkWebhooks, stripeWebhooks } from "./controllers/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";
import userRouter from "./routes/userRoutes.js";

import { clerkMiddleware } from "@clerk/express";

// Initialize Express
const app = express();

// === RAW BODY ROUTES — MUST COME FIRST ===
app.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhooks);
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// === CONNECT TO DATABASE & CLOUDINARY ===
await connectDB();
await connectCloudinary();

// === MIDDLEWARES ===
app.use(cors());
app.use(clerkMiddleware()); // Auth
// JSON middleware for the rest of your routes
app.use(express.json());

// === ROUTES ===
app.get('/', (req, res) => res.send("API is working ✅"));

app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter);

// === START SERVER ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
