import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';

const EditCourse = () => {
  const { backendUrl, getToken } = useContext(AppContext);
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courseData, setCourseData] = useState({
    courseTitle: '',
    description: '',
    coursePrice: '',
    discount: '',
    category: '',
    courseThumbnail: null,
    status: 'draft'
  });
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  // Fetch course data for editing
  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/educator/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        const course = data.courseData || data.course;
        setCourseData({
          courseTitle: course.courseTitle || course.title || '', // Handle both field names
          description: course.description || '',
          coursePrice: course.coursePrice || course.price || '', // Handle both field names
          discount: course.discount || '',
          category: course.category || '',
          courseThumbnail: null,
          status: course.status || 'draft'
        });
        setThumbnailPreview(course.courseThumbnail || course.thumbnail || ''); // Handle both field names
      } else {
        toast.error('Failed to fetch course data');
        navigate('/educator/my-courses');
      }
    } catch (error) {
      console.error('Fetch course error:', error);
      toast.error('Failed to fetch course data');
      navigate('/educator/my-courses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseData(prev => ({
        ...prev,
        courseThumbnail: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!courseData.courseTitle.trim()) {
      toast.error('Course title is required');
      return;
    }

    setSaving(true);
    
    try {
      const token = await getToken();
      const formData = new FormData();
      // Use backend field names
      formData.append('title', courseData.courseTitle); // Backend expects 'title'
      formData.append('description', courseData.description);
      formData.append('price', courseData.coursePrice); // Backend expects 'price'
      formData.append('discount', courseData.discount);
      formData.append('category', courseData.category);
      formData.append('status', courseData.status);
      if (courseData.courseThumbnail) {
        formData.append('image', courseData.courseThumbnail); // Backend expects 'image' for thumbnail
      }
      const { data } = await axios.put(`${backendUrl}/api/educator/edit-course/${courseId}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success) {
        toast.success('Course updated successfully!');
        navigate('/educator/my-courses');
      } else {
        toast.error(data.message || 'Failed to update course');
      }
    } catch (error) {
      console.error('Update course error:', error);
      toast.error(error.response?.data?.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-green-700">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-green-900">Edit Course</h1>
            <button
              onClick={() => navigate('/educator/my-courses')}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Title */}
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                name="courseTitle"
                value={courseData.courseTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter course title"
                required
              />
            </div>

            {/* Course Description */}
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Course Description
              </label>
              <textarea
                name="description"
                value={courseData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter course description"
              />
            </div>

            {/* Course Price */}
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Course Price
              </label>
              <input
                type="number"
                name="coursePrice"
                value={courseData.coursePrice}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter course price"
              />
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={courseData.discount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter discount percentage"
                min="0"
                max="100"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={courseData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select a category</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
                <option value="photography">Photography</option>
                <option value="music">Music</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Course Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Course Thumbnail
              </label>
              {thumbnailPreview && (
                <div className="mb-3">
                  <img 
                    src={thumbnailPreview} 
                    alt="Course thumbnail preview" 
                    className="w-32 h-24 object-cover rounded-md border border-green-300"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a new image to replace the current thumbnail
              </p>
            </div>

            {/* Course Status */}
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Course Status
              </label>
              <select
                name="status"
                value={courseData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/educator/my-courses')}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Updating...' : 'Update Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;
