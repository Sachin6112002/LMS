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

// Check if any admin exists
export const checkAdminExists = async (req, res) => {
  try {
    const admin = await User.findOne({ 'publicMetadata.role': 'admin' });
    res.json({ exists: !!admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Register the first admin
export const registerAdmin = async (req, res) => {
  try {
    // Only allow if no admin exists
    const admin = await User.findOne({ 'publicMetadata.role': 'admin' });
    if (admin) return res.status(403).json({ success: false, message: 'Admin already exists' });

    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields required' });

    // Check if user with email already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'User already exists' });

    const newAdmin = new User({
      name,
      email,
      password, // In production, hash the password!
      publicMetadata: { role: 'admin' },
    });
    await newAdmin.save();
    res.json({ success: true, message: 'Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
