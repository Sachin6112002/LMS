import User from "../models/User.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import upload from '../configs/multer.js';
import { v2 as cloudinary } from 'cloudinary';
import stripe from 'stripe';
import { Purchase } from '../models/Purchase.js';
import Course from '../models/Course.js';
import streamifier from 'streamifier';

// Stripe Gateway Initialize
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

// User Registration Controller
export const registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name || !req.file) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }
    // Upload image to Cloudinary using buffer
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'lms_users', resource_type: 'image' },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };
    const imageUpload = await streamUpload(req.file.buffer);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      _id: new mongoose.Types.ObjectId().toString(),
      email,
      password: hashedPassword,
      name,
      imageUrl: imageUpload.secure_url,
      enrolledCourses: [],
      publicMetadata: { role: 'student' }
    });
    await user.save();
    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User Login Controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id, role: user.publicMetadata?.role || 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name, role: user.publicMetadata?.role || 'student' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Stripe Webhooks to Manage Payments Action
export const stripeWebhooks = async (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const purchaseId = session.metadata ? session.metadata.purchaseId : undefined;
      console.log('Webhook DEBUG: checkout.session.completed received');
      console.log('Session:', JSON.stringify(session));
      console.log('purchaseId:', purchaseId);
      if (!purchaseId) {
        console.error('No purchaseId in session metadata');
        break;
      }
      const purchaseData = await Purchase.findById(purchaseId);
      if (!purchaseData) {
        console.error('No purchase found for purchaseId:', purchaseId);
        break;
      }
      const userData = await User.findById(purchaseData.userId);
      const courseData = await Course.findById(purchaseData.courseId?.toString());
      if (!userData || !courseData) {
        console.error('User or Course not found for purchase:', purchaseId);
        console.error('userData:', userData);
        console.error('courseData:', courseData);
        break;
      }
      // Prevent duplicate enrollments
      if (!courseData.enrolledStudents.map(id => id.toString()).includes(userData._id.toString())) {
        courseData.enrolledStudents.push(userData._id);
        await courseData.save();
        console.log('User added to course.enrolledStudents');
      }
      if (!userData.enrolledCourses.map(id => id.toString()).includes(courseData._id.toString())) {
        userData.enrolledCourses.push(courseData._id);
        await userData.save();
        console.log('Course added to user.enrolledCourses');
      }
      purchaseData.status = 'completed';
      await purchaseData.save();
      console.log('Purchase marked as completed:', purchaseId);
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      try {
        // Getting Session Metadata
        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });
        if (!sessionList.data.length) {
          console.error('No checkout session found for payment_intent:', paymentIntentId);
        } else {
          const purchaseIdFailed = sessionList.data[0].metadata.purchaseId;
          const purchaseDataFailed = await Purchase.findById(purchaseIdFailed);
          if (!purchaseDataFailed) {
            console.error('No purchase found for purchaseId:', purchaseIdFailed);
          } else {
            purchaseDataFailed.status = 'failed';
            await purchaseDataFailed.save();
            console.log('Purchase marked as failed:', purchaseIdFailed);
          }
        }
      } catch (err) {
        console.error('Error processing payment_intent.payment_failed:', err);
      }
      break;
    }
    case 'payment_intent.succeeded': {
      // Acknowledge payment_intent.succeeded for Stripe, but do not process (handled by checkout.session.completed)
      console.log('Received payment_intent.succeeded event, no action taken.');
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
      // Always return 200 for unhandled event types to avoid Stripe retries
      break;
  }
  // Return a response to acknowledge receipt of the event
  response.status(200).json({ received: true });
}