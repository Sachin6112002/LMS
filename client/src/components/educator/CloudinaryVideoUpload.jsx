import React, { useState } from 'react';

const CloudinaryVideoUpload = ({ 
  onUploadSuccess, 
  courseId, 
  chapterId, 
  backendUrl, 
  token,
  lectureTitle,
  lectureDescription 
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);

  // Cloudinary configuration - Replace with your actual values
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'denhmcs4e';
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'lms_video_uploads';

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (now can be much larger - up to 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert(`File is too large! Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size allowed is 100MB.`);
      return;
    }

    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file.');
      return;
    }

    setVideoFile(file);
    console.log(`Selected video: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
  };

  const uploadToCloudinary = async () => {
    if (!videoFile) {
      alert('Please select a video file first.');
      return;
    }

    if (!lectureTitle?.trim()) {
      alert('Please enter a lecture title first.');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Upload video directly to Cloudinary
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('resource_type', 'video');
      formData.append('folder', 'lms_lectures'); // Organize uploads in folders

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
          console.log(`Upload Progress: ${percentComplete}%`);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          try {
            const cloudinaryResponse = JSON.parse(xhr.responseText);
            console.log('Cloudinary upload successful:', cloudinaryResponse);

            // Step 2: Send video URL to your backend to create the lecture
            const lectureData = {
              courseId,
              chapterId,
              title: lectureTitle,
              description: lectureDescription || '',
              videoUrl: cloudinaryResponse.secure_url,
              duration: Math.round(cloudinaryResponse.duration) || 0
            };

            const response = await fetch(`${backendUrl}/api/educator/add-lecture-cloudinary`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(lectureData)
            });

            const result = await response.json();

            if (result.success) {
              alert('Lecture added successfully!');
              onUploadSuccess && onUploadSuccess(result);
              setVideoFile(null);
              setProgress(0);
            } else {
              alert('Failed to create lecture: ' + result.message);
            }
          } catch (error) {
            console.error('Error creating lecture:', error);
            alert('Failed to create lecture after upload.');
          }
        } else {
          console.error('Cloudinary upload failed:', xhr.status, xhr.responseText);
          alert('Upload failed. Please try again.');
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        console.error('Upload error occurred');
        alert('Upload error: Network connection failed.');
        setUploading(false);
      };

      // Upload to Cloudinary
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;
      xhr.open('POST', cloudinaryUrl);
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload error: ' + error.message);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Video File
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        />
        <p className="text-sm text-gray-500 mt-1">
          Maximum file size: 100MB (Direct upload - no server limits!)
        </p>
        {videoFile && (
          <p className="text-sm text-green-600 mt-1">
            Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)}MB)
          </p>
        )}
      </div>

      <button
        onClick={uploadToCloudinary}
        disabled={uploading || !videoFile || !lectureTitle?.trim()}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? `Uploading to Cloud... ${progress}%` : 'Upload Video & Create Lecture'}
      </button>

      {uploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Uploading directly to cloud storage... {progress}%
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <h4 className="text-sm font-medium text-blue-800 mb-2">🚀 Direct Cloud Upload Benefits:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ No 8MB server limits - upload up to 100MB videos</li>
          <li>✅ Faster uploads directly to Cloudinary</li>
          <li>✅ Automatic video optimization and streaming</li>
          <li>✅ No 413 payload errors</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <p className="text-sm text-yellow-800">
          <strong>Setup Required:</strong> You need to configure Cloudinary upload presets. 
          <br />
          Update <code>CLOUDINARY_UPLOAD_PRESET</code> and <code>CLOUDINARY_CLOUD_NAME</code> in this component.
        </p>
      </div>
    </div>
  );
};

export default CloudinaryVideoUpload;
