import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Database connection for serverless
const connectToDatabase = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  await mongoose.connect(process.env.MONGODB_URI + '/lms');
};

// User Schema (inline to avoid import issues)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  publicMetadata: {
    role: { type: String, enum: ['student', 'educator'], default: 'student' }
  }
}, { timestamps: true });

// Lecture Schema (inline)
const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  videoUrl: { type: String, required: true },
  duration: { type: Number, default: 0 },
  isPreviewFree: { type: Boolean, default: false }
}, { _id: true });

// Chapter Schema (inline)
const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  lectures: [lectureSchema]
}, { _id: true });

// Course Schema (inline)
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String },
  createdBy: { type: String, ref: 'User', required: true },
  chapters: [chapterSchema],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  enrolledStudents: { type: [{ type: String, ref: 'User' }], default: [] },
  courseRatings: [{
    userId: { type: String, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }
  }]
}, { timestamps: true });

// Models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

export default async function handler(req, res) {
  // REMOVE manual CORS headers - rely on global middleware

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET support for deployment verification
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'add-lecture-cloudinary endpoint is working!',
      method: 'GET',
      time: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('SERVERLESS FUNCTION: add-lecture-cloudinary called');
    
    // Parse JSON body if it's a string
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
    
    console.log('Request body:', body);

    // Connect to database
    await connectToDatabase();

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const userId = decoded.userId;
    console.log('User ID from token:', userId);

    // Check if user exists and is an educator
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.publicMetadata || user.publicMetadata.role !== 'educator') {
      return res.status(403).json({ success: false, message: 'Access denied. Educator role required.' });
    }

    console.log('User verified as educator:', user.name);

    // Extract request data
    const { courseId, chapterId, title, description, videoUrl, duration } = body;

    // Validate required fields
    if (!courseId || !chapterId || !title || !videoUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: courseId, chapterId, title, and videoUrl are required' 
      });
    }

    // Validate that videoUrl is from Cloudinary
    if (!videoUrl.includes('cloudinary.com') && !videoUrl.includes('res.cloudinary.com')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid video URL. Must be a Cloudinary URL.' 
      });
    }

    console.log('Looking for course:', courseId);

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    console.log('Course found:', course.title);

    // Check if educator owns this course
    if (course.createdBy !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only add lectures to your own courses' });
    }

    // Find the chapter by ID
    const chapterIndex = course.chapters.findIndex(chapter => chapter._id.toString() === chapterId);
    if (chapterIndex === -1) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    console.log('Chapter found at index:', chapterIndex);

    // Create new lecture with provided Cloudinary URL
    const newLecture = {
      title,
      description: description || '',
      videoUrl: videoUrl, // Direct Cloudinary URL
      duration: parseInt(duration) || 0,
      isPreviewFree: false
    };

    console.log('Adding lecture:', newLecture);

    // Add lecture to chapter
    course.chapters[chapterIndex].lectures.push(newLecture);
    await course.save();

    console.log('Lecture added successfully');

    res.json({ 
      success: true, 
      message: 'Lecture added successfully',
      lecture: newLecture, 
      course 
    });
  } catch (err) {
    console.error('Error in add-lecture-cloudinary:', err);
    console.error('Error stack:', err.stack);
    
    // Return more specific error information
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Validation error: ' + err.message });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format: ' + err.message });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error: ' + err.message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}
