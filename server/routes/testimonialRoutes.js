const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');

// Create testimonial
router.post('/', testimonialController.createTestimonial);
// Get all published testimonials
router.get('/', testimonialController.getTestimonials);

module.exports = router;
