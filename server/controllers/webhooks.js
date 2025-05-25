import User from "../models/User.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// User Registration Controller
export const registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      name,
      resume: '',
      enrolledCourses: [],
      publicMetadata: { role: 'student' }
    });
    await user.save();
    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User Login Controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id, role: user.publicMetadata?.role || 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, email: user.email, name: user.name, role: user.publicMetadata?.role || 'student' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};