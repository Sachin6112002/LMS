import React, { useContext, useEffect, useState } from 'react';
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

      if (data.success) {
        setCourseData(data.courseData)
      } else {
        toast.error(data.message)
      }

    } catch (error) {

      toast.error(error.message)

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
        const { session_url } = data
        window.location.replace(session_url)
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
    }
  }, [userData, courseData])

  if (!courseData) return <Loading />;
  if (!courseData._id) return <p className="text-red-500 p-8">Course not found or unavailable.</p>;

  return (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-20 pt-10 text-left">
        <div className="absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient-to-b from-green-100/70"></div>

        <div className="max-w-xl z-10 text-green-700">
          <h1 className="md:text-course-deatails-heading-large text-course-deatails-heading-small font-semibold text-green-900">
            {courseData.courseTitle || 'Untitled Course'}
          </h1>
          <p className="pt-4 md:text-base text-sm" dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}>
          </p>

          <div className='flex items-center space-x-2 pt-3 pb-1 text-sm'>
            <p>{calculateRating(courseData)}</p>
            <div className='flex'>
              {[...Array(5)].map((_, i) => (<img key={i} src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} alt=''
                className='w-3.5 h-3.5' />
              ))}
            </div>
            <p className='text-green-600'>({courseData.courseRatings.length} {courseData.courseRatings.length > 1 ? 'ratings' : 'rating'})</p>

            <p>{courseData.enrolledStudents.length} {courseData.enrolledStudents.length > 1 ? 'students' : 'student'}</p>
          </div>

          <p className='text-sm'>Course by <span className='text-green-600 underline'>{courseData.educator && courseData.educator.name ? courseData.educator.name : 'Unknown Educator'}</span></p>

          <div className="pt-8 text-green-900">
            <h2 className="text-xl font-semibold">Course Structure</h2>
            <div className="pt-5">
              {Array.isArray(courseData.courseContent) && courseData.courseContent.length > 0 ? courseData.courseContent.map((chapter, index) => (
                <div key={index} className="border border-green-200 bg-green-50 mb-2 rounded">
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
                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-green-700 border-t border-green-200">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className="flex items-start gap-2 py-1">
                          <img src={assets.play_icon} alt="bullet icon" className="w-4 h-4 mt-1" />
                          <div className="flex items-center justify-between w-full text-green-900 text-xs md:text-default">
                            <p>{lecture.lectureTitle}</p>
                            <div className='flex gap-2'>
                              {lecture.isPreviewFree && <p onClick={() => setPlayerData({
                                videoUrl: lecture.lectureUrl
                              })} className='text-green-600 hover:underline cursor-pointer'>Preview</p>}
                              <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
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
            <p className="rich-text pt-3" dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}>
            </p>
          </div>
        </div>

        <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-green-50 min-w-[300px] sm:min-w-[420px]">
          {
            playerData
              ? <video controls autoPlay className="w-full aspect-video rounded-t" src={playerData.videoUrl} />
              : <img src={courseData.courseThumbnail} alt="" />
          }
          {/* Watch Button */}
          <button
            className={`w-full py-3 rounded mt-3 mb-2 font-semibold transition text-white ${isAlreadyEnrolled ? 'bg-green-500 hover:bg-green-600 cursor-pointer' : 'bg-green-200 cursor-not-allowed'}`}
            disabled={!isAlreadyEnrolled || !courseData.courseContent?.length || !courseData.courseContent[0].chapterContent?.length}
            onClick={() => {
              if (isAlreadyEnrolled && courseData.courseContent?.length && courseData.courseContent[0].chapterContent?.length) {
                navigate('/player/' + courseData._id);
              }
            }}
          >
            Watch
          </button>
          <div className="p-5">
            <div className="flex items-center gap-2">
              <img className="w-3.5" src={assets.time_left_clock_icon} alt="time left clock icon" />
              <p className="text-green-700">
                <span className="font-medium">5 days</span> left at this price!
              </p>
            </div>
            <div className="flex gap-3 items-center pt-2">
              <p className="text-green-900 md:text-4xl text-2xl font-semibold">{currency}{(courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)}</p>
              <p className="md:text-lg text-green-400 line-through">{currency}{courseData.coursePrice}</p>
              <p className="md:text-lg text-green-500">{courseData.discount}% off</p>
            </div>
            <div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-green-700">
              <div className="flex items-center gap-1">
                <img src={assets.star} alt="star icon" />
                <p>{calculateRating(courseData)}</p>
              </div>
              <div className="h-4 w-px bg-green-200"></div>
              <div className="flex items-center gap-1">
                <img src={assets.time_clock_icon} alt="clock icon" />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>
              <div className="h-4 w-px bg-green-200"></div>
              <div className="flex items-center gap-1">
                <img src={assets.lesson_icon} alt="clock icon" />
                <p>{calculateNoOfLectures(courseData)} lessons</p>
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