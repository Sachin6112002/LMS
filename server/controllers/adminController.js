import User from '../models/User.js';
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import upload from '../configs/multer.js';
import crypto from 'crypto';
import { sendMail } from '../utils/mailer.js';
import bcrypt from 'bcryptjs';

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
    try {
      const admin = await User.findOne({ email, 'publicMetadata.role': 'admin' });
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Admin not found' });
      }
      // Use bcrypt to compare hashed password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '1d' });
      res.json({ success: true, token, admin: { name: admin.name, email: admin.email } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
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
    const { name, email, password, imageUrl } = req.body;
    // Only allow if requester is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    // Check if user with email already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'User already exists' });
    const _id = new mongoose.Types.ObjectId().toString();
    const finalImageUrl = imageUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name);
    const newAdmin = new User({
      _id,
      name,
      email,
      password,
      imageUrl: finalImageUrl,
      publicMetadata: { role: 'admin' },
    });
    await newAdmin.save();
    res.json({ success: true, message: 'Admin added successfully' });
  } catch (error) {
    console.error('Add admin error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete an admin (must be authenticated as admin)
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    // Only allow if requester is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    // Count number of admins
    const adminCount = await User.countDocuments({ 'publicMetadata.role': 'admin' });
    if (adminCount <= 1) {
      return res.status(400).json({ success: false, message: 'Cannot delete the only admin. Add another admin first.' });
    }
    const admin = await User.findById(id);
    if (!admin || admin.publicMetadata.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ 'publicMetadata.role': 'student' }).select('-password -__v');
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all educators
export const getAllEducators = async (req, res) => {
  try {
    const educators = await User.find({ 'publicMetadata.role': 'educator' }).select('-password -__v');
    // Optionally, populate courses if needed
    res.json({ success: true, educators });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all admins (for Settings page)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ 'publicMetadata.role': 'admin' }).select('-password -__v');
    res.json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin dashboard summary route
export const getAdminDashboard = async (req, res) => {
  try {
    // Summary stats
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEarnings = await Purchase.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    // Latest enrollments (last 10 purchases)
    const latestPurchases = await Purchase.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name')
      .populate('courseId', 'courseTitle');
    const enrolledStudentsData = latestPurchases.map(p => ({
      student: { name: p.userId?.name || 'Unknown' },
      courseTitle: p.courseId?.courseTitle || 'Unknown',
      enrollmentDate: p.createdAt.toISOString().split('T')[0],
      status: p.status
    }));
    res.json({
      success: true,
      dashboardData: {
        totalUsers,
        totalCourses,
        totalEarnings: totalEarnings[0]?.total || 0,
        enrolledStudentsData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update student info by admin
export const updateStudentByAdmin = async (req, res) => {
  try {
    const { name, email, active } = req.body;
    await User.findByIdAndUpdate(req.params.id, { name, email, active });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: 'Failed to update student' });
  }
};

// Update student status (activate/deactivate) by admin
export const updateStudentStatusByAdmin = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { active: req.body.active });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: 'Failed to update status' });
  }
};

// Reset student password by admin (email token)
export const resetStudentPasswordByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.json({ success: false, message: 'User not found' });
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    // Send email
    const resetUrl = `https://yourdomain.com/reset-password?token=${token}`;
    await sendMail({
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`
    });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: 'Failed to send reset email' });
  }
};

// Delete student by admin
export const deleteStudentByAdmin = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: 'Failed to delete student' });
  }
};

// Update admin info (name, email, password)
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const update = { name, email };
    if (password) update.password = password;
    await User.findByIdAndUpdate(req.user.id, update);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: 'Failed to update profile' });
  }
};

// Update admin role (superadmin, editor, etc.)
export const updateAdminRole = async (req, res) => {
  try {
    const { role } = req.body;
    await User.findByIdAndUpdate(req.params.id, { 'publicMetadata.role': role });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: 'Failed to update role' });
  }
};

// Update user role (for any user, not just admin)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, { 'publicMetadata.role': role }, { new: true });
    if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete any user (admin, student, educator)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get admin profile (for Profile page)
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select('-password -__v');
    if (!admin || admin.publicMetadata.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.json({ success: true, profile: admin });
  } catch (err) {
    res.json({ success: false, message: 'Failed to fetch profile' });
  }
};
