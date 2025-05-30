import express from 'express'
import { addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator } from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
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


export default educatorRouter;