import express from 'express'
import {getUserData , userErolledCourses} from "../controllers/userController.js"
const userRouter = express.Router()
userRouter.get('/data', getUserData)
userRouter.get('/enrolled-courses',userErolledCourses)
export default userRouter;