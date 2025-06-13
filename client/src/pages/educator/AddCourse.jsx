import React, { useContext, useEffect, useRef, useState } from 'react';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify'
import Quill from 'quill';
import uniqid from 'uniqid';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCourse, setCreatedCourse] = useState(null); // Holds the saved course with real IDs
  const [uploadToken, setUploadToken] = useState(''); // For video upload auth

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter Name:');
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId));
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
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

  const addLecture = async () => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureOrder: chapter.chapterContent.length > 0 ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1 : 1,
            lectureId: uniqid(),
            videoFile: '',
            lectureUrl: '',
          };
          chapter.chapterContent.push(newLecture);
        }
        return chapter;
      })
    );
    setShowPopup(false);
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      isPreviewFree: false,
    });
    setLectureVideo(null);
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

  useEffect(() => {
    // Initiate Quill only once
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      });
    }
  }, []);

  useEffect(() => {
    console.log(chapters);
  }, [chapters]);

  return (
    <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      {!createdCourse ? (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 max-w-md w-full text-gray-500'>
          <div className='flex flex-col gap-1'>
            <p>Course Title</p>
            <input onChange={e => setCourseTitle(e.target.value)} value={courseTitle} type="text" placeholder='Type here' className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500' required />
          </div>

          <div className='flex flex-col gap-1'>
            <p>Course Description</p>
            <div ref={editorRef}></div>
          </div>

          <div className='flex items-center justify-between flex-wrap'>
            <div className='flex flex-col gap-1'>
              <p>Course Price</p>
              <input onChange={e => setCoursePrice(e.target.value)} value={coursePrice} type="number" placeholder='0' className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500' required />
            </ div>

            <div className='flex md:flex-row flex-col items-center gap-3'>
              <p>Course Thumbnail</p>
              <label htmlFor='thumbnailImage' className='flex items-center gap-3'>
                <img src={assets.file_upload_icon} alt="" className='p-3 bg-blue-500 rounded' />
                <input type="file" id='thumbnailImage' onChange={e => setImage(e.target.files[0])} accept="image/*" hidden />
                {image && <img className='max-h-10' src={URL.createObjectURL(image)} alt="" />}
              </label>
            </div>
          </div>

          <div className='flex flex-col gap-1'>
            <p>Discount %</p>
            <input onChange={e => setDiscount(e.target.value)} value={discount} type="number" placeholder='0' min={0} max={100} className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500' required />
          </div>

          {/* Adding Chapters & Lectures */}
          <div>
            {chapters.map((chapter) => (
              <div key={chapter.chapterId || chapter.chapterOrder} className="bg-white border rounded-lg mb-4">
                <div className="flex justify-between items-center p-4 border-b">
                  <div className="flex items-center">
                    <img className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && "-rotate-90"} `} onClick={() => handleChapter('toggle', chapter.chapterId)} src={assets.dropdown_icon} width={14} alt="" />
                    <span className="font-semibold">{chapter.chapterTitle}</span>
                  </div>
                  <span className="text-gray-500">{chapter.chapterContent.length} Lectures</span>
                  <img onClick={() => handleChapter('remove', chapter.chapterId)} src={assets.cross_icon} alt="" className='cursor-pointer' />
                </div>
                {!chapter.collapsed && (
                  <div className="p-4">
                    {chapter.chapterContent.map((lecture) => (
                      <div key={lecture.lectureId || lecture.lectureTitle} className="flex justify-between items-center mb-2">
                        <span>{lecture.lectureTitle} - {lecture.lectureDuration} mins - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}</span>
                        <img onClick={() => handleLecture('remove', chapter.chapterId, chapter.chapterContent.indexOf(lecture))} src={assets.cross_icon} alt="" className='cursor-pointer' />
                      </div>
                    ))}
                    <div className="inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2" onClick={() => handleLecture('add', chapter.chapterId)}>
                      + Add Lecture
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer" onClick={() => handleChapter('add')}>
              + Add Chapter
            </div>

            {showPopup && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="bg-white text-gray-700 p-4 rounded relative w-full max-w-80">
                  <h2 className="text-lg font-semibold mb-4">Add Lecture</h2>
                  <div className="mb-2">
                    <p>Lecture Title</p>
                    <input
                      type="text"
                      className="mt-1 block w-full border rounded py-1 px-2"
                      value={lectureDetails.lectureTitle}
                      onChange={(e) => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <p>Duration (minutes)</p>
                    <input
                      type="number"
                      className="mt-1 block w-full border rounded py-1 px-2"
                      value={lectureDetails.lectureDuration}
                      onChange={(e) => setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 my-4">
                    <p>Is Preview Free?</p>
                    <input
                      type="checkbox" className='mt-1 scale-125'
                      checked={lectureDetails.isPreviewFree}
                      onChange={(e) => setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })}
                    />
                  </div>
                  <button type='button' className="w-full bg-blue-400 text-white px-4 py-2 rounded" onClick={addLecture}>Add</button>
                  <img onClick={() => setShowPopup(false)} src={assets.cross_icon} className='absolute top-4 right-4 w-4 cursor-pointer' alt="" />
                </div>
              </div>
            )}
          </div>

          <button type="submit" className='bg-black text-white w-max py-2.5 px-8 rounded my-4' disabled={isSubmitting}>
            {isSubmitting ? 'ADDING...' : 'ADD'}
          </button>
        </form>
      ) : (
        <div className='w-full max-w-2xl'>
          <h2 className='text-xl font-bold mb-4'>Upload Videos for Lectures</h2>
          {createdCourse.courseContent.length === 0 || createdCourse.courseContent.every(chap => chap.chapterContent.length === 0) ? (
            <div className="text-red-600 font-semibold mb-6">No lectures found. Please add at least one lecture to each chapter to enable video uploads.</div>
          ) : null}
          {createdCourse.courseContent.map((chapter) => (
            <div key={chapter._id || chapter.chapterId} className='mb-6'>
              <h3 className='font-semibold mb-2'>Chapter: {chapter.chapterTitle}</h3>
              {chapter.chapterContent.length === 0 ? (
                <div className="text-yellow-600 mb-4">No lectures in this chapter.</div>
              ) : chapter.chapterContent.map((lecture) => (
                <div key={lecture._id || lecture.lectureId} className='mb-4 p-3 border rounded'>
                  <div className='mb-2'>
                    <span className='font-medium'>Lecture: {lecture.lectureTitle}</span>
                    <span className='ml-2 text-sm text-gray-500'>({lecture.lectureDuration} mins)</span>
                  </div>
                  <VideoUploadComponent
                    backendUrl={backendUrl}
                    token={uploadToken}
                    courseId={createdCourse._id}
                    chapterId={chapter._id || chapter.chapterId}
                    lectureId={lecture._id || lecture.lectureId}
                    onUploadSuccess={(filename) => toast.success('Video uploaded!')}
                  />
                </div>
              ))}
            </div>
          ))}
          <div className='mt-8'>
            <button className='bg-black text-white py-2 px-6 rounded' onClick={() => window.location.reload()}>Create Another Course</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourse;