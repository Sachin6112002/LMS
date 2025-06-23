import User from '../models/User.js';
import connectCloudinary from '../configs/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Update user profile (name, email, password, photo)
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { name, email, password } = req.body;
    let imageUrl;

    // Handle image upload if file is present
    if (req.file) {
      await connectCloudinary();
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'lms_users', resource_type: 'image' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };
      const result = await streamUpload(req.file.buffer);
      imageUrl = result.secure_url;
    }

    // Build update object
    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (password) update.password = password;
    if (imageUrl) update.imageUrl = imageUrl;

    // Update user
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
