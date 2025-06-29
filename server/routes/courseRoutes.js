import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { jwtMiddleware } from '../middlewares/jwtMiddleware.js';
import upload, { videoUpload } from '../configs/multer.js';
import {
  createCourse,
  addChapter,
  addLecture,
  getAllCourses
} from '../controllers/courseController.js';

const router = express.Router();

// Create a course with metadata and thumbnail
router.post('/', jwtMiddleware, authMiddleware, upload.single('thumbnail'), createCourse);

// Add chapter to a course
router.post('/:id/chapters', jwtMiddleware, authMiddleware, addChapter);

// Upload video and add lecture to a chapter
router.post('/:id/chapters/:chapterIndex/lectures', jwtMiddleware, authMiddleware, videoUpload.single('video'), addLecture);

// Get all courses
router.get('/', getAllCourses);

// Get a lecture video (with preview/enrollment check)
router.get('/:courseId/chapters/:chapterId/lectures/:lectureId', jwtMiddleware, async (req, res) => {
  try {
    const { courseId, chapterId, lectureId } = req.params;
    const userId = req.auth?.userId;
    const course = await (await import('../models/Course.js')).default.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const chapter = course.chapters.id(chapterId) || course.chapters.find(ch => ch._id.toString() === chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });
    const lecture = chapter.lectures.id(lectureId) || chapter.lectures.find(l => l._id.toString() === lectureId);
    if (!lecture) return res.status(404).json({ success: false, message: 'Lecture not found' });
    // If preview, allow anyone
    if (lecture.isPreviewFree) {
      return res.json({ success: true, videoUrl: lecture.videoUrl, preview: true });
    }
    // Otherwise, require enrollment
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Login required to access this lecture' });
    }
    if (!course.enrolledStudents.map(id => id.toString()).includes(userId)) {
      return res.status(403).json({ success: false, message: 'Please enroll to access this lecture' });
    }
    return res.json({ success: true, videoUrl: lecture.videoUrl, preview: false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
