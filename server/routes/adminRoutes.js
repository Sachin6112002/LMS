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
        // Only allow admin to assign admin role
        if (role === 'admin' && req.user.publicMetadata.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only admins can assign admin role.' });
        }
        const user = await User.findByIdAndUpdate(id, { 'publicMetadata.role': role }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: `User role updated to ${role}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin dashboard route
router.get('/dashboard', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();

        // Aggregate total earnings from purchases
        let totalEarnings = 0;
        let enrolledStudentsData = [];
        try {
            const Purchase = (await import('../models/Purchase.js')).default;
            const purchases = await Purchase.find({}).sort({ createdAt: -1 }).limit(10).populate('userId').populate('courseId');
            totalEarnings = await Purchase.aggregate([
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);
            totalEarnings = totalEarnings[0]?.total || 0;
            enrolledStudentsData = purchases.map(p => ({
                student: {
                    name: p.userId?.name || 'Unknown',
                    imageUrl: p.userId?.imageUrl || '',
                },
                courseTitle: p.courseId?.courseTitle || 'Unknown',
                enrollmentDate: p.createdAt ? p.createdAt.toISOString().split('T')[0] : '',
                status: p.status || 'Completed',
            }));
        } catch (e) {
            // If Purchase model or data is missing, fallback to empty
            totalEarnings = 0;
            enrolledStudentsData = [];
        }

        res.json({
            success: true,
            dashboardData: {
                totalUsers,
                totalCourses,
                totalEarnings,
                enrolledStudentsData
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
