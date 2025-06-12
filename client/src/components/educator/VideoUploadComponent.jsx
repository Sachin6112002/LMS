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
      const xhr = new window.XMLHttpRequest();
      xhr.open('POST', `${backendUrl}/api/educator/upload-video`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        setUploading(false);
        if (xhr.status === 200) {
          setUploaded(true);
          onUploadSuccess && onUploadSuccess(JSON.parse(xhr.responseText).filename);
        } else {
          alert('Upload failed');
        }
      };
      xhr.onerror = () => {
        setUploading(false);
        alert('Upload error');
      };
      xhr.send(formData);
    } catch (err) {
      setUploading(false);
      alert('Upload error');
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
