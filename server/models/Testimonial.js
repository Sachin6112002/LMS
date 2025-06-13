const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  course: { type: String, required: true },
  institution: { type: String },
  profilePhoto: { type: String },
  badge: { type: String },
  feedback: {
    experience: { type: String, required: true },
    teaching: { type: String },
    outcome: { type: String },
    goal: { type: String }
  },
  rating: {
    overall: { type: Number, required: true },
    content: { type: Number },
    instructor: { type: Number },
    ux: { type: Number }
  },
  date: { type: Date, required: true },
  permission: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
