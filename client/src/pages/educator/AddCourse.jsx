import React, { useContext, useEffect, useRef, useState } from 'react';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify'
import Quill from 'quill';
import axios from 'axios'
import { AppContext } from '../../context/AppContext';
import VideoUploadComponent from '../../components/educator/VideoUploadComponent';

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
    isPreviewFree: false,
  });
  const [lectureVideo, setLectureVideo] = useState(null);
  const [lectureVideoDuration, setLectureVideoDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCourse, setCreatedCourse] = useState(null); // Holds the saved course with real IDs
  const [uploadToken, setUploadToken] = useState(''); // For video upload auth

  // Add a new chapter to the backend and update state with real chapterId
  const addChapter = async (chapterTitle) => {
    if (!createdCourse || !createdCourse._id) {
      toast.error('Create the course first!');
      return;
    }
    try {
      const token = await getToken();
      const { data } = await axios.post(`${backendUrl}/api/educator/add-chapter`, {
        courseId: createdCourse._id,
        chapterTitle,
        chapterOrder: chapters.length + 1,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && data.chapter) {
        setChapters([...chapters, { ...data.chapter, chapterContent: [] }]);
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
    if (!lectureDetails.lectureTitle || !lectureVideo || !lectureVideoDuration) return;
    if (!createdCourse || !currentChapterId) {
      toast.error('Course and chapter must be created before adding a lecture.');
      return;
    }
    setShowPopup(false);
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      isPreviewFree: false,
    });
    setLectureVideo(null);
    setLectureVideoDuration('');
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('lectureTitle', lectureDetails.lectureTitle);
      formData.append('lectureDuration', lectureVideoDuration);
      formData.append('isPreviewFree', lectureDetails.isPreviewFree);
      formData.append('video', lectureVideo);
      formData.append('courseId', createdCourse._id);
      formData.append('chapterId', currentChapterId);
      // Optionally: lectureOrder
      const chapter = chapters.find(ch => ch._id === currentChapterId || ch.chapterId === currentChapterId);
      if (chapter) {
        formData.append('lectureOrder', chapter.chapterContent.length + 1);
      }
      const { data } = await axios.post(`${backendUrl}/api/educator/add-lecture`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && data.lecture) {
        setChapters(
          chapters.map((chapter) => {
            if ((chapter._id || chapter.chapterId) === currentChapterId) {
              return {
                ...chapter,
                chapterContent: [...chapter.chapterContent, data.lecture],
              };
            }
            return chapter;
          })
        );
        toast.success('Lecture and video uploaded!');
      } else {
        toast.error(data.message || 'Failed to add lecture');
      }
    } catch (err) {
      toast.error('Failed to upload lecture and video');
    }
  };

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter Name:');
      if (title) {
        addChapter(title);
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter((chapter) => (chapter._id || chapter.chapterId) !== chapterId));
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
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            chapter.chapterContent.splice(lectureIndex, 1);
          }
          return chapter;
        })
      );
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isSubmitting) return;
      setIsSubmitting(true);
      if (!image) {
        toast.error('Thumbnail Not Selected')
        setIsSubmitting(false);
        return;
      }
      // Validation: Ensure all lectures have a duration
      const allLecturesHaveDuration = chapters.every(chapter =>
        chapter.chapterContent.every(lecture => !!lecture.lectureDuration)
      );
      if (!allLecturesHaveDuration) {
        toast.error('Please upload all videos and wait for durations to be set before submitting the course.');
        setIsSubmitting(false);
        return;
      }

      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters,
      }

      const formData = new FormData()
      formData.append('courseData', JSON.stringify(courseData))
      formData.append('image', image)

      const token = await getToken()
      setUploadToken(token); // Save for video upload

      const { data } = await axios.post(backendUrl + '/api/educator/add-course', formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success && data.course) {
        toast.success('Course created! Now upload lecture videos.');
        setCreatedCourse(data.course); // Save the real course object
      } else {
        toast.error(data.message || 'Course creation failed');
      }
      setIsSubmitting(false);
    } catch (error) {
      toast.error(error.message)
      setIsSubmitting(false);
    }

  };

  // Fetch latest course data after video upload
  const fetchLatestCourse = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/educator/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success && data.courses) {
        // Find the current course by ID
        const updated = data.courses.find(c => c._id === createdCourse._id);
        if (updated) setCreatedCourse(updated);
      }
    } catch (err) {
      toast.error('Failed to refresh course data after upload');
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
    <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 bg-green-50'>
      {/* Step 1: Course Creation */}
      {!createdCourse ? (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 max-w-md w-full text-green-700'>
          <div className='flex flex-col gap-1'>
            <p className='text-green-900'>Course Title</p>
            <input onChange={e => setCourseTitle(e.target.value)} value={courseTitle} type="text" placeholder='Type here' className='outline-none md:py-2.5 py-2 px-3 rounded border border-green-200 text-green-900 placeholder-green-600' required />
          </div>

          <div className='flex flex-col gap-1'>
            <p className='text-green-900'>Course Description</p>
            <div ref={editorRef}></div>
          </div>

          <div className='flex items-center justify-between flex-wrap'>
            <div className='flex flex-col gap-1'>
              <p className='text-green-900'>Course Price</p>
              <input onChange={e => setCoursePrice(e.target.value)} value={coursePrice} type="number" placeholder='0' className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-green-200 text-green-900 placeholder-green-600' required />
            </ div>

            <div className='flex md:flex-row flex-col items-center gap-3'>
              <p className='text-green-900'>Course Thumbnail</p>
              <label htmlFor='thumbnailImage' className='flex items-center gap-3'>
                <img src={assets.file_upload_icon} alt="" className='p-3 bg-green-500 rounded' />
                <input type="file" id='thumbnailImage' onChange={e => setImage(e.target.files[0])} accept="image/*" hidden />
                {image && <img className='max-h-10' src={URL.createObjectURL(image)} alt="" />}
              </label>
            </div>
          </div>

          <div className='flex flex-col gap-1'>
            <p className='text-green-900'>Discount %</p>
            <input onChange={e => setDiscount(e.target.value)} value={discount} type="number" placeholder='0' min={0} max={100} className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-green-200 text-green-900 placeholder-green-600' required />
          </div>

          <button type="submit" className='bg-green-600 hover:bg-green-700 text-white w-max py-2.5 px-8 rounded my-4' disabled={isSubmitting}>
            {isSubmitting ? 'ADDING...' : 'ADD'}
          </button>
        </form>
      ) : (
        <div className='w-full max-w-2xl'>
          <h2 className='text-xl font-bold mb-4 text-green-900'>Course: {createdCourse.courseTitle}</h2>
          {/* Step 2: Chapter Management */}
          <div className='mb-6'>
            <h3 className='font-semibold mb-2 text-green-900'>Chapters</h3>
            {chapters.length === 0 && (
              <div className='text-yellow-700 mb-2'>No chapters yet. Add your first chapter below.</div>
            )}
            {chapters.map((chapter) => (
              <div key={chapter._id || chapter.chapterId} className="bg-white border border-green-200 rounded-lg mb-4">
                <div className="flex justify-between items-center p-4 border-b border-green-200">
                  <div className="flex items-center">
                    <img className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && "-rotate-90"}`} onClick={() => handleChapter('toggle', chapter._id || chapter.chapterId)} src={assets.dropdown_icon} width={14} alt="" />
                    <span className="font-semibold text-green-900">{chapter.chapterTitle}</span>
                  </div>
                  <span className="text-green-700">{chapter.chapterContent.length} Lectures</span>
                  <img onClick={() => handleChapter('remove', chapter._id || chapter.chapterId)} src={assets.cross_icon} alt="" className='cursor-pointer' />
                </div>
                {!chapter.collapsed && (
                  <div className="p-4">
                    {/* Step 3: Lecture Creation for this chapter */}
                    {chapter.chapterContent.map((lecture) => (
                      <div key={lecture._id || lecture.lectureId} className="flex justify-between items-center mb-2">
                        <span className='text-green-900'>{lecture.lectureTitle} - {lecture.lectureDuration} mins - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}</span>
                        <img onClick={() => handleLecture('remove', chapter._id || chapter.chapterId, chapter.chapterContent.indexOf(lecture))} src={assets.cross_icon} alt="" className='cursor-pointer' />
                      </div>
                    ))}
                    <div className="inline-flex bg-green-100 p-2 rounded cursor-pointer mt-2 text-green-700" onClick={() => handleLecture('add', chapter._id || chapter.chapterId)}>
                      + Add Lecture
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Only show add chapter if course is created */}
            <div className="flex justify-center items-center bg-green-100 p-2 rounded-lg cursor-pointer text-green-700" onClick={() => handleChapter('add')}>
              + Add Chapter
            </div>
          </div>
          {/* Step 3: Add Lecture Modal (only if chapters exist) */}
          {showPopup && chapters.length > 0 && (
            <div className="fixed inset-0 flex items-center justify-center bg-green-900 bg-opacity-50">
              <div className="bg-white text-green-700 p-4 rounded relative w-full max-w-80">
                <h2 className="text-lg font-semibold mb-4 text-green-900">Add Lecture</h2>
                <div className="mb-2">
                  <p className='text-green-900'>Lecture Title</p>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-green-200 rounded py-1 px-2 text-green-900 placeholder-green-600"
                    value={lectureDetails.lectureTitle}
                    onChange={(e) => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <p className='text-green-900'>Lecture Video</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      setLectureVideo(file);
                      if (file) {
                        const videoUrl = URL.createObjectURL(file);
                        const tempVideo = document.createElement('video');
                        tempVideo.preload = 'metadata';
                        tempVideo.src = videoUrl;
                        tempVideo.onloadedmetadata = () => {
                          URL.revokeObjectURL(videoUrl);
                          const duration = Math.round(tempVideo.duration / 60) || 1;
                          setLectureVideoDuration(duration);
                        };
                      } else {
                        setLectureVideoDuration('');
                      }
                    }}
                  />
                  {lectureVideo && lectureVideoDuration && (
                    <div className="text-green-700 text-sm mt-1">Duration: {lectureVideoDuration} min</div>
                  )}
                </div>
                <div className="flex gap-2 my-4">
                  <p className='text-green-900'>Is Preview Free?</p>
                  <input
                    type="checkbox" className='mt-1 scale-125'
                    checked={lectureDetails.isPreviewFree}
                    onChange={(e) => setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })}
                  />
                </div>
                <button type='button' className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded" onClick={addLecture} disabled={!lectureDetails.lectureTitle || !lectureVideo || !lectureVideoDuration}>Add</button>
                <img onClick={() => setShowPopup(false)} src={assets.cross_icon} className='absolute top-4 right-4 w-4 cursor-pointer' alt="" />
              </div>
            </div>
          )}
          <div className='mt-8'>
            <button className='bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded' onClick={() => window.location.reload()}>Create Another Course</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourse;