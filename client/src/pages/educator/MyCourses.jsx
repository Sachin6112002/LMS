import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';

const MyCourses = () => {

  const { backendUrl, isEducator, currency, getToken, userData } = useContext(AppContext)
  const navigate = useNavigate();

  const [courses, setCourses] = useState(null)
  const [showChapterModal, setShowChapterModal] = useState(false)
  const [showContentModal, setShowContentModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [chapterForm, setChapterForm] = useState({ title: '', description: '' })
  const [lectureForm, setLectureForm] = useState({ 
    title: '', 
    description: '', 
    duration: '', 
    chapterId: '' 
  })
  const [isUploadingLecture, setIsUploadingLecture] = useState(false)

  // Cloudinary configuration - UPDATE THESE WITH YOUR VALUES
  const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'denhmcs4e';
  const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

  // Debug: Check if environment variables are loaded
  React.useEffect(() => {
    console.log('Cloudinary Config Check:');
    console.log('Cloud Name:', CLOUDINARY_CLOUD_NAME);
    console.log('Upload Preset:', CLOUDINARY_UPLOAD_PRESET);
    console.log('Environment variables loaded:', {
      cloud: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
      preset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
    });
  }, []);

  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken();
      console.log('MyCourses: Token received:', !!token);
      console.log('MyCourses: userData available:', !!userData);
      console.log('MyCourses: isEducator value:', isEducator);
      
      // Try to get educator-specific courses first
      try {
        const { data } = await axios.get(backendUrl + '/api/educator/courses', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (data.success) {
          console.log('MyCourses: Got educator courses directly:', data.courses.length);
          setCourses(data.courses);
          return;
        }
      } catch (educatorError) {
        console.log('MyCourses: Educator endpoint error:', educatorError.response?.data?.message || educatorError.message);
        console.log('MyCourses: Falling back to filtering all courses');
      }
      
      // Fallback: Use general courses endpoint and filter
      const { data } = await axios.get(backendUrl + '/api/courses', { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        console.log('MyCourses: Total courses received:', data.courses.length);
        // If backend returns all courses, filter by educatorId if needed
        const educatorId = (typeof isEducator === 'object' && isEducator._id) ? isEducator._id : 
                          (userData && userData._id) ? userData._id : null;
        console.log('MyCourses: Educator ID determined as:', educatorId);
        
        if (educatorId) {
          const myCourses = data.courses.filter(c => c.educator && (c.educator._id === educatorId || c.educator === educatorId));
          console.log('MyCourses: Filtered courses count:', myCourses.length);
          setCourses(myCourses);
        } else {
          console.log('MyCourses: No educator ID found, showing all courses');
          setCourses(data.courses);
        }
      } else {
        console.error('MyCourses: API error:', data.message);
        toast.error(data.message || 'Failed to fetch courses');
      }
    } catch (error) {
      console.error('MyCourses: Fetch error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch course data';
      toast.error(errorMessage);
    }
  }

  // Helper: check if course thumbnail is missing and show a warning toast
  useEffect(() => {
    if (courses && courses.length > 0) {
      const missingThumb = courses.find(c => !c.courseThumbnail || c.courseThumbnail === '');
      if (missingThumb) {
        toast.warn(`Some courses are missing a thumbnail. Please upload a thumbnail to improve course visibility.`);
      }
    }
  }, [courses]);

  useEffect(() => {
    console.log('MyCourses useEffect: isEducator:', isEducator, 'userData:', !!userData);
    if (isEducator) {
      fetchEducatorCourses()
    }
  }, [isEducator])

  // Handler functions for course actions
  const handleEditCourse = (courseId) => {
    navigate(`/educator/edit-course/${courseId}`);
  };

  const handleAddChapter = (courseId) => {
    const course = courses.find(c => c._id === courseId);
    setSelectedCourse(course);
    setChapterForm({ title: '', description: '' });
    setShowChapterModal(true);
  };

  const handleManageContent = (courseId) => {
    const course = courses.find(c => c._id === courseId);
    setSelectedCourse(course);
    setLectureForm({ title: '', description: '', videoFile: null, duration: '', chapterId: '' });
    setShowContentModal(true);
  };

  // Add new chapter to course
  const addChapterToCourse = async () => {
    if (!selectedCourse || !chapterForm.title.trim()) {
      toast.error('Please enter a chapter title');
      return;
    }

    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/educator/add-chapter`,
        {
          courseId: selectedCourse._id,
          title: chapterForm.title,
          description: chapterForm.description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success('Chapter added successfully!');
        setShowChapterModal(false);
        fetchEducatorCourses(); // Refresh courses
      } else {
        toast.error(data.message || 'Failed to add chapter');
      }
    } catch (error) {
      console.error('Add chapter error:', error);
      toast.error(error.response?.data?.message || 'Failed to add chapter');
    }
  };

  // Add new lecture to chapter with Cloudinary direct upload
  const addLectureToChapter = async (videoFile) => {
    if (!selectedCourse || !lectureForm.title.trim() || !lectureForm.chapterId) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    // Check file size (now supports up to 100MB with Cloudinary)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (videoFile.size > maxSize) {
      toast.error(`Video file is too large! Maximum size allowed is 100MB. Please compress your video.`);
      return;
    }

    setIsUploadingLecture(true);
    
    try {
      toast.info('Uploading video to cloud... This may take a while for large files.');

      // Step 1: Upload video directly to Cloudinary
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('resource_type', 'video');
      // Remove folder specification as it might cause 400 error
      
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;
      
      console.log('Uploading to:', cloudinaryUrl);
      console.log('Upload preset:', CLOUDINARY_UPLOAD_PRESET);
      console.log('Cloud name:', CLOUDINARY_CLOUD_NAME);
      
      const cloudinaryResponse = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            console.log(`Upload Progress: ${percentComplete}%`);
          }
        };

        xhr.onload = () => {
          console.log('Cloudinary response status:', xhr.status);
          console.log('Cloudinary response:', xhr.responseText);
          
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            console.error('Upload failed with status:', xhr.status);
            console.error('Response:', xhr.responseText);
            reject(new Error(`Upload failed: ${xhr.status} - ${xhr.responseText}`));
          }
        };

        xhr.onerror = () => {
          console.error('Network error during upload');
          reject(new Error('Network error'));
        };
        
        xhr.open('POST', cloudinaryUrl);
        xhr.send(formData);
      });

      console.log('Cloudinary upload successful:', cloudinaryResponse);

      // Step 2: Create lecture with Cloudinary URL
      const token = await getToken();
      
      // Convert duration from seconds to minutes and update form
      const durationInMinutes = Math.round(cloudinaryResponse.duration / 60) || 0;
      setLectureForm(prev => ({ ...prev, duration: durationInMinutes }));
      
      const lectureData = {
        courseId: selectedCourse._id,
        chapterId: lectureForm.chapterId,
        title: lectureForm.title,
        description: lectureForm.description || '',
        videoUrl: cloudinaryResponse.secure_url,
        duration: durationInMinutes
      };

      const { data } = await axios.post(
        `${backendUrl}/api/educator/add-lecture-cloudinary`,
        lectureData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (data.success) {
        toast.success('Lecture added successfully!');
        setShowContentModal(false);
        setLectureForm({ title: '', description: '', duration: '', chapterId: '' });
        fetchEducatorCourses(); // Refresh courses
      } else {
        toast.error(data.message || 'Failed to create lecture');
      }
    } catch (error) {
      console.error('Add lecture error:', error);
      if (error.message.includes('Upload failed')) {
        toast.error('Video upload failed. Please check your internet connection and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add lecture');
      }
    } finally {
      setIsUploadingLecture(false);
    }
  };

  // Handle video file selection for Cloudinary upload
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024);
      
      // Check file size (100MB limit for Cloudinary)
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`File too large! Your file is ${fileSizeMB.toFixed(1)}MB. Maximum size allowed is 100MB.`);
        return;
      }

      // Check if it's a video file
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file.');
        return;
      }
      
      console.log(`Selected video: ${file.name}, Size: ${fileSizeMB.toFixed(1)}MB`);
      toast.success(`Video selected: ${file.name} (${fileSizeMB.toFixed(1)}MB)`);
      
      // Store the file for upload when user clicks the upload button
      setLectureForm(prev => ({ ...prev, selectedVideoFile: file }));
    }
  };

  // Show loading while waiting for courses to load
  if (!courses) {
    return (
      <div className="h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-green-700">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 bg-green-50">
      <div className='w-full'>
        <div className="flex justify-between items-center pb-4">
          <h2 className="text-lg font-medium text-green-900">My Courses ({courses.length})</h2>
          <button
            onClick={() => navigate('/educator/add-course')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
          >
            <span>+</span>
            <span>Create New Course</span>
          </button>
        </div>
        {courses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-green-700">No courses found. Create your first course to get started!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-green-200">
            <table className="md:table-auto table-fixed w-full overflow-hidden">
              <thead className="text-green-900 border-b border-green-200 text-sm text-left">
                <tr className='overflow-scroll'>
                  <th className="px-4 py-3 font-semibold truncate">Course Details</th>
                  <th className="px-4 py-3 font-semibold truncate">Content</th>
                  <th className="px-4 py-3 font-semibold truncate">Earnings</th>
                  <th className="px-4 py-3 font-semibold truncate">Students</th>
                  <th className="px-4 py-3 font-semibold truncate">Status</th>
                  <th className="px-4 py-3 font-semibold truncate">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-green-700">
                {courses.map((course) => {
                  // Defensive check for course properties
                  if (!course || !course._id) {
                    console.warn('MyCourses: Invalid course data found:', course);
                    return null;
                  }
                  
                  return (
                    <tr key={course._id} className="border-b border-green-200">
                      <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                        {course.courseThumbnail ? (
                          <img src={course.courseThumbnail} alt="Course Image" className="w-16 h-12 object-cover rounded" />
                        ) : (
                          <span className="w-16 h-12 flex items-center justify-center bg-yellow-100 text-yellow-800 rounded text-xs">No Image</span>
                        )}
                        <div className="hidden md:block">
                          <div className="font-medium text-sm">{course.courseTitle || 'Untitled Course'}</div>
                          <div className="text-xs text-gray-500">
                            Created: {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="text-green-700 font-medium">
                            {course.chapters?.length || 0} chapters
                          </div>
                          <div className="text-gray-500 text-xs">
                            {course.chapters?.reduce((total, chapter) => total + (chapter.lectures?.length || 0), 0) || 0} lectures
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">
                          {currency} {Math.floor((course.enrolledStudents?.length || 0) * ((course.coursePrice || 0) - (course.discount || 0) * (course.coursePrice || 0) / 100))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{course.enrolledStudents?.length || 0}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {course.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleEditCourse(course._id)}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200 whitespace-nowrap"
                          >
                            📝 Edit
                          </button>
                          <button
                            onClick={() => handleAddChapter(course._id)}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200 whitespace-nowrap"
                          >
                            📚 Add Chapter
                          </button>
                          <button
                            onClick={() => handleManageContent(course._id)}
                            className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs hover:bg-purple-200 whitespace-nowrap"
                          >
                            🎥 Add Lectures
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              Add New Chapter to "{selectedCourse?.courseTitle}"
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Chapter Title</label>
                <input
                  type="text"
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter chapter title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Chapter Description</label>
                <textarea
                  value={chapterForm.description}
                  onChange={(e) => setChapterForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Enter chapter description"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowChapterModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={addChapterToCourse}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Chapter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Content Modal */}
      {showContentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              Manage Content for "{selectedCourse?.courseTitle}"
            </h3>
            
            {/* Course Structure Display */}
            <div className="mb-6">
              <h4 className="font-medium text-green-800 mb-2">Current Course Structure:</h4>
              <div className="bg-gray-50 rounded-md p-3 max-h-40 overflow-y-auto">
                {selectedCourse?.chapters && selectedCourse.chapters.length > 0 ? (
                  selectedCourse.chapters.map((chapter, idx) => (
                    <div key={chapter._id || idx} className="mb-2">
                      <div className="font-medium text-sm text-green-700">
                        {idx + 1}. {chapter.title || 'Untitled Chapter'}
                      </div>
                      <div className="ml-4 text-xs text-gray-600">
                        {chapter.lectures?.length || 0} lectures
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No chapters yet. Add chapters first.</p>
                )}
              </div>
            </div>
            
            {/* Add Lecture Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Select Chapter</label>
                <select
                  value={lectureForm.chapterId}
                  onChange={(e) => setLectureForm(prev => ({ ...prev, chapterId: e.target.value }))}
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a chapter</option>
                  {selectedCourse?.chapters?.map((chapter, idx) => (
                    <option key={chapter._id || idx} value={chapter._id}>
                      {chapter.title || `Chapter ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
              
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
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Lecture Description</label>
                <textarea
                  value={lectureForm.description}
                  onChange={(e) => setLectureForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="2"
                  placeholder="Enter lecture description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={lectureForm.duration}
                  onChange={(e) => setLectureForm(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                  placeholder="Auto-detected from video upload"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {lectureForm.duration ? 
                    `✅ Auto-detected: ${lectureForm.duration} minutes` : 
                    'Duration will be automatically detected during video upload'
                  }
                </p>
              </div>
              
              <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-green-700 mb-2">
                  🚀 Video File (Direct Cloud Upload)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  disabled={isUploadingLecture}
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                />
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-green-600">
                    ✅ Maximum size: 100MB (12x larger than server upload!)
                  </p>
                  <p className="text-xs text-green-600">
                    ✅ Direct upload to cloud - no 413 errors
                  </p>
                  <p className="text-xs text-green-600">
                    ✅ Duration automatically detected
                  </p>
                </div>
                {lectureForm.selectedVideoFile && (
                  <div className="mt-2 p-2 bg-green-100 rounded">
                    <p className="text-sm text-green-800">
                      📹 Selected: {lectureForm.selectedVideoFile.name} 
                      <br />
                      📊 Size: {(lectureForm.selectedVideoFile.size / (1024 * 1024)).toFixed(1)}MB
                    </p>
                  </div>
                )}
                
                {/* Cloudinary Setup Warning */}
                {(CLOUDINARY_CLOUD_NAME === 'your-cloud-name' || CLOUDINARY_UPLOAD_PRESET === 'your-upload-preset') && (
                  <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded">
                    <p className="text-xs text-yellow-800">
                      ⚠️ <strong>Setup Required:</strong> Please configure your Cloudinary credentials.
                      <br />
                      See CLOUDINARY_SETUP_GUIDE.md for instructions.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowContentModal(false)}
                disabled={isUploadingLecture}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => addLectureToChapter(lectureForm.selectedVideoFile)}
                disabled={isUploadingLecture || !lectureForm.selectedVideoFile}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingLecture ? 'Uploading to Cloud...' : 'Upload & Add Lecture'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;