import express from 'express'
import { addUserRating, getUserCourseProgress, getUserData, purchaseCourse, updateUserCourseProgress, userEnrolledCourses } from '../controllers/userController.js';
import { sendOtp, verifyOtpAndChangePassword } from '../controllers/otpController.js';
import { registerUser, loginUser } from '../controllers/webhooks.js';
import upload from '../configs/multer.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { jwtMiddleware } from '../middlewares/jwtMiddleware.js';
import passport from 'passport';


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
userRouter.post('/send-otp', sendOtp);
userRouter.post('/verify-otp', verifyOtpAndChangePassword);

// Google OAuth login
userRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
userRouter.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login', // Adjust as needed
    session: true
  }),
  (req, res) => {
    // Redirect to frontend with user info or token
    // You may want to generate a JWT and send it as a query param
    res.redirect(`${process.env.FRONTEND_URL}/google-success?userId=${req.user._id}`);
  }
);

export default userRouter;