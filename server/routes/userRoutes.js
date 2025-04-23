import express from 'express'
import {getUserData , purchaseCourse, userErolledCourses} from "../controllers/userController.js"
const userRouter = express.Router()
userRouter.get('/data', getUserData)
userRouter.get('/enrolled-courses',userErolledCourses)
userRouter.post('/purchase', purchaseCourse)
export default userRouter;