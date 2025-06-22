import React, { useState } from 'react';

const VideoUploadComponent = ({ backendUrl, token, courseId, chapterId, lectureId, onUploadSuccess }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = async () => {
    if (!videoFile) return;
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
          alert('Upload failed: ' + xhr.status + ' ' + xhr.responseText);
        }
      };
      xhr.onerror = () => {
        setUploading(false);
        alert('Upload error: ' + xhr.status + ' ' + xhr.responseText);
      };
      xhr.send(formData);
    } catch (err) {
      setUploading(false);
      alert('Upload error: ' + err.message);
    }
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} disabled={uploading || uploaded} />
      <button onClick={handleUpload} disabled={uploading || !videoFile || uploaded}>
        {uploading ? `Uploading... ${progress}%` : uploaded ? 'Uploaded' : 'Upload Video'}
      </button>
      {progress > 0 && uploading && <progress value={progress} max="100">{progress}%</progress>}
      {uploaded && <span style={{color:'green',marginLeft:8}}>✔</span>}
    </div>
  );
};

export default VideoUploadComponent;
