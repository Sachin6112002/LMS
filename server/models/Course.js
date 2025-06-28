import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    videoUrl: { type: String, required: true },
    duration: { type: Number, required: true },
    isPreviewFree: { type: Boolean, default: false }
}, { _id: true });

const chapterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    lectures: [lectureSchema]
}, { _id: true });

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    createdBy: {
        type: String,
        ref: 'User',
        required: true
    },
    chapters: [chapterSchema],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    enrolledStudents: {
        type: [{ type: String, ref: 'User' }],
        default: []
    },
    courseRatings: [{
        userId: { type: String, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 }
    }],
    price: { type: Number, default: 0 }, // Course price in dollars, 0 for free courses
    discount: { type: Number, default: 0 }, // Discount percentage
    category: { type: String, default: '' }, // Course category
    // Optionally add discount, ratings, students, etc. as needed
}, { timestamps: true, minimize: false });

const Course = mongoose.model('Course', courseSchema);

export default Course;