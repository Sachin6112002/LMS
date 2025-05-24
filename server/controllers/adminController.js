import User from '../models/User.js';
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import upload from '../configs/multer.js';

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

    let imageUrl = req.body.imageUrl;
    if (req.file) {
      // If an image file is uploaded, use its path as the imageUrl
      imageUrl = `/uploads/${req.file.filename}`;
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email, and password are required' });

    // Check if user with email already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'User already exists' });

    const newAdmin = new User({
      _id: new mongoose.Types.ObjectId().toString(),
      name,
      email,
      password, // In production, hash the password!
      imageUrl: imageUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name),
      publicMetadata: { role: 'admin' },
    });
    await newAdmin.save();
    // Generate JWT and return admin info for auto-login
    const token = jwt.sign({ id: newAdmin._id, role: 'admin' }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '1d' });
    res.json({ success: true, token, admin: { name: newAdmin.name, email: newAdmin.email, imageUrl: newAdmin.imageUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, 'publicMetadata.role': 'admin' });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin not found' });
    }
    // In production, use hashed passwords!
    if (admin.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '1d' });
    res.json({ success: true, token, admin: { name: admin.name, email: admin.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Publish/Unpublish a course by admin
export const toggleCoursePublish = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    course.isPublished = isPublished;
    await course.save();
    res.json({ success: true, isPublished: course.isPublished });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a course by admin
export const deleteCourseByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add another admin (must be authenticated as admin)
export const addAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Only allow if requester is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
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
    res.json({ success: true, message: 'Admin added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
