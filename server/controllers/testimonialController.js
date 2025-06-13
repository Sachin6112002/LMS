const Testimonial = require('../models/Testimonial');

// POST /api/testimonials
exports.createTestimonial = async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body);
    await testimonial.save();
    res.status(201).json({ success: true, testimonial });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/testimonials
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ permission: true }).sort({ createdAt: -1 });
    res.json({ success: true, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
