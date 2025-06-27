import express from 'express'
import { addUserRating, becomeEducator, completePendingPurchase, getUserCourseProgress, getUserData, getUserPendingPurchases, purchaseCourse, updateUserCourseProgress, userEnrolledCourses } from '../controllers/userController.js';
import { sendOtp, verifyOtpAndChangePassword } from '../controllers/otpController.js';
import { registerUser, loginUser } from '../controllers/webhooks.js';
import upload from '../configs/multer.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { jwtMiddleware } from '../middlewares/jwtMiddleware.js';
import { updateUserProfile } from '../controllers/updateProfileController.js';


const userRouter = express.Router()

// Get user Data
userRouter.get('/data', jwtMiddleware, authenticate, getUserData)
userRouter.post('/purchase', jwtMiddleware, authenticate, purchaseCourse)
userRouter.get('/enrolled-courses', jwtMiddleware, authenticate, userEnrolledCourses)
userRouter.post('/update-course-progress', jwtMiddleware, authenticate, updateUserCourseProgress)
userRouter.post('/get-course-progress', jwtMiddleware, authenticate, getUserCourseProgress)
userRouter.post('/add-rating', jwtMiddleware, authenticate, addUserRating)
userRouter.post('/become-educator', jwtMiddleware, authenticate, becomeEducator)
userRouter.post('/complete-pending-purchase', jwtMiddleware, authenticate, completePendingPurchase)
userRouter.get('/pending-purchases', jwtMiddleware, authenticate, getUserPendingPurchases)
// Register User (first user becomes admin)
userRouter.post('/register', upload.single('image'), registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/send-otp', sendOtp);
userRouter.post('/verify-otp', verifyOtpAndChangePassword);
userRouter.patch('/update', jwtMiddleware, authenticate, upload.single('photo'), updateUserProfile);

export default userRouter;