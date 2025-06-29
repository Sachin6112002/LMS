# 🚨 CLOUDINARY 400 ERROR FIX

## Problem: Upload failing with 400 Bad Request

The `ml_default` preset might not be configured correctly for video uploads. Here's how to fix it:

## 🔧 Quick Fix - Create New Video Upload Preset:

### Step 1: Create LMS Video Preset
1. Go to your Cloudinary dashboard: https://cloudinary.com/console
2. Navigate to **Settings** → **Upload** → **Upload presets**
3. Click **Add upload preset**
4. Configure:
   ```
   Preset name: lms_video_uploads
   Signing Mode: Unsigned ✅ (IMPORTANT!)
   Resource type: Video
   Max file size: 104857600 (100MB)
   Allowed formats: mp4,mov,avi,mkv,webm,m4v
   Auto backup: No
   Overwrite: false
   Use filename: true
   Unique filename: true
   ```
5. **Save**

### Step 2: Update Your Configuration
Update your `.env` file:
```env
REACT_APP_CLOUDINARY_CLOUD_NAME=denhmcs4e
REACT_APP_CLOUDINARY_UPLOAD_PRESET=lms_video_uploads
```

### Step 3: Update Vercel Environment Variables
In Vercel dashboard → Settings → Environment Variables:
```
REACT_APP_CLOUDINARY_CLOUD_NAME = denhmcs4e
REACT_APP_CLOUDINARY_UPLOAD_PRESET = lms_video_uploads
```

## 🧪 Test the Fix:
1. Restart your dev server: `npm start`
2. Check browser console for debug logs
3. Try uploading a video
4. Should work without 400 errors!

## 🔍 Debug Info:
Check browser console for:
- "Cloudinary Config Check" logs
- "Uploading to:" URL
- "Upload preset:" name
- Any error details

## ⚠️ Common Issues:
- **Preset not found**: Create the preset as shown above
- **Signed preset**: Must be "Unsigned" for browser uploads  
- **Wrong resource type**: Must allow "Video"
- **File size limits**: Set to 100MB (104857600 bytes)

This should resolve the 400 error and allow successful video uploads! 🚀
