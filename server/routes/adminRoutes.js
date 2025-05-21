import express from 'express';
import { getAllUsers, getAllCourses, getAllPurchases } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.get('/users', getAllUsers);
adminRouter.get('/courses', getAllCourses);
adminRouter.get('/purchases', getAllPurchases);

export default adminRouter;
