import React, { useContext, useEffect, useState } from 'react'
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
    enrolledCourses.map((course) => {
      if (course._id === courseId) {
        setCourseData(course)
        course.courseRatings.map((item) => {
          if (item.userId === userData.id) {
            setInitialRating(item.rating)
          }
        })
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
  if (!courseData) return <Loading />;
  if (!courseData._id) return <p className="text-red-500 p-8">Course not found or unavailable.</p>;

  // Helper: force refresh course data (for educator after upload)
  const handleRefresh = () => {
    fetchUserEnrolledCourses();
    setTimeout(() => getCourseData(), 500); // Give time for backend to update
  };

  // After course completion UI (e.g., after all lectures completed)
  const allLectures = courseData && courseData.courseContent ? courseData.courseContent.flatMap(ch => ch.chapterContent) : [];
  const allCompleted = progressData && allLectures.length > 0 && progressData.lectureCompleted && progressData.lectureCompleted.length === allLectures.length;

  return (
    <>
    <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36' >
      <div className=" text-gray-800" >
        <h2 className="text-xl font-semibold">Course Structure</h2>
        <button onClick={handleRefresh} className="mb-4 px-3 py-1 bg-blue-500 text-white rounded text-sm">Refresh</button>
        <div className="pt-5">
          {courseData && courseData.courseContent.map((chapter, index) => (
            <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleSection(index)}
              >
                <div className="flex items-center gap-2">
                  <img src={assets.down_arrow_icon} alt="arrow icon" className={`transform transition-transform ${openSections[index] ? "rotate-180" : ""}`} />
                  <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                </div>
                <p className="text-sm md:text-default">{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}</p>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? "max-h-96" : "max-h-0"}`} >
                <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                  {chapter.chapterContent.map((lecture, i) => (
                    <li key={i} className="flex items-start gap-2 py-1">
                      <img src={progressData && progressData.lectureCompleted.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon} alt="bullet icon" className="w-4 h-4 mt-1" />
                      <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                        <p>{lecture.lectureTitle}</p>
                        <div className='flex gap-2'>
                          {lecture.lectureUrl && <p onClick={() => setPlayerData({ ...lecture, chapter: index + 1, lecture: i + 1 })} className='text-blue-500 cursor-pointer'>Watch</p>}
                          <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className=" flex items-center gap-2 py-3 mt-10">
          <h1 className="text-xl font-bold">Rate this Course:</h1>
          <Rating initialRating={initialRating} onRate={handleRate} />
        </div>

        {allCompleted && !testimonialSubmitted && (
          <div className="my-8">
            {!showTestimonialForm ? (
              <button className="bg-blue-600 text-white px-6 py-3 rounded font-semibold" onClick={() => setShowTestimonialForm(true)}>
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
        {/* Main Watch Button */}
        <button
          className={`w-full py-3 rounded mb-4 font-semibold transition text-white ${courseData && courseData.courseContent?.length && courseData.courseContent[0].chapterContent?.length ? 'bg-green-500 hover:bg-green-600 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'}`}
          disabled={!courseData || !courseData.courseContent?.length || !courseData.courseContent[0].chapterContent?.length}
          onClick={() => {
            if (courseData && courseData.courseContent?.length && courseData.courseContent[0].chapterContent?.length) {
              const firstLecture = courseData.courseContent[0].chapterContent[0];
              setPlayerData({ ...firstLecture, chapter: 1, lecture: 1 });
            }
          }}
        >
          Watch
        </button>
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
                  <div className='w-full aspect-video bg-gray-200 flex items-center justify-center'>No video available</div>
                )}
                <div className='flex justify-between items-center mt-1'>
                  <p className='text-xl '>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
                  <button onClick={() => markLectureAsCompleted(playerData.lectureId)} className='text-blue-600'>{progressData && progressData.lectureCompleted.includes(playerData.lectureId) ? 'Completed' : 'Mark Complete'}</button>
                </div>
              </div>
            )
            : <img src={courseData ? courseData.courseThumbnail : ''} alt="" />
        }
      </div>
    </div>
    <Footer />
    </>
  )
}

export default Player