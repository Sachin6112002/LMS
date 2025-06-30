import React, { useContext, useEffect, useState, Suspense } from 'react';
import Footer from '../../components/student/Footer';
import { assets } from '../../assets/assets';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import humanizeDuration from 'humanize-duration'
import Loading from '../../components/student/Loading';

const CourseDetails = () => {

  const { id } = useParams()
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null)
  const [playerData, setPlayerData] = useState(null)
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false)

  const { backendUrl, currency, userData, calculateChapterTime, calculateCourseDuration, calculateRating, calculateNoOfLectures, getToken } = useContext(AppContext)


  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/course/' + id)
      if (data.success && data.courseData && typeof data.courseData === 'object') {
        // Ensure chapters is always an array
        if (!Array.isArray(data.courseData.chapters)) {
          data.courseData.chapters = [];
        }
        setCourseData(data.courseData)
      } else {
        setCourseData(null);
        toast.error(data.message || 'Course not found, not published, or corrupted')
      }
    } catch (error) {
      setCourseData(null);
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const [openSections, setOpenSections] = useState({});

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };


  const enrollCourse = async () => {

    try {

      if (!userData) {
        return toast.warn('Login to Enroll')
      }

      if (isAlreadyEnrolled) {
        return toast.warn('Already Enrolled')
      }

      const token = await getToken();

      const { data } = await axios.post(backendUrl + '/api/user/purchase',
        { courseId: courseData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        if (data.isFree) {
          // For free courses, refresh user data and navigate to enrollments
          toast.success(data.message);
          // Refresh user data to update enrolled courses
          setTimeout(() => {
            window.location.href = '/my-enrollments';
          }, 1500);
        } else {
          // For paid courses, redirect to Stripe
          const { session_url } = data
          window.location.replace(session_url)
        }
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchCourseData()
  }, [])

  useEffect(() => {
    if (userData && courseData) {
      setIsAlreadyEnrolled(userData.enrolledCourses && userData.enrolledCourses.includes(courseData._id))
    } else {
      setIsAlreadyEnrolled(false)
    }
  }, [userData, courseData])

  // Early defensive check - must be first, before any courseData usage
  if (!courseData || typeof courseData !== 'object' || !Array.isArray(courseData.chapters)) {
    return <p className="text-red-500 p-8">Course data is unavailable, not published, or corrupted.</p>;
  }

  // Defensive normalization: always ensure chapters and lectures are arrays
  const safeChapters = courseData.chapters.map(ch => ({
    ...ch,
    lectures: Array.isArray(ch.lectures) ? ch.lectures : []
  }));

  return (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-20 pt-10 text-left">
        <div className="absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient-to-b from-green-100/70"></div>

        <div className="max-w-xl z-10 text-green-700">
          <h1 className="md:text-course-deatails-heading-large text-course-deatails-heading-small font-semibold text-green-900">
            {courseData.title || 'Untitled Course'}
          </h1>
          <p className="pt-4 md:text-base text-sm" dangerouslySetInnerHTML={{ __html: (courseData.description || '').slice(0, 200) }}>
          </p>

          <div className='flex items-center space-x-2 pt-3 pb-1 text-sm'>
            {/* Ratings removed as not in new model */}
            {/* <p>{calculateRating(courseData)}</p> */}
            {/* <div className='flex'>
              {[...Array(5)].map((_, i) => (<img key={i} src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} alt='' className='w-3.5 h-3.5' />))}
            </div> */}
            {/* <p className='text-green-600'>({(courseData.courseRatings?.length || 0)} ratings)</p> */}
            {/* <p>{(courseData.enrolledStudents?.length || 0)} students</p> */}
          </div>

          <p className='text-sm'>Course by <span className='text-green-600 underline'>{typeof courseData.createdBy === 'object' && courseData.createdBy?.name ? courseData.createdBy.name : (typeof courseData.createdBy === 'string' && courseData.createdBy.length > 0 ? courseData.createdBy : 'Unknown Educator')}</span></p>

          <div className="pt-8 text-green-900">
            <h2 className="text-xl font-semibold">Course Structure</h2>
            <div className="pt-5">
              {Array.isArray(courseData.chapters) && courseData.chapters.length > 0 ? courseData.chapters.map((chapter, index) => (
                <div key={index} className="border border-green-200 bg-green-50 mb-2 rounded">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img src={assets.down_arrow_icon} alt="arrow icon" className={`transform transition-transform ${openSections[index] ? "rotate-180" : ""}`} />
                      <p className="font-medium md:text-base text-sm">{chapter.title || chapter.chapterTitle}</p>
                    </div>
                    <p className="text-sm md:text-default">{(chapter.lectures?.length || 0)} lectures</p>
                  </div>

                  <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? "max-h-96" : "max-h-0"}`} >
                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-green-700 border-t border-green-200">
                      {(chapter.lectures || []).map((lecture, i) => (
                        <li key={i} className="flex items-start gap-2 py-1">
                          <img src={assets.play_icon} alt="bullet icon" className="w-4 h-4 mt-1" />
                          <div className="flex items-center justify-between w-full text-green-900 text-xs md:text-default">
                            <p>{lecture.title || lecture.lectureTitle}</p>
                            <div className='flex gap-2'>
                              {/* Preview logic if available */}
                              {lecture.isPreviewFree && lecture.videoUrl && (
                                <p 
                                  onClick={() => setPlayerData({ 
                                    videoUrl: lecture.videoUrl,
                                    title: lecture.title,
                                    isPreview: true
                                  })} 
                                  className='text-green-600 hover:underline cursor-pointer font-semibold'
                                >
                                  🎬 Free Preview
                                </p>
                              )}
                              {/* Duration if available */}
                              {lecture.duration && <p>{typeof lecture.duration === 'string' ? lecture.duration : humanizeDuration(lecture.duration * 60 * 1000, { units: ['h', 'm'] })}</p>}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )) : <p>No course content available.</p>}
            </div>
          </div>

          <div className="py-20 text-sm md:text-default">
            <h3 className="text-xl font-semibold text-green-900">Course Description</h3>
            <p className="rich-text pt-3" dangerouslySetInnerHTML={{ __html: courseData.description || '' }}>
            </p>
          </div>
        </div>

        <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-green-50 min-w-[300px] sm:min-w-[420px]">
          {
            playerData
              ? (
                <div className="relative">
                  {(() => {
                    let videoSrc;
                    if (playerData.videoUrl.startsWith('http')) {
                      // It's already a full URL (Cloudinary)
                      videoSrc = playerData.videoUrl;
                    } else {
                      // It's a local file, prepend server URL
                      videoSrc = `${backendUrl.replace(/\/$/, '')}/videos/${playerData.videoUrl}`;
                    }
                    
                    return (
                      <video 
                        controls 
                        autoPlay 
                        className="w-full aspect-video rounded-t" 
                        src={videoSrc}
                        onError={e => { 
                          console.error('Video error:', e.target.error);
                          e.target.onerror = null; 
                          e.target.poster = ''; 
                        }}
                      />
                    );
                  })()}
                  {playerData.isPreview && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      🎬 Free Preview
                    </div>
                  )}
                  {playerData.title && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                      {playerData.title}
                    </div>
                  )}
                  <button
                    onClick={() => setPlayerData(null)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold"
                  >
                    ×
                  </button>
                </div>
              )
              : <img src={courseData.thumbnail} alt="" />
          }
          {/* Watch Button */}
          <Suspense fallback={<Loading />}>
            <button
              className={`w-full py-3 rounded mt-3 mb-2 font-semibold transition text-white ${isAlreadyEnrolled ? 'bg-green-500 hover:bg-green-600 cursor-pointer' : 'bg-green-200 cursor-not-allowed'}`}
              disabled={
                !isAlreadyEnrolled ||
                safeChapters.length === 0 ||
                safeChapters[0].lectures.length === 0
              }
              onClick={() => {
                if (
                  isAlreadyEnrolled &&
                  safeChapters.length > 0 &&
                  safeChapters[0].lectures.length > 0
                ) {
                  navigate('/player/' + courseData._id);
                }
              }}
            >
              Watch
            </button>
          </Suspense>
          <div className="p-5">
            {/* Price/discount/rating removed as not in new model */}
            <div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-green-700">
              <div className="flex items-center gap-1">
                <img src={assets.lesson_icon} alt="lesson icon" />
                <p>{safeChapters.reduce((acc, ch) => acc + ch.lectures.length, 0)} lessons</p>
              </div>
            </div>
            <button onClick={enrollCourse} className="md:mt-6 mt-4 w-full py-3 rounded bg-green-600 hover:bg-green-700 text-white font-medium">
              {isAlreadyEnrolled ? "Already Enrolled" : "Enroll Now"}
            </button>
            <div className="pt-6">
              <p className="md:text-xl text-lg font-medium text-green-900">What's in the course?</p>
              <ul className="ml-4 pt-2 text-sm md:text-default list-disc text-green-700">
                <li>Lifetime access with free updates.</li>
                <li>Step-by-step, hands-on project guidance.</li>
                <li>Downloadable resources and source code.</li>
                <li>Quizzes to test your knowledge.</li>
                <li>Certificate of completion.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetails;