import mongoose from 'mongoose';
import Course from '../../server/models/Course.js';
import User from '../../server/models/User.js';
import jwt from 'jsonwebtoken';

// Database connection for serverless
const connectToDatabase = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  await mongoose.connect(process.env.MONGODB_URI + '/lms');
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('SERVERLESS FUNCTION: add-lecture-cloudinary called');
    console.log('Request body:', req.body);

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
    const { courseId, chapterId, title, description, videoUrl, duration } = req.body;

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
    res.status(500).json({ success: false, message: err.message });
  }
}
