import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkWebhooks, stripeWebhooks } from "./controllers/webhooks.js";
import connectDB from "./configs/mongodb.js";
import connectCloudinary from "./configs/cloudinary.js";
import { clerkMiddleware } from "@clerk/express";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
app.use(cors())
// Connect DB and Cloudinary
await connectDB();
await connectCloudinary();
app.post("/clerk"  , express.json() , clerkWebhooks)
app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// Clerk middleware should be applied AFTER webhook routes
app.use(clerkMiddleware());
app.use(express.json()); // ⬅️ for routes that need JSON parsing

// Routes
app.get("/", (req, res) => res.send("API is working"));
app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
  console.log(`🧪 Clerk webhook ready at POST /clerk`);
});
