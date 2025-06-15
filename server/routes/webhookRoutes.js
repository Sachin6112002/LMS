import express from 'express';
import { stripeWebhooks } from '../controllers/webhooks.js';

const router = express.Router();

// Stripe webhook endpoint
router.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

export default router;
