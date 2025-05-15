const express = require('express');
const { getUsers, manageCourses, updateSettings } = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route to fetch all users
router.get('/users', authenticate, authorizeAdmin, getUsers);

// Route to fetch all courses
router.get('/courses', authenticate, authorizeAdmin, manageCourses);

// Route to manage courses
router.post('/courses', authenticate, authorizeAdmin, manageCourses);

// Route to update admin settings
router.put('/settings', authenticate, authorizeAdmin, updateSettings);

module.exports = router;
