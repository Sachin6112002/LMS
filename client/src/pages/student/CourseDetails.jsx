import React, { useContext, useEffect, useState } from 'react';
import Footer from '../../components/student/Footer';
import { assets } from '../../assets/assets';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import humanizeDuration from 'humanize-duration'
import YouTube from 'react-youtube';
import Loading from '../../components/student/Loading';

const CourseDetails = () => {

  const { id } = useParams()

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

  return courseData ? (
    <>
      <div className="w-full min-h-screen bg-green-50 flex flex-col items-center justify-center">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 lg:p-12">
          {/* Left: Video/Thumbnail and Course Structure */}
          <div className="flex flex-col gap-8">
            <div className="w-full aspect-video bg-white rounded-lg flex items-center justify-center shadow border border-green-200">
              {playerData
                ? <YouTube videoId={playerData.videoId} opts={{ width: '100%', height: '100%', playerVars: { autoplay: 1 } }} className="w-full h-full" iframeClassName="w-full h-full rounded-lg" />
                : <img src={courseData.courseThumbnail} alt="" className="w-full h-full object-cover rounded-lg" />
              }
            </div>
            <div className="bg-white rounded-lg p-6 shadow border border-green-200">
              <h2 className="text-xl font-semibold text-green-900 mb-4">Course Structure</h2>
              <div>
                {courseData.courseContent.map((chapter, index) => (
                  <div key={index} className="border border-green-200 bg-green-50 mb-2 rounded">
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-green-100 transition"
                      onClick={() => toggleSection(index)}
                    >
                      <div className="flex items-center gap-2">
                        <img src={assets.down_arrow_icon} alt="arrow icon" className={`transform transition-transform ${openSections[index] ? "rotate-180" : ""}`} />
                        <p className="font-medium md:text-base text-sm text-green-900">{chapter.chapterTitle}</p>
                      </div>
                      <p className="text-sm md:text-default text-green-700">{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}</p>
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? "max-h-96" : "max-h-0"}`}>
                      <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-green-700 border-t border-green-200 bg-green-50">
                        {chapter.chapterContent.map((lecture, i) => (
                          <li key={i} className="flex items-start gap-2 py-1">
                            <img src={assets.play_icon} alt="bullet icon" className="w-4 h-4 mt-1" />
                            <div className="flex items-center justify-between w-full text-green-900 text-xs md:text-default">
                              <p>{lecture.lectureTitle}</p>
                              <div className='flex gap-2'>
                                {lecture.isPreviewFree && <p onClick={() => setPlayerData({
                                  videoId: lecture.lectureUrl.split('/').pop()
                                })} className='text-green-600 cursor-pointer hover:underline'>Preview</p>}
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
            </div>
          </div>
          {/* Right: Course Info Card */}
          <div className="flex flex-col gap-6 bg-white rounded-lg p-8 shadow border border-green-200 justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-900 mb-2">{courseData.courseTitle}</h1>
              <div className="flex items-center gap-2 mb-2">
                <img className="w-4" src={assets.time_left_clock_icon} alt="time left clock icon" />
                <p className="text-red-500 text-sm">
                  <span className="font-medium">5 days</span> left at this price!
                </p>
              </div>
              <div className="flex gap-3 items-center flex-wrap mb-2">
                <p className="text-green-900 text-4xl md:text-5xl font-bold">{currency}{(courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)}</p>
                <p className="text-lg md:text-2xl text-green-700 line-through">{currency}{courseData.coursePrice}</p>
                <p className="text-lg md:text-2xl text-green-700">{courseData.discount}% off</p>
              </div>
              <div className="flex items-center text-sm gap-4 pt-2 text-green-700 flex-wrap">
                <div className="flex items-center gap-1 text-lg md:text-xl">
                  <img src={assets.time_clock_icon} alt="clock icon" className="w-6 h-6" />
                  <p>{calculateCourseDuration(courseData)}</p>
                </div>
                <div className="h-4 w-px bg-green-200"></div>
                <div className="flex items-center gap-1 text-lg md:text-xl">
                  <img src={assets.lesson_icon} alt="clock icon" className="w-6 h-6" />
                  <p>{calculateNoOfLectures(courseData)} lessons</p>
                </div>
                <div className="h-4 w-px bg-green-200"></div>
                <div className="flex items-center gap-1 text-lg md:text-xl">
                  <p>{calculateRating(courseData)}</p>
                  <div className='flex'>
                    {[...Array(5)].map((_, i) => (
                      <img key={i} src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} alt='' className='w-6 h-6' />
                    ))}
                  </div>
                </div>
              </div>
              <div className='flex flex-row gap-3 mt-2'>
                <p className='text-green-600'>({courseData.courseRatings.length} {courseData.courseRatings.length > 1 ? 'ratings' : 'rating'})</p>
                <p>{courseData.enrolledStudents.length} {courseData.enrolledStudents.length > 1 ? 'students' : 'student'}</p>
                <p className='text-sm'>Course by <span className='text-green-600 underline'>{courseData.educator.name}</span></p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">Course Description</h3>
              <p className="rich-text text-green-800 mb-4" dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}></p>
              <button onClick={enrollCourse} className="w-full py-3 rounded bg-green-500 hover:bg-green-600 text-white font-medium transition">
                {isAlreadyEnrolled ? "Already Enrolled" : "Enroll Now"}
              </button>
              <div className="pt-6">
                <p className="text-lg font-medium text-green-900 mb-1">What's in the course?</p>
                <ul className="ml-4 pt-2 text-sm list-disc text-green-700">
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
      </div>
      <Footer />
    </>
  ) : <Loading />
};

export default CourseDetails;