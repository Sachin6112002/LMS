import Course from '../models/Course.js';
import cloudinary from '../configs/cloudinary.js';

// Create a course with metadata and thumbnail
export const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const createdBy = req.auth.userId;
    if (!req.file) return res.status(400).json({ success: false, message: 'Thumbnail is required' });
    // Upload thumbnail to Cloudinary /thumbnails/
    const uploadRes = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'thumbnails' }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
      stream.end(req.file.buffer);
    });
    const course = await Course.create({
      title,
      description,
      thumbnail: uploadRes.secure_url,
      createdBy,
      chapters: []
    });
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add chapter to a course
export const addChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    course.chapters.push({ title, lectures: [] });
    await course.save();
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add lecture to a chapter
export const addLecture = async (req, res) => {
  try {
    const { id, chapterIndex } = req.params;
    const { title, duration } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'Video file is required' });
    // Upload video to Cloudinary /lectures/
    const uploadRes = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'lectures', resource_type: 'video' }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
      stream.end(req.file.buffer);
    });
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (!course.chapters[chapterIndex]) return res.status(404).json({ success: false, message: 'Chapter not found' });
    course.chapters[chapterIndex].lectures.push({
      title,
      videoUrl: uploadRes.secure_url,
      duration
    });
    await course.save();
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Course Data By Id
export const getCourseId = async (req, res) => {
  try {
    const { id } = req.params;
    const courseData = await Course.findById(id);
    if (!courseData) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, courseData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};