import React, { useState } from 'react';

const VideoUploadComponent = ({ backendUrl, token, courseId, chapterId, lectureId, onUploadSuccess }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!videoFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('courseId', courseId);
    formData.append('chapterId', chapterId);
    formData.append('lectureId', lectureId);

    try {
      const res = await fetch(`${backendUrl}/api/educator/upload-video`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert('Video uploaded!');
        onUploadSuccess && onUploadSuccess(data.filename);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      alert('Upload error');
    }
    setUploading(false);
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={uploading || !videoFile}>
        {uploading ? 'Uploading...' : 'Upload Video'}
      </button>
    </div>
  );
};

export default VideoUploadComponent;
