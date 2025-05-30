import express from 'express'
import { addUserRating, getUserCourseProgress, getUserData, purchaseCourse, updateUserCourseProgress, userEnrolledCourses } from '../controllers/userController.js';
import { registerUser, loginUser } from '../controllers/webhooks.js';
import upload from '../configs/multer.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { jwtMiddleware } from '../middlewares/jwtMiddleware.js';


const userRouter = express.Router()

// Get user Data
userRouter.get('/data', jwtMiddleware, authenticate, getUserData)
userRouter.post('/purchase', jwtMiddleware, authenticate, purchaseCourse)
userRouter.get('/enrolled-courses', jwtMiddleware, authenticate, userEnrolledCourses)
userRouter.post('/update-course-progress', jwtMiddleware, authenticate, updateUserCourseProgress)
userRouter.post('/get-course-progress', jwtMiddleware, authenticate, getUserCourseProgress)
userRouter.post('/add-rating', jwtMiddleware, authenticate, addUserRating)
// Register User (first user becomes admin)
userRouter.post('/register', upload.single('image'), registerUser);
userRouter.post('/login', loginUser);

export default userRouter;