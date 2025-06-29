// Direct Cloudinary Upload Component (FREE solution)
import React, { useState } from 'react';

const DirectCloudinaryUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadToCloudinary = async (file) => {
    if (!file) return;

    // Check file size (can be much larger now - up to 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert('File too large! Maximum: 100MB');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'your_upload_preset'); // Configure in Cloudinary
      formData.append('resource_type', 'video');

      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          console.log('Upload successful:', response.secure_url);
          onUploadSuccess(response.secure_url, response.duration);
        } else {
          alert('Upload failed');
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        alert('Upload error');
        setUploading(false);
      };

      // Direct upload to Cloudinary (bypasses your server completely)
      xhr.open('POST', 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/video/upload');
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="video/*" 
        onChange={(e) => uploadToCloudinary(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && (
        <div>
          <div>Uploading... {progress}%</div>
          <progress value={progress} max="100">{progress}%</progress>
        </div>
      )}
      <p className="text-sm text-gray-500">Maximum file size: 100MB (Direct upload)</p>
    </div>
  );
};

export default DirectCloudinaryUpload;
