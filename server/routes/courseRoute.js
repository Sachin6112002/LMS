import express from 'express'
import { getAllCourses, getCourseId } from '../controllers/courseController.js';


const courseRouter = express.Router()

// Get All Courses
courseRouter.get('/all', getAllCourses)

// Get Course Data By Id
courseRouter.get('/:id', getCourseId)


export default courseRouter;