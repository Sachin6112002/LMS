import { buffer } from 'micro';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import User from '../../server/models/User.js';
import Course from '../../server/models/Course.js';
import { Purchase } from '../../server/models/Purchase.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  console.log('Webhook received:', new Date().toISOString());

  const sig = req.headers['stripe-signature'];
  const buf = await buffer(req);
  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('Webhook event type:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URL);
      console.log('Connected to MongoDB');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const purchaseId = session.metadata ? session.metadata.purchaseId : undefined;
      
      console.log('Processing checkout.session.completed for purchaseId:', purchaseId);
      
      if (!purchaseId) {
        console.error('No purchaseId in session metadata');
        return res.status(400).json({ error: 'No purchaseId in session metadata' });
      }

      const purchaseData = await Purchase.findById(purchaseId);
      if (!purchaseData) {
        console.error('No purchase found for purchaseId:', purchaseId);
        return res.status(400).json({ error: 'No purchase found' });
      }

      if (purchaseData.status === 'completed') {
        console.log('Purchase already completed:', purchaseId);
        return res.status(200).json({ received: true, message: 'Already completed' });
      }

      const userData = await User.findById(purchaseData.userId);
      const courseData = await Course.findById(purchaseData.courseId?.toString());
      
      if (!userData || !courseData) {
        console.error('User or Course not found for purchase:', purchaseId);
        console.error('userData exists:', !!userData);
        console.error('courseData exists:', !!courseData);
        return res.status(400).json({ error: 'User or Course not found' });
      }

      console.log('Processing enrollment for user:', userData.name, 'course:', courseData.title);

      // Prevent duplicate enrollments - defensive programming
      courseData.enrolledStudents = Array.isArray(courseData.enrolledStudents) ? courseData.enrolledStudents : [];
      if (!courseData.enrolledStudents.map(id => id.toString()).includes(userData._id.toString())) {
        courseData.enrolledStudents.push(userData._id);
        await courseData.save();
        console.log('User added to course.enrolledStudents');
      }

      userData.enrolledCourses = Array.isArray(userData.enrolledCourses) ? userData.enrolledCourses : [];
      if (!userData.enrolledCourses.map(id => id.toString()).includes(courseData._id.toString())) {
        userData.enrolledCourses.push(courseData._id);
        await userData.save();
        console.log('Course added to user.enrolledCourses');
      }

      purchaseData.status = 'completed';
      await purchaseData.save();
      console.log('Purchase marked as completed:', purchaseId);

      return res.status(200).json({ received: true, message: 'Purchase completed successfully' });
    }

    console.log('Unhandled event type:', event.type);
    return res.status(200).json({ received: true, message: 'Event acknowledged' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
