import express from 'express';
import { getUsers, manageCourses, updateSettings } from '../controllers/adminController';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// Route to fetch all users
router.get('/users', authenticate, authorizeAdmin, getUsers);

// Route to fetch all courses
router.get('/courses', authenticate, authorizeAdmin, manageCourses);

// Route to manage courses
router.post('/courses', authenticate, authorizeAdmin, manageCourses);

// Route to update admin settings
router.put('/settings', authenticate, authorizeAdmin, updateSettings);

export default router;
