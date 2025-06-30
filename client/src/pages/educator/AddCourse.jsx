import React, { useContext, useEffect, useRef, useState } from 'react';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify'
import Quill from 'quill';
import axios from 'axios'
import { AppContext } from '../../context/AppContext';
import CloudinaryVideoUpload from '../../components/educator/CloudinaryVideoUpload';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';

// Use environment variables for Cloudinary config
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'denhmcs4e';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

const AddCourse = () => {

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const { backendUrl, getToken } = useContext(AppContext)

  const [courseTitle, setCourseTitle] = useState('')
  const [coursePrice, setCoursePrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [image, setImage] = useState(null)
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
  });
  const [lectureVideo, setLectureVideo] = useState(null);
  const [lectureVideoDuration, setLectureVideoDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCourse, setCreatedCourse] = useState(null); // Holds the saved course with real IDs
  const [uploadToken, setUploadToken] = useState(''); // For video upload auth
  const [step, setStep] = useState(1); // 1: Course, 2: Chapters, 3: Lectures

  // Always fetch latest course from backend after any change
  const fetchCourseById = async (courseId) => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/educator/course`, {
        params: { courseId },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success && data.course) {
        setCreatedCourse(data.course);
        setChapters(data.course.chapters || []);
      }
    } catch (err) {
      toast.error('Failed to sync course data');
    }
  };

  // Course creation (Step 1)
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isSubmitting) return;
      setIsSubmitting(true);
      if (!image) {
        toast.error('Thumbnail Not Selected');
        setIsSubmitting(false);
        return;
      }
      if (image && !image.type.startsWith('image/')) {
        toast.error('Please select a valid image file for the thumbnail.');
        setIsSubmitting(false);
        return;
      }
      if (image && image.size > 5 * 1024 * 1024) {
        toast.error('Thumbnail image is too large (max 5MB).');
        setIsSubmitting(false);
        return;
      }
      // Upload thumbnail to Cloudinary
      const thumbRes = await uploadToCloudinary(image, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME);
      const thumbnailUrl = thumbRes.secure_url;
      const token = await getToken();
      const { data } = await axios.post(`${backendUrl}/api/courses`, {
        title: courseTitle,
        description: quillRef.current.root.innerHTML,
        thumbnail: thumbnailUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success && data.course) {
        setCreatedCourse(data.course);
        setChapters(data.course.chapters || []);
        toast.success('Course created! Now add chapters.');
        setStep(2); // Auto-advance to Step 2 after course creation
      } else {
        toast.error(data.message || 'Course creation failed');
      }
      setIsSubmitting(false);
    } catch (error) {
      toast.error(error.message);
      setIsSubmitting(false);
    }
  };

  // Add a new chapter to the backend and update state with real chapterId
  const addChapter = async (chapterTitle) => {
    if (!createdCourse || !createdCourse._id) {
      toast.error('Create the course first!');
      return;
    }
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/courses/${createdCourse._id}/chapters`,
        { title: chapterTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success && data.course) {
        setCreatedCourse(data.course);
        setChapters(data.course.chapters || []);
        toast.success('Chapter added!');
      } else {
        toast.error(data.message || 'Failed to add chapter');
      }
    } catch (err) {
      toast.error('Failed to add chapter');
    }
  };

  // Add a new lecture to the backend and update state with real lectureId
  const addLecture = async () => {
    if (!lectureDetails.lectureTitle) {
      toast.error('Lecture title is required.');
      return;
    }
    if (!lectureVideo) {
      toast.error('Lecture video file is required.');
      return;
    }
    // Check file size (100MB limit for Cloudinary)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (lectureVideo.size > maxSize) {
      toast.error(`Video file is too large! Maximum size allowed is 100MB. Please compress your video.`);
      return;
    }
    setIsSubmitting(true);
    try {
      // Debug log for Cloudinary config
      console.log('Cloudinary:', CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET);
      toast.info('Uploading video to cloud... This may take a while for large files.');
      // Step 1: Upload video directly to Cloudinary
      const formData = new FormData();
      formData.append('file', lectureVideo);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('resource_type', 'video');
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;
      const cloudinaryResponse = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            // Optionally, set a progress state here
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.status} - ${xhr.responseText}`));
          }
        };
        xhr.onerror = () => {
          reject(new Error('Network error'));
        };
        xhr.open('POST', cloudinaryUrl);
        xhr.send(formData);
      });
      // Step 2: Create lecture with Cloudinary URL
      const token = await getToken();
      // Calculate duration in hours and minutes
      let durationInHours = 0, durationInMinutes = 0;
      if (cloudinaryResponse.duration) {
        durationInHours = Math.floor(cloudinaryResponse.duration / 3600);
        durationInMinutes = Math.round((cloudinaryResponse.duration % 3600) / 60);
      }
      // Format duration string cleanly (omit 0 hr/min)
      let formattedDuration = '';
      if (durationInHours > 0) {
        formattedDuration += `${durationInHours} hr${durationInHours !== 1 ? 's' : ''}`;
      }
      if (durationInMinutes > 0) {
        if (formattedDuration) formattedDuration += ' ';
        formattedDuration += `${durationInMinutes} min${durationInMinutes !== 1 ? 's' : ''}`;
      }
      if (!formattedDuration) {
        formattedDuration = '0 min';
      }
      const lectureData = {
        courseId: createdCourse._id,
        chapterId: currentChapterId,
        title: lectureDetails.lectureTitle,
        description: lectureDetails.lectureDescription || '',
        videoUrl: cloudinaryResponse.secure_url,
        duration: formattedDuration, // e.g. '1 hr 23 mins'
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
        toast.success('Lecture and video uploaded!');
        setShowPopup(false);
        setLectureDetails({ lectureTitle: '', lectureDuration: '' });
        setLectureVideo(null);
        setLectureVideoDuration('');
        fetchCourseById(createdCourse._id); // Refresh course/chapters
      } else {
        toast.error(data.message || 'Failed to add lecture');
      }
    } catch (err) {
      if (err.message && err.message.includes('Upload failed')) {
        toast.error('Video upload failed. Please check your internet connection and try again.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to add lecture');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter Name:');
      if (title) {
        addChapter(title);
      }
    } else if (action === 'remove') {
      // Remove chapter logic (should call backend if implemented)
      toast.error('Chapter removal not implemented.');
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          (chapter._id || chapter.chapterId) === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
        )
      );
    }
  };

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === 'remove') {
      // Remove lecture logic (should call backend if implemented)
      toast.error('Lecture removal not implemented.');
    }
  };

  // Move to next step only if requirements are met
  const handleNext = () => {
    if (step === 1 && createdCourse) {
      setStep(2);
    } else if (step === 2 && chapters.length > 0) {
      setStep(3);
    }
  };

  useEffect(() => {
    // Initiate Quill only once
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      });
    }
  }, []);

  return (
    <div className="h-screen overflow-scroll flex flex-col items-center md:p-8 p-4 bg-green-50">
      {/* Step Indicator */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between text-green-900 text-lg font-semibold">
          <div className={`flex-1 text-center ${step === 1 ? 'text-green-700 font-bold' : 'text-green-400'}`}>1. Create Course</div>
          <div className="flex-1 text-center">→</div>
          <div className={`flex-1 text-center ${step === 2 ? 'text-green-700 font-bold' : 'text-green-400'}`}>2. Add Chapters</div>
          <div className="flex-1 text-center">→</div>
          <div className={`flex-1 text-center ${step === 3 ? 'text-green-700 font-bold' : 'text-green-400'}`}>3. Add Lectures</div>
        </div>
      </div>
      {/* Step 1: Course Creation */}
      {step === 1 && !createdCourse && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md w-full bg-white p-6 rounded shadow text-green-700">
          <h2 className="text-xl font-bold mb-2 text-green-900">Step 1: Create Course</h2>
          <div className="flex flex-col gap-1">
            <label className="text-green-900">Course Title</label>
            <input onChange={e => setCourseTitle(e.target.value)} value={courseTitle} type="text" placeholder="Type here" className="outline-none py-2 px-3 rounded border border-green-200 text-green-900 placeholder-green-600" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-green-900">Course Description</label>
            <div ref={editorRef}></div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-green-900">Course Price</label>
            <input onChange={e => setCoursePrice(e.target.value)} value={coursePrice} type="number" placeholder="0" className="outline-none py-2 w-28 px-3 rounded border border-green-200 text-green-900 placeholder-green-600" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-green-900">Course Thumbnail</label>
            <label htmlFor="thumbnailImage" className="flex items-center gap-3 cursor-pointer">
              <img src={assets.file_upload_icon} alt="" className="p-3 bg-green-500 rounded" />
              <input type="file" id="thumbnailImage" onChange={e => setImage(e.target.files[0])} accept="image/*" hidden />
              {image && <img className="max-h-10" src={URL.createObjectURL(image)} alt="" />}
            </label>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-green-900">Discount %</label>
            <input onChange={e => setDiscount(e.target.value)} value={discount} type="number" placeholder="0" min={0} max={100} className="outline-none py-2 w-28 px-3 rounded border border-green-200 text-green-900 placeholder-green-600" required />
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-max py-2.5 px-8 rounded my-4 self-center" disabled={isSubmitting}>
            {isSubmitting ? 'ADDING...' : 'Save Course'}
          </button>
        </form>
      )}
      {/* Step 2: Chapter Management */}
      {step === 2 && createdCourse && (
        <div className="w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4 text-green-900">Step 2: Add Chapters</h2>
          {chapters.length === 0 && (
            <div className="text-yellow-700 mb-4">No chapters yet. Add your first chapter below.</div>
          )}
          <button className="flex justify-center items-center bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg cursor-pointer w-full mb-4" onClick={() => handleChapter('add')}>
            + Add Chapter
          </button>
          {chapters.map((chapter) => (
            <div key={chapter._id || chapter.chapterId} className="bg-white border border-green-200 rounded-lg mb-4">
              <div className="flex justify-between items-center p-4 border-b border-green-200">
                <div className="flex items-center">
                  <img className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && "-rotate-90"}`} onClick={() => handleChapter('toggle', chapter._id || chapter.chapterId)} src={assets.dropdown_icon} width={14} alt="" />
                  <span className="font-semibold text-green-900">{chapter.title}</span>
                </div>
                <span className="text-green-700">{chapter.lectures.length} Lectures</span>
                <img onClick={() => handleChapter('remove', chapter._id || chapter.chapterId)} src={assets.cross_icon} alt="" className="cursor-pointer" />
              </div>
              {/* No Add Lecture button here in Step 2 */}
              {!chapter.collapsed && (
                <div className="p-4">
                  <h4 className="font-semibold mb-2 text-green-900">Lectures</h4>
                  {chapter.lectures.length === 0 && <div className="text-yellow-700 mb-2">No lectures yet. Add your first lecture in Step 3.</div>}
                  {chapter.lectures.map((lecture) => (
                    <div key={lecture._id || lecture.lectureId} className="flex justify-between items-center mb-2">
                      <span className="text-green-900">{lecture.title} - {lecture.duration}{lecture.isPreviewFree ? ' - Free Preview' : ' - Paid'}</span>
                      <img onClick={() => handleLecture('remove', chapter._id || chapter.chapterId, chapter.lectures.indexOf(lecture))} src={assets.cross_icon} alt="" className="cursor-pointer" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-end mt-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-8 rounded" onClick={handleNext} disabled={chapters.length === 0}>Next</button>
          </div>
        </div>
      )}
      {/* Step 3: Add Lectures */}
      {step === 3 && createdCourse && chapters.length > 0 && (
        <div className="w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4 text-green-900">Step 3: Add Lectures</h2>
          {chapters.map((chapter) => (
            <div key={chapter._id || chapter.chapterId} className="bg-white border border-green-200 rounded-lg mb-4">
              <div className="flex justify-between items-center p-4 border-b border-green-200">
                <div className="flex items-center">
                  <img className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && "-rotate-90"}`} onClick={() => handleChapter('toggle', chapter._id || chapter.chapterId)} src={assets.dropdown_icon} width={14} alt="" />
                  <span className="font-semibold text-green-900">{chapter.title}</span>
                </div>
                <span className="text-green-700">{chapter.lectures.length} Lectures</span>
                <img onClick={() => handleChapter('remove', chapter._id || chapter.chapterId)} src={assets.cross_icon} alt="" className="cursor-pointer" />
              </div>
              {/* Lectures for this chapter */}
              {!chapter.collapsed && (
                <div className="p-4">
                  {chapter.lectures.length === 0 && <div className="text-yellow-700 mb-2">No lectures yet. Add your first lecture below.</div>}
                  {chapter.lectures.map((lecture) => (
                    <div key={lecture._id || lecture.lectureId} className="flex justify-between items-center mb-2">
                      <span className="text-green-900">
                        {lecture.title} - {typeof lecture.duration === 'string' ? lecture.duration : typeof lecture.duration === 'number' ? `${lecture.duration} min` : String(lecture.duration)}{lecture.isPreviewFree ? ' - Free Preview' : ' - Paid'}
                      </span>
                      <img onClick={() => handleLecture('remove', chapter._id || chapter.chapterId, chapter.lectures.indexOf(lecture))} src={assets.cross_icon} alt="" className="cursor-pointer" />
                    </div>
                  ))}
                  <button className="inline-flex bg-green-100 p-2 rounded cursor-pointer mt-2 text-green-700 hover:bg-green-200" onClick={() => handleLecture('add', chapter._id || chapter.chapterId)}>
                    + Add Lecture
                  </button>
                </div>
              )}
            </div>
          ))}
          {/* Add Lecture Modal */}
          {showPopup && chapters.length > 0 && (
            <div className="fixed inset-0 flex items-center justify-center bg-green-900 bg-opacity-50 z-50">
              <div className="bg-white text-green-700 p-4 rounded relative w-full max-w-80">
                <h2 className="text-lg font-semibold mb-4 text-green-900">Add Lecture</h2>
                <div className="mb-2">
                  <label className="text-green-900">Lecture Title</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-green-200 rounded py-1 px-2 text-green-900 placeholder-green-600"
                    value={lectureDetails.lectureTitle}
                    onChange={(e) => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })}
                  />
                </div>
                {/* Cloudinary Video Upload Component */}
                <CloudinaryVideoUpload
                  onUploadSuccess={(result) => {
                    setShowPopup(false);
                    fetchCourseById(createdCourse._id); // Refresh course/chapters
                    toast.success('Lecture and video uploaded!');
                  }}
                  courseId={createdCourse._id}
                  chapterId={currentChapterId}
                  backendUrl={backendUrl}
                  token={getToken && typeof getToken === 'function' ? getToken() : ''}
                  lectureTitle={lectureDetails.lectureTitle}
                />
                <img onClick={() => setShowPopup(false)} src={assets.cross_icon} className="absolute top-4 right-4 w-4 cursor-pointer" alt="" />
              </div>
            </div>
          )}
          {/* Publish button only if at least one lecture exists */}
          {chapters.some(ch => ch.lectures.length > 0) && createdCourse.status !== 'published' && (
            <div className="w-full max-w-2xl mt-8 flex justify-center">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
                onClick={async () => {
                  try {
                    const token = await getToken();
                    const { data } = await axios.post(
                      `${backendUrl}/api/educator/publish-course`,
                      { courseId: createdCourse._id },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (data.success) {
                      toast.success('Course published!');
                      setCreatedCourse(data.course);
                    } else {
                      toast.error(data.message || 'Failed to publish course');
                    }
                  } catch (err) {
                    toast.error('Failed to publish course');
                  }
                }}
              >
                Publish Course
              </button>
            </div>
          )}
          {createdCourse.status === 'published' && (
            <div className="w-full max-w-2xl mt-8 flex justify-center">
              <span className="bg-green-200 text-green-900 py-2 px-6 rounded">Course is now published!</span>
            </div>
          )}
        </div>
      )}
      {/* Step 5: Option to create another course */}
      {createdCourse && (
        <div className="w-full max-w-2xl mt-8 flex justify-center">
          <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded" onClick={() => window.location.reload()}>Create Another Course</button>
        </div>
      )}
    </div>
  );
};

export default AddCourse;