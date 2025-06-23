import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    duration: { type: Number, required: true }
}, { _id: false });

const chapterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    lectures: [lectureSchema]
}, { _id: false });

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
    // Optionally add price, discount, ratings, students, etc. as needed
}, { timestamps: true, minimize: false });

const Course = mongoose.model('Course', courseSchema);

export default Course;