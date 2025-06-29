import React, { useState } from 'react';

const VideoUploadComponent = ({ backendUrl, token, courseId, chapterId, lectureId, onUploadSuccess }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = async () => {
    if (!videoFile) return;
    
    // Check file size before uploading (15MB limit)
    const maxSize = 15 * 1024 * 1024; // 15MB in bytes
    if (videoFile.size > maxSize) {
      alert(`File is too large! Your file is ${(videoFile.size / 1024 / 1024).toFixed(1)}MB. Maximum size allowed is 15MB. Please compress your video.`);
      return;
    }
    
    setUploading(true);
    setProgress(0);
    setUploaded(false);
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('courseId', courseId);
    formData.append('chapterId', chapterId);
    formData.append('lectureId', lectureId);

    try {
      const url = `${backendUrl}/api/educator/upload-video`;
      const xhr = new window.XMLHttpRequest();
      xhr.open('POST', url);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = async () => {
        setUploading(false);
        if (xhr.status === 200) {
          setUploaded(true);
          // Extract video duration and update backend
          if (videoFile) {
            const videoUrl = URL.createObjectURL(videoFile);
            const tempVideo = document.createElement('video');
            tempVideo.preload = 'metadata';
            tempVideo.src = videoUrl;
            tempVideo.onloadedmetadata = async () => {
              URL.revokeObjectURL(videoUrl);
              const duration = Math.round(tempVideo.duration / 60); // in minutes
              try {
                await fetch(`${backendUrl}/api/educator/update-lecture-duration`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ courseId, chapterId, lectureId, duration })
                });
              } catch (err) {
                // ignore error, just show alert
                alert('Failed to update duration');
              }
              onUploadSuccess && onUploadSuccess(JSON.parse(xhr.responseText).filename);
            };
          } else {
            onUploadSuccess && onUploadSuccess(JSON.parse(xhr.responseText).filename);
          }
        } else {
          if (xhr.status === 413) {
            alert('File is too large! Maximum size allowed is 15MB. Please compress your video or use a smaller file.');
          } else if (xhr.status === 500) {
            const response = xhr.responseText ? JSON.parse(xhr.responseText) : {};
            if (response.message && response.message.includes('too large')) {
              alert('File size error: ' + response.message);
            } else {
              alert('Server error. Please try again with a smaller file.');
            }
          } else {
            alert('Upload failed: ' + xhr.status + ' ' + (xhr.responseText || 'Unknown error'));
          }
        }
      };
      xhr.onerror = () => {
        setUploading(false);
        alert('Upload error: Network connection failed or file may be too large. Please check your internet connection and file size (max 15MB).');
      };
      xhr.send(formData);
    } catch (err) {
      setUploading(false);
      alert('Upload error: ' + err.message);
    }
  };

  return (
    <div>
      <div className="mb-2">
        <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} disabled={uploading || uploaded} />
        <p className="text-sm text-gray-500 mt-1">Maximum file size: 15MB</p>
      </div>
      <button onClick={handleUpload} disabled={uploading || !videoFile || uploaded}>
        {uploading ? `Uploading... ${progress}%` : uploaded ? 'Uploaded' : 'Upload Video'}
      </button>
      {progress > 0 && uploading && <progress value={progress} max="100">{progress}%</progress>}
      {uploaded && <span style={{color:'green',marginLeft:8}}>✔</span>}
    </div>
  );
};

export default VideoUploadComponent;
