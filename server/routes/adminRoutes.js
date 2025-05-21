import express from 'express';
import { getAllUsers, getAllCourses, getAllPurchases, checkAdminExists, registerAdmin } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.get('/users', getAllUsers);
adminRouter.get('/courses', getAllCourses);
adminRouter.get('/purchases', getAllPurchases);
adminRouter.get('/check-admin-exists', checkAdminExists);
adminRouter.post('/register', registerAdmin);

export default adminRouter;
