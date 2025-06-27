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
    // Populate createdBy with educator's name and only return published courses
    const courses = await Course.find({ status: 'published' }).populate('createdBy', 'name');
    // Ensure each course has proper chapters structure
    const safeCourses = courses.map(course => {
      const courseObj = course.toObject();
      courseObj.chapters = Array.isArray(courseObj.chapters) ? courseObj.chapters : [];
      courseObj.chapters = courseObj.chapters.map(ch => ({
        ...ch,
        lectures: Array.isArray(ch.lectures) ? ch.lectures : []
      }));
      return courseObj;
    });
    res.json({ success: true, courses: safeCourses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Course Data By Id
export const getCourseId = async (req, res) => {
  try {
    const { id } = req.params;
    const courseData = await Course.findById(id);
    if (!courseData || courseData.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Course not found or not published' });
    }
    // Always ensure chapters is an array
    if (!Array.isArray(courseData.chapters)) courseData.chapters = [];
    // Ensure lectures are arrays in each chapter
    courseData.chapters = courseData.chapters.map(ch => ({
      ...ch.toObject?.() || ch,
      lectures: Array.isArray(ch.lectures) ? ch.lectures : []
    }));
    res.json({ success: true, courseData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};