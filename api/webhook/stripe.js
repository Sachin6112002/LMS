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

  const sig = req.headers['stripe-signature'];
  const buf = await buffer(req);
  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const purchaseId = session.metadata ? session.metadata.purchaseId : undefined;
    if (!purchaseId) {
      console.error('No purchaseId in session metadata');
      return res.status(400).json({ error: 'No purchaseId in session metadata' });
    }

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const purchaseData = await Purchase.findById(purchaseId);
    if (!purchaseData) {
      console.error('No purchase found for purchaseId:', purchaseId);
      return res.status(400).json({ error: 'No purchase found' });
    }
    const userData = await User.findById(purchaseData.userId);
    const courseData = await Course.findById(purchaseData.courseId?.toString());
    if (!userData || !courseData) {
      console.error('User or Course not found for purchase:', purchaseId);
      return res.status(400).json({ error: 'User or Course not found' });
    }
    // Prevent duplicate enrollments
    if (!courseData.enrolledStudents.map(id => id.toString()).includes(userData._id.toString())) {
      courseData.enrolledStudents.push(userData._id);
      await courseData.save();
    }
    if (!userData.enrolledCourses.map(id => id.toString()).includes(courseData._id.toString())) {
      userData.enrolledCourses.push(courseData._id);
      await userData.save();
    }
    purchaseData.status = 'completed';
    await purchaseData.save();
    console.log('Purchase marked as completed:', purchaseId);
  }

  res.status(200).json({ received: true });
}
