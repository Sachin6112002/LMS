import express from 'express';
import { getAllUsers, getAllCourses, getAllPurchases, checkAdminExists, registerAdmin, toggleCoursePublish, deleteCourseByAdmin, loginAdmin, addAdmin } from '../controllers/adminController.js';
import { adminAuth } from '../middlewares/adminAuth.js';

const adminRouter = express.Router();

adminRouter.get('/users', getAllUsers);
adminRouter.get('/courses', getAllCourses);
adminRouter.get('/purchases', getAllPurchases);
adminRouter.get('/check-admin-exists', checkAdminExists);
adminRouter.post('/register', registerAdmin);
adminRouter.patch('/courses/:id/publish', toggleCoursePublish);
adminRouter.delete('/courses/:id', deleteCourseByAdmin);
adminRouter.post('/login', loginAdmin);
adminRouter.post('/add', adminAuth, addAdmin);

export default adminRouter;
