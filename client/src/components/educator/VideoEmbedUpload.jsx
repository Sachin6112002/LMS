// YouTube/Vimeo Embed Solution (100% FREE)
import React, { useState } from 'react';

const VideoEmbedUpload = ({ onVideoAdded }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [embedCode, setEmbedCode] = useState('');

  const extractVideoId = (url) => {
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return {
        platform: 'youtube',
        id: youtubeMatch[1],
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`
      };
    }

    // Vimeo
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return {
        platform: 'vimeo',
        id: vimeoMatch[1],
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
      };
    }

    return null;
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setVideoUrl(url);
    
    const videoData = extractVideoId(url);
    if (videoData) {
      setEmbedCode(videoData.embedUrl);
    } else {
      setEmbedCode('');
    }
  };

  const handleAddVideo = () => {
    const videoData = extractVideoId(videoUrl);
    if (videoData) {
      onVideoAdded({
        videoUrl: videoData.embedUrl,
        platform: videoData.platform,
        originalUrl: videoUrl
      });
      setVideoUrl('');
      setEmbedCode('');
    } else {
      alert('Please enter a valid YouTube or Vimeo URL');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Video URL (YouTube or Vimeo)
        </label>
        <input
          type="url"
          value={videoUrl}
          onChange={handleUrlChange}
          placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
          className="w-full px-3 py-2 border rounded-md"
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 Upload your video to YouTube/Vimeo first, then paste the link here
        </p>
      </div>

      {embedCode && (
        <div>
          <label className="block text-sm font-medium mb-2">Preview:</label>
          <iframe
            src={embedCode}
            width="400"
            height="225"
            frameBorder="0"
            allowFullScreen
            className="rounded-md"
          />
        </div>
      )}

      <button
        onClick={handleAddVideo}
        disabled={!embedCode}
        className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
      >
        Add Video
      </button>

      <div className="text-sm text-gray-600">
        <h4 className="font-medium">How to use:</h4>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>Upload your video to YouTube or Vimeo</li>
          <li>Copy the video URL</li>
          <li>Paste it above</li>
          <li>Click "Add Video"</li>
        </ol>
        <p className="mt-2 text-green-600">✅ No file size limits, completely FREE!</p>
      </div>
    </div>
  );
};

export default VideoEmbedUpload;
