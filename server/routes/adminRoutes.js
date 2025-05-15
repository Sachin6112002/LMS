import express from 'express';
import { getUsers, manageCourses, updateSettings } from '../controllers/adminController';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware';
import User from '../models/User'; // Import the User model

const router = express.Router();

// Route to fetch all users
router.get('/users', authenticate, authorizeAdmin, getUsers);

// Route to fetch all courses
router.get('/courses', authenticate, authorizeAdmin, manageCourses);

// Route to manage courses
router.post('/courses', authenticate, authorizeAdmin, manageCourses);

// Route to update admin settings
router.put('/settings', authenticate, authorizeAdmin, updateSettings);

// Updated route to fetch all users
router.get('/users', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '_id name email imageUrl enrolledCourses'); // Fetch specific fields
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

export default router;
