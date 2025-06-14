import express from 'express';
import { createTestimonial, getTestimonials } from '../controllers/testimonialController.js';

const router = express.Router();

// Create testimonial
router.post('/', createTestimonial);
// Get all published testimonials
router.get('/', getTestimonials);

export default router;
