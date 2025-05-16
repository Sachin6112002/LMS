import express from 'express';
import { getUsers, getCourses, manageCourses, updateSettings } from '../controllers/adminController.js';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware.js';
import User from '../models/User.js'; // Import the User model with correct path
import Course from '../models/Course.js'; // Import the Course model

const router = express.Router();

// Route to fetch all users
router.get('/users', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '_id name email imageUrl enrolledCourses'); // Fetch specific fields
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// Route to fetch all courses
router.get('/courses', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const courses = await Course.find({}, 'courseTitle courseDescription courseThumbnail coursePrice isPublished discount'); // Fetch specific fields
        res.status(200).json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Failed to fetch courses' });
    }
});

// Route to manage courses
router.post('/courses', authenticate, authorizeAdmin, manageCourses);

// Route to update admin settings
router.put('/settings', authenticate, authorizeAdmin, updateSettings);

// Update user role (admin action)
router.put('/users/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!role) return res.status(400).json({ success: false, message: 'Role is required' });
        const user = await User.findByIdAndUpdate(id, { 'publicMetadata.role': role }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: `User role updated to ${role}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
