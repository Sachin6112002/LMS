import { Purchase } from '../models/Purchase.js';
import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = express.raw({ type: 'application/json' }, async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const purchaseId = session.metadata?.purchaseId;
    if (purchaseId) {
      // Update the purchase status to completed
      const result = await Purchase.findByIdAndUpdate(
        purchaseId,
        { status: 'completed' },
        { new: true }
      );
      console.log('Stripe webhook: purchase updated:', result);
    } else {
      console.warn('Stripe webhook: No purchaseId found in session metadata');
    }
  }
  res.status(200).json({ received: true });
});
