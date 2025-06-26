import Course from '../models/Course.js';

// Create a course with metadata and thumbnail (thumbnail is now a URL)
export const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail } = req.body;
    // Defensive: check for required fields
    if (!title || !description || !thumbnail) {
      return res.status(400).json({ success: false, message: 'Title, description, and thumbnail are required' });
    }
    const course = await Course.create({
      title,
      description,
      thumbnail,
      createdBy: req.auth.userId,
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

// Add lecture to a chapter (videoUrl is now a URL)
export const addLecture = async (req, res) => {
  try {
    const { id, chapterIndex } = req.params;
    const { title, duration, videoUrl } = req.body;
    if (!videoUrl) return res.status(400).json({ success: false, message: 'Video URL is required' });
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (!course.chapters[chapterIndex]) return res.status(404).json({ success: false, message: 'Chapter not found' });
    course.chapters[chapterIndex].lectures.push({
      title,
      videoUrl,
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