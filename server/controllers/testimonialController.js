import Testimonial from '../models/Testimonial.js';

// POST /api/testimonials
export const createTestimonial = async (req, res) => {
  try {
    const data = req.body;
    // Parse JSON fields if sent as string (from FormData)
    if (typeof data.feedback === 'string') {
      data.feedback = JSON.parse(data.feedback);
    }
    if (typeof data.rating === 'string') {
      data.rating = JSON.parse(data.rating);
    }
    // Handle photo upload
    if (req.file) {
      data.profilePhoto = req.file.path; // Or upload to cloudinary and use the URL
    }
    const testimonial = new Testimonial(data);
    await testimonial.save();
    res.status(201).json({ success: true, testimonial });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/testimonials
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ permission: true }).sort({ createdAt: -1 });
    res.json({ success: true, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
