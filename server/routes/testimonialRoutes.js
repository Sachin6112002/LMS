import express from 'express';
import testimonialController from '../controllers/testimonialController.js';

const router = express.Router();

// Create testimonial
router.post('/', testimonialController.createTestimonial);
// Get all published testimonials
router.get('/', testimonialController.getTestimonials);

export default router;
