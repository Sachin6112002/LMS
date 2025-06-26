import React, { useContext, useEffect, useState, Suspense } from 'react'
import { AppContext } from '../../context/AppContext'
import YouTube from 'react-youtube';
import { assets } from '../../assets/assets';
import { useParams } from 'react-router-dom';
import humanizeDuration from 'humanize-duration';
import axios from 'axios';
import { toast } from 'react-toastify';
import Rating from '../../components/student/Rating';
import Footer from '../../components/student/Footer';
import Loading from '../../components/student/Loading';
import TestimonialForm from '../../components/student/TestimonialForm';

const Player = ({ }) => {

  const { enrolledCourses, backendUrl, getToken, calculateChapterTime, userData, fetchUserEnrolledCourses } = useContext(AppContext)

  const { courseId } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [testimonialSubmitted, setTestimonialSubmitted] = useState(false);

  const getCourseData = () => {
    if (!Array.isArray(enrolledCourses)) return;
    enrolledCourses.forEach((course) => {
      if (course._id === courseId) {
        setCourseData(course)
        if (Array.isArray(course.courseRatings)) {
          course.courseRatings.forEach((item) => {
            if (item.userId === userData.id) {
              setInitialRating(item.rating)
            }
          })
        }
      }
    })
  }

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };


  useEffect(() => {
    if (enrolledCourses && enrolledCourses.length > 0) {
      getCourseData()
    }
  }, [enrolledCourses])

  const markLectureAsCompleted = async (lectureId) => {

    try {

      const token = await getToken()

      const { data } = await axios.post(backendUrl + '/api/user/update-course-progress',
        { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message)
        getCourseProgress()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }

  }

  const getCourseProgress = async () => {

    try {

      const token = await getToken()

      const { data } = await axios.post(backendUrl + '/api/user/get-course-progress',
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setProgressData(data.progressData)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }

  }

  const handleRate = async (rating) => {

    try {

      const token = await getToken()

      const { data } = await axios.post(backendUrl + '/api/user/add-rating',
        { courseId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message)
        fetchUserEnrolledCourses()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {

    getCourseProgress()

  }, [])

  // Defensive: show loading if courseData is not loaded
  if (!courseData || typeof courseData !== 'object' || !Array.isArray(courseData.chapters)) {
    return <p className="text-red-500 p-8">Course data is unavailable, not published, or corrupted.</p>;
  }
  if (!courseData._id) return <p className="text-red-500 p-8">Course not found or unavailable.</p>;
  if (courseData.status !== 'published') return <p className="text-yellow-600 p-8">This course is not published yet.</p>;

  // Defensive: check if courseData is valid
  if (!courseData || typeof courseData !== 'object' || !Array.isArray(courseData.chapters)) {
    return <p className="text-red-500 p-8">Course data is unavailable or corrupted.</p>;
  }

  // Helper: force refresh course data (for educator after upload)
  const handleRefresh = () => {
    fetchUserEnrolledCourses();
    setTimeout(() => getCourseData(), 500); // Give time for backend to update
  };

  // Defensive: support both new and old course structure
  const chapters = Array.isArray(courseData.chapters) ? courseData.chapters : [];
  // Defensive: always ensure lectures is an array for every chapter
  const safeChapters = chapters.map(ch => ({
    ...ch,
    lectures: Array.isArray(ch.lectures) ? ch.lectures : []
  }));
  const allLectures = safeChapters.length > 0
    ? safeChapters.flatMap(ch => ch.lectures)
    : [];
  const allCompleted = progressData && Array.isArray(progressData.lectureCompleted) && allLectures.length > 0 && progressData.lectureCompleted.length === allLectures.length;

  // Defensive normalization to guarantee chapters/lectures structure
  useEffect(() => {
    if (courseData) {
      if (!Array.isArray(courseData.chapters)) courseData.chapters = [];
      courseData.chapters = courseData.chapters.map(ch => ({
        ...ch,
        lectures: Array.isArray(ch.lectures) ? ch.lectures : []
      }));
      setCourseData({ ...courseData }); // force re-render with normalized data
    }
  }, [courseData]);

  return (
    <>
    <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36' >
      <div className=" text-green-900" >
        <h2 className="text-xl font-semibold">Course Structure</h2>
        <button onClick={handleRefresh} className="mb-4 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm">Refresh</button>
        <div className="pt-5">
          {safeChapters.length > 0 ? safeChapters.map((chapter, index) => (
            <div key={index} className="border border-green-200 bg-green-50 mb-2 rounded">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleSection(index)}
              >
                <div className="flex items-center gap-2">
                  <img src={assets.down_arrow_icon} alt="arrow icon" className={`transform transition-transform ${openSections[index] ? "rotate-180" : ""}`} />
                  <p className="font-medium md:text-base text-sm">{chapter.title || chapter.chapterTitle}</p>
                </div>
                <p className="text-sm md:text-default">{chapter.lectures.length} lectures - {calculateChapterTime(chapter)}</p>
              </div>
              <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? "max-h-96" : "max-h-0"}`} >
                <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-green-700 border-t border-green-200">
                  {chapter.lectures.map((lecture, i) => (
                    <li key={i} className="flex items-start gap-2 py-1">
                      <img src={progressData && Array.isArray(progressData.lectureCompleted) && progressData.lectureCompleted.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon} alt="bullet icon" className="w-4 h-4 mt-1" />
                      <div className="flex items-center justify-between w-full text-green-900 text-xs md:text-default">
                        <p>{lecture.title || lecture.lectureTitle}</p>
                        <div className='flex gap-2'>
                          {lecture.videoUrl && <p onClick={() => setPlayerData({ ...lecture, chapter: index + 1, lecture: i + 1 })} className='text-green-600 hover:underline cursor-pointer'>Watch</p>}
                          {lecture.duration && <p>{humanizeDuration(lecture.duration * 60 * 1000, { units: ['h', 'm'] })}</p>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )) : <p>No course content available.</p>}
        </div>
        <div className=" flex items-center gap-2 py-3 mt-10">
          <h1 className="text-xl font-bold">Rate this Course:</h1>
          <Rating initialRating={initialRating} onRate={handleRate} />
        </div>
        {allCompleted && !testimonialSubmitted && (
          <div className="my-8">
            {!showTestimonialForm ? (
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-semibold" onClick={() => setShowTestimonialForm(true)}>
                Share Your Testimonial
              </button>
            ) : (
              <TestimonialForm onSubmit={() => { setTestimonialSubmitted(true); setShowTestimonialForm(false); toast.success('Thank you for your feedback!'); }} />
            )}
          </div>
        )}
        {testimonialSubmitted && <div className="text-green-600 text-center my-8 font-semibold">Thank you for submitting your testimonial!</div>}
      </div>
      <div className='md:mt-10'>
        <Suspense fallback={<Loading />}>
        {
          playerData
            ? (
              <div>
                {playerData.lectureUrl && (playerData.lectureUrl.startsWith('http') && playerData.lectureUrl.includes('youtube')) ? (
                  <YouTube iframeClassName='w-full aspect-video' videoId={playerData.lectureUrl.split('/').pop()} />
                ) : playerData.lectureUrl ? (
                  <video
                    className='w-full aspect-video'
                    src={playerData.lectureUrl.startsWith('http') ? playerData.lectureUrl : `${backendUrl.replace(/\/$/, '')}/videos/${playerData.lectureUrl}`}
                    controls
                    crossOrigin="anonymous"
                    onError={e => { e.target.onerror = null; e.target.poster = ''; toast.error('Video failed to load. Please refresh or contact support.'); }}
                  />
                ) : (
                  <div className='w-full aspect-video bg-green-100 flex items-center justify-center text-green-700'>No video available</div>
                )}
                <div className='flex justify-between items-center mt-1'>
                  <p className='text-xl '>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
                  <button onClick={() => markLectureAsCompleted(playerData.lectureId)} className='text-green-600 hover:underline'>
                    {progressData && Array.isArray(progressData.lectureCompleted) && progressData.lectureCompleted.includes(playerData.lectureId) ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            )
            : <img src={courseData ? courseData.courseThumbnail : ''} alt="" />
        }
        </Suspense>
      </div>
    </div>
    <Footer />
    </>
  )
}

export default Player