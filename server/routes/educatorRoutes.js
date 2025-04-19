import express from 'express'
// import { educatorDahboardData, getEducatorCourses, getEnrolledStudentsData} from  '../controllers/educatorController.js'
import {updateRoleToEducator , addCourse} from  '../controllers/educatorController.js'

import protectEducator from '../middlewares/authMiddleware.js'
import upload from '../configs/multer.js'
const educatorRouter = express.Router()
//Add Educator Role
educatorRouter.get('/update-role', updateRoleToEducator)
educatorRouter.post('/add-course', upload.single('image'), protectEducator,addCourse)
// educatorRouter.get('/courses', protectEducator, getEducatorCourses)
// educatorRouter.get('/dashboard', protectEducator, educatorDahboardData )
// educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData)
export default educatorRouter;