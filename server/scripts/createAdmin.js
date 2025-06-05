// This script creates an admin user in the database for testing/admin login purposes.
import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import '../configs/mongodb.js';

async function createAdmin() {
  const email = 'admin@example.com';
  const password = 'admin123';
  const name = 'Admin User';
  const imageUrl = 'https://ui-avatars.com/api/?name=Admin';

  const existing = await User.findOne({ 'publicMetadata.role': 'admin' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = new User({
    _id: new mongoose.Types.ObjectId().toString(),
    name,
    email,
    imageUrl,
    password: hashedPassword,
    publicMetadata: { role: 'admin' },
  });
  await admin.save();
  console.log('Admin created:', email, 'Password:', password);
  process.exit(0);
}

createAdmin().catch(e => { console.error(e); process.exit(1); });
