import express from 'express';
import { getAllUsers, getAllCourses, getAllPurchases, checkAdminExists, registerAdmin, toggleCoursePublish, deleteCourseByAdmin, loginAdmin, addAdmin, deleteAdmin, getAllStudents, getAllEducators, getAllAdmins, getAdminDashboard, updateStudentByAdmin, updateStudentStatusByAdmin, resetStudentPasswordByAdmin, deleteStudentByAdmin, updateAdminProfile, updateAdminRole, getAuditLogs } from '../controllers/adminController.js';
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
adminRouter.patch('/students/:id', adminAuth, updateStudentByAdmin);
adminRouter.patch('/students/:id/status', adminAuth, updateStudentStatusByAdmin);
adminRouter.post('/students/:id/reset-password', adminAuth, resetStudentPasswordByAdmin);
adminRouter.delete('/students/:id', adminAuth, deleteStudentByAdmin);
adminRouter.patch('/profile', adminAuth, updateAdminProfile);
adminRouter.patch('/admin/:id/role', adminAuth, updateAdminRole);
adminRouter.get('/audit-logs', adminAuth, getAuditLogs);

export default adminRouter;
