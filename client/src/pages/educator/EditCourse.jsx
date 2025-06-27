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

  console.log('EditCourse: Component mounted with courseId:', courseId);

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
    console.log('EditCourse: fetchCourseData called with courseId:', courseId);
    try {
      const token = await getToken();
      console.log('EditCourse: Token obtained, making API call to:', `${backendUrl}/api/educator/course/${courseId}`);
      const { data } = await axios.get(`${backendUrl}/api/educator/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        const course = data.courseData || data.course;
        setCourseData({
          courseTitle: course.courseTitle || '',
          description: course.description || '',
          coursePrice: course.coursePrice || '',
          discount: course.discount || '',
          category: course.category || '',
          courseThumbnail: null,
          status: course.status || 'draft'
        });
        setThumbnailPreview(course.courseThumbnail || '');
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
      
      formData.append('courseTitle', courseData.courseTitle);
      formData.append('description', courseData.description);
      formData.append('coursePrice', courseData.coursePrice);
      formData.append('discount', courseData.discount);
      formData.append('category', courseData.category);
      formData.append('status', courseData.status);
      
      if (courseData.courseThumbnail) {
        formData.append('image', courseData.courseThumbnail);
      }

      const { data } = await axios.put(
        `${backendUrl}/api/educator/edit-course/${courseId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

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
    <div className="min-h-screen bg-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-green-900">Edit Course</h1>
            <button
              onClick={() => navigate('/educator/my-courses')}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              ← Back to My Courses
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
                rows="5"
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter course description"
              />
            </div>

            {/* Price and Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="Enter price"
                  min="0"
                />
              </div>
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
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Marketing">Marketing</option>
                <option value="Photography">Photography</option>
                <option value="Music">Music</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Course Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Course Thumbnail
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {thumbnailPreview && (
                <div className="mt-2">
                  <img
                    src={thumbnailPreview}
                    alt="Course thumbnail preview"
                    className="w-32 h-20 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            {/* Status */}
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
            <div className="flex justify-end space-x-4">
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
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
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
