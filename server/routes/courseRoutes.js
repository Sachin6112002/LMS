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

export default router;
