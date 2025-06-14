import express from 'express'
import { addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator, uploadLectureVideo } from '../controllers/educatorController.js';
import upload, { videoUpload } from '../configs/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js';
import { jwtMiddleware } from '../middlewares/jwtMiddleware.js';


const educatorRouter = express.Router()

// Add Educator Role 
educatorRouter.get('/update-role', jwtMiddleware, updateRoleToEducator)

// Add Courses 
educatorRouter.post('/add-course', jwtMiddleware, protectEducator, upload.single('image'), addCourse)

// Get Educator Courses 
educatorRouter.get('/courses', jwtMiddleware, protectEducator, getEducatorCourses)

// Get Educator Dashboard Data
educatorRouter.get('/dashboard', jwtMiddleware, protectEducator, educatorDashboardData)

// Get Educator Students Data
educatorRouter.get('/enrolled-students', jwtMiddleware, protectEducator, getEnrolledStudentsData)

// Upload Lecture Video
educatorRouter.post('/upload-video', jwtMiddleware, protectEducator, videoUpload.single('video'), uploadLectureVideo);

// Update Lecture Duration
educatorRouter.post('/update-lecture-duration', jwtMiddleware, protectEducator, async (req, res) => {
  try {
    const { courseId, chapterId, lectureId, duration } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    let updated = false;
    for (const chapter of course.courseContent) {
      if (chapter.chapterId === chapterId) {
        for (const lecture of chapter.chapterContent) {
          if (lecture.lectureId === lectureId) {
            lecture.lectureDuration = duration;
            updated = true;
          }
        }
      }
    }
    if (!updated) return res.status(404).json({ message: 'Lecture not found' });
    await course.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default educatorRouter;