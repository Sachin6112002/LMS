import User from '../models/User.js';
import Course from '../models/Course.js';

// Fetch all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '_id name email imageUrl enrolledCourses'); // Fetch specific fields
    res.status(200).json(users);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Fetch all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}, 'courseTitle courseDescription courseThumbnail coursePrice isPublished discount'); // Fetch specific fields
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error in getCourses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

// Manage courses
export const manageCourses = async (req, res) => {
  try {
    const { courseId, action, courseData } = req.body;

    if (action === 'delete') {
      await Course.findByIdAndDelete(courseId);
      res.status(200).json({ message: 'Course deleted successfully' });
    } else if (action === 'update') {
      const updatedCourse = await Course.findByIdAndUpdate(courseId, courseData, { new: true });
      res.status(200).json(updatedCourse);
    } else if (action === 'create') {
      const newCourse = new Course(courseData);
      await newCourse.save();
      res.status(201).json(newCourse);
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error in manageCourses:', error);
    res.status(500).json({ error: 'Failed to manage courses' });
  }
};

// Update admin settings
export const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    // Add logic to update settings in the database
    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error in updateSettings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// Utility: Assign admin role to first user
export const assignAdminToFirstUser = async (userId) => {
  const adminExists = await User.findOne({ 'publicMetadata.role': 'admin' });
  if (!adminExists) {
    await User.findByIdAndUpdate(userId, { 'publicMetadata.role': 'admin' });
    return true;
  }
  return false;
};
