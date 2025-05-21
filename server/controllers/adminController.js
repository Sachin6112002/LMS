import User from '../models/User.js';
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';

// Assign admin role to the very first user
export const assignAdminToFirstUser = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 1) {
    const firstUser = await User.findOne();
    if (firstUser && (!firstUser.publicMetadata || firstUser.publicMetadata.role !== 'admin')) {
      firstUser.publicMetadata = { ...firstUser.publicMetadata, role: 'admin' };
      await firstUser.save();
    }
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    await assignAdminToFirstUser(); // Ensure first user is admin
    const users = await User.find().select('-__v');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().select('-__v');
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all purchases
export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().populate('courseId', 'courseTitle').populate('userId', 'name email imageUrl');
    res.json({ success: true, purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
