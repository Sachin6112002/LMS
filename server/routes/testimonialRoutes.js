import express from 'express';
import { createTestimonial, getTestimonials } from '../controllers/testimonialController.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' }); // You can replace with your cloudinary config

const router = express.Router();

// Create testimonial with photo upload support
router.post('/', upload.single('profilePhoto'), createTestimonial);
// Get all published testimonials
router.get('/', getTestimonials);

export default router;
