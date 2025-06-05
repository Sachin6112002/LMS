import express from 'express';
import { getAllUsers, getAllCourses, getAllPurchases, checkAdminExists, registerAdmin, toggleCoursePublish, deleteCourseByAdmin, loginAdmin, addAdmin, deleteAdmin, getAllStudents, getAllEducators, getAllAdmins, getAdminDashboard } from '../controllers/adminController.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import upload from '../configs/multer.js';

const adminRouter = express.Router();

adminRouter.get('/users', getAllUsers);
adminRouter.get('/courses', getAllCourses);
adminRouter.get('/purchases', getAllPurchases);
adminRouter.get('/check-admin-exists', checkAdminExists);
adminRouter.post('/register', upload.single('imageFile'), registerAdmin);
adminRouter.patch('/courses/:id/publish', toggleCoursePublish);
adminRouter.delete('/courses/:id', deleteCourseByAdmin);
adminRouter.post('/login', loginAdmin);
adminRouter.post('/add', adminAuth, addAdmin);
adminRouter.delete('/admin/:id', adminAuth, deleteAdmin);
adminRouter.get('/students', adminAuth, getAllStudents);
adminRouter.get('/educators', adminAuth, getAllEducators);
adminRouter.get('/admins', adminAuth, getAllAdmins);
adminRouter.get('/dashboard', adminAuth, getAdminDashboard);

export default adminRouter;
