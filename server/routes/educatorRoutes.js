import express from 'express'
import { addChapter, addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator, addLecture, publishCourse, getCourseForEdit, editCourse, addLectureWithCloudinaryUrl } from '../controllers/educatorController.js';
import upload, { videoUpload } from '../configs/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js';
import { jwtMiddleware } from '../middlewares/jwtMiddleware.js';


const educatorRouter = express.Router()

// Debug log for troubleshooting
console.log('Educator routes loaded successfully');

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

// Add Chapter
educatorRouter.post('/add-chapter', jwtMiddleware, protectEducator, addChapter);

// Add Lecture (with video)
educatorRouter.post('/add-lecture', jwtMiddleware, protectEducator, videoUpload.single('file'), addLecture);

// Add Lecture with Direct Cloudinary URL (no file upload, bypasses 413 errors)
console.log('Registering /add-lecture-cloudinary route');
educatorRouter.post('/add-lecture-cloudinary', jwtMiddleware, protectEducator, addLectureWithCloudinaryUrl);
console.log('Route /add-lecture-cloudinary registered successfully');

// Test route to verify educator routes are working
educatorRouter.get('/test-route', (req, res) => {
    res.json({ success: true, message: 'Educator routes are working!' });
});

// Get course for editing
educatorRouter.get('/course/:courseId', jwtMiddleware, protectEducator, getCourseForEdit);

// Edit course
educatorRouter.put('/edit-course/:courseId', jwtMiddleware, protectEducator, upload.single('image'), editCourse);

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

// Publish Course (POST)
educatorRouter.post('/publish-course', jwtMiddleware, protectEducator, async (req, res) => {
  // Use the controller function
  const { publishCourse } = await import('../controllers/educatorController.js');
  return publishCourse(req, res);
});

// Get single course by ID (for always up-to-date frontend sync)
educatorRouter.get('/course', jwtMiddleware, protectEducator, async (req, res) => {
  const { getCourseById } = await import('../controllers/educatorController.js');
  return getCourseById(req, res);
});


export default educatorRouter;