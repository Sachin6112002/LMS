const User = require('../models/User');
const Course = require('../models/Course');

// Fetch all users
exports.getUsers = async (req, res) => {
  try {
    console.log('getUsers called'); // Debugging log
    const users = await User.find(); // Fetch all users from the database
    console.log('Users fetched:', users); // Log fetched users
    res.status(200).json(users);
  } catch (error) {
    console.error('Error in getUsers:', error); // Log error
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Fetch all courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find(); // Fetch all courses from the database
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

// Manage courses
exports.manageCourses = async (req, res) => {
  try {
    const { courseId, action, courseData } = req.body;

    if (action === 'delete') {
      await Course.findByIdAndDelete(courseId); // Delete a course by ID
      res.status(200).json({ message: 'Course deleted successfully' });
    } else if (action === 'update') {
      const updatedCourse = await Course.findByIdAndUpdate(courseId, courseData, { new: true }); // Update course details
      res.status(200).json(updatedCourse);
    } else if (action === 'create') {
      const newCourse = new Course(courseData); // Create a new course
      await newCourse.save();
      res.status(201).json(newCourse);
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to manage courses' });
  }
};

// Update admin settings
exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    // Assuming settings are stored in a collection or a config file
    // Add logic to update settings in the database
    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
