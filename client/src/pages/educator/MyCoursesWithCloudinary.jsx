// Example integration of CloudinaryVideoUpload into MyCourses.jsx
// Add this to your existing MyCourses.jsx file

import React, { useState, useEffect } from 'react';
import CloudinaryVideoUpload from '../components/educator/CloudinaryVideoUpload';
// ... other imports

const MyCoursesWithCloudinary = () => {
  // ... existing state
  const [uploadMethod, setUploadMethod] = useState('cloudinary'); // Default to cloudinary

  // ... existing functions

  // New function for handling Cloudinary upload success
  const handleCloudinaryUploadSuccess = (result) => {
    toast.success('Lecture added successfully via cloud upload!');
    setShowContentModal(false);
    fetchEducatorCourses(); // Refresh courses
    
    // Reset form
    setLectureForm({
      title: '',
      description: '',
      duration: '',
      chapterId: '',
      videoFile: null
    });
  };

  return (
    <div>
      {/* ... existing JSX ... */}
      
      {/* Modified Add Lecture Modal */}
      {showContentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Add New Lecture</h3>
            
            <div className="space-y-4">
              {/* Chapter Selection */}
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Select Chapter</label>
                <select
                  value={lectureForm.chapterId}
                  onChange={(e) => setLectureForm(prev => ({ ...prev, chapterId: e.target.value }))}
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a chapter</option>
                  {selectedCourse?.chapters?.map(chapter => (
                    <option key={chapter._id} value={chapter._id}>{chapter.title}</option>
                  ))}
                </select>
              </div>

              {/* Lecture Title */}
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Lecture Title</label>
                <input
                  type="text"
                  value={lectureForm.title}
                  onChange={(e) => setLectureForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter lecture title"
                />
              </div>

              {/* Lecture Description */}
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Description (Optional)</label>
                <textarea
                  value={lectureForm.description}
                  onChange={(e) => setLectureForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Enter lecture description"
                />
              </div>

              {/* Upload Method Selection */}
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Upload Method</label>
                <div className="flex space-x-4 mb-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="cloudinary"
                      checked={uploadMethod === 'cloudinary'}
                      onChange={(e) => setUploadMethod(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      🚀 Cloud Upload (up to 100MB) - <span className="text-green-600 font-medium">Recommended</span>
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="server"
                      checked={uploadMethod === 'server'}
                      onChange={(e) => setUploadMethod(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Server Upload (up to 8MB)</span>
                  </label>
                </div>
              </div>

              {/* Conditional Upload Component */}
              {uploadMethod === 'cloudinary' ? (
                <div className="border-2 border-dashed border-green-300 rounded-lg p-4">
                  <CloudinaryVideoUpload
                    courseId={selectedCourse?._id}
                    chapterId={lectureForm.chapterId}
                    backendUrl={backendUrl}
                    token={localStorage.getItem('token')} // or however you get the token
                    lectureTitle={lectureForm.title}
                    lectureDescription={lectureForm.description}
                    onUploadSuccess={handleCloudinaryUploadSuccess}
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {/* Original Server Upload */}
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">Video File</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      disabled={isUploadingLecture}
                      className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a video file. Maximum size: 8MB. Duration will be detected automatically.
                    </p>
                    {lectureForm.videoFile && (
                      <p className="text-xs text-green-600 mt-1">
                        Selected: {lectureForm.videoFile.name} ({(lectureForm.videoFile.size / (1024 * 1024)).toFixed(1)}MB)
                      </p>
                    )}
                  </div>
                  
                  {/* Duration field for server upload */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-green-700 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={lectureForm.duration}
                      onChange={(e) => setLectureForm(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Auto-detected from video"
                      readOnly={!!lectureForm.videoFile}
                    />
                  </div>

                  {/* Server Upload Button */}
                  <div className="mt-4">
                    <button
                      onClick={addLectureToChapter}
                      disabled={isUploadingLecture || !lectureForm.videoFile}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingLecture ? 'Uploading...' : 'Upload & Add Lecture'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Actions - Only show Cancel for Cloudinary (it handles its own upload) */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowContentModal(false)}
                disabled={isUploadingLecture}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ... rest of existing JSX ... */}
    </div>
  );
};

export default MyCoursesWithCloudinary;
