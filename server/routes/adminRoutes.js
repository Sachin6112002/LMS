import express from 'express';
import { getAllUsers, getAllCourses, getAllPurchases, checkAdminExists, registerAdmin, toggleCoursePublish, deleteCourseByAdmin } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.get('/users', getAllUsers);
adminRouter.get('/courses', getAllCourses);
adminRouter.get('/purchases', getAllPurchases);
adminRouter.get('/check-admin-exists', checkAdminExists);
adminRouter.post('/register', registerAdmin);
adminRouter.patch('/courses/:id/publish', toggleCoursePublish);
adminRouter.delete('/courses/:id', deleteCourseByAdmin);

export default adminRouter;
