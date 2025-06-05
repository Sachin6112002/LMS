import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import stripe from 'stripe';

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);


// Stripe Webhooks to Manage Payments Action
export const stripeWebhook = async (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('Stripe webhook received:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      console.log('Processing payment_intent.succeeded');
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      try {
        // Getting Session Metadata
        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });
        console.log('Checkout session(s) found:', session.data.length);
        if (!session.data.length) {
          console.error('No checkout session found for payment_intent:', paymentIntentId);
          break;
        }
        const { purchaseId } = session.data[0].metadata;
        console.log('purchaseId from session metadata:', purchaseId);
        const purchaseData = await Purchase.findById(purchaseId);
        if (!purchaseData) {
          console.error('No purchase found for purchaseId:', purchaseId);
          break;
        }
        const userData = await User.findById(purchaseData.userId);
        const courseData = await Course.findById(purchaseData.courseId.toString());
        if (!userData || !courseData) {
          console.error('User or Course not found for purchase:', purchaseId);
          break;
        }
        courseData.enrolledStudents.push(userData);
        await courseData.save();
        userData.enrolledCourses.push(courseData._id);
        await userData.save();
        purchaseData.status = 'completed';
        await purchaseData.save();
        console.log('Purchase marked as completed:', purchaseId);
      } catch (err) {
        console.error('Error processing payment_intent.succeeded:', err);
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      console.log('Processing payment_intent.payment_failed');
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      try {
        // Getting Session Metadata
        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });
        if (!session.data.length) {
          console.error('No checkout session found for payment_intent:', paymentIntentId);
          break;
        }
        const { purchaseId } = session.data[0].metadata;
        const purchaseData = await Purchase.findById(purchaseId);
        if (!purchaseData) {
          console.error('No purchase found for purchaseId:', purchaseId);
          break;
        }
        purchaseData.status = 'failed';
        await purchaseData.save();
        console.log('Purchase marked as failed:', purchaseId);
      } catch (err) {
        console.error('Error processing payment_intent.payment_failed:', err);
      }
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  response.json({ received: true });
};