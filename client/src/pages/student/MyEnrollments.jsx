import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { Line } from 'rc-progress';
import Footer from '../../components/student/Footer';
import Loading from '../../components/student/Loading'; // Adjust the import based on your project structure

const MyEnrollments = () => {

    const { userData, enrolledCourses, fetchUserEnrolledCourses, navigate, backendUrl, getToken, calculateCourseDuration, calculateNoOfLectures } = useContext(AppContext)

    const [progressArray, setProgressData] = useState([])

    const getCourseProgress = async () => {
        try {
            if (!Array.isArray(enrolledCourses) || enrolledCourses.length === 0) {
                return;
            }
            
            const token = await getToken();

            // Use Promise.all to handle multiple async operations
            const tempProgressArray = await Promise.all(
                enrolledCourses.map(async (course) => {
                    try {
                        const { data } = await axios.post(
                            `${backendUrl}/api/user/get-course-progress`,
                            { courseId: course._id },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        // Calculate total lectures safely
                        let totalLectures = calculateNoOfLectures(course) || 0;

                        const lectureCompleted = data.progressData && Array.isArray(data.progressData.lectureCompleted) 
                            ? data.progressData.lectureCompleted.length 
                            : 0;
                        return { totalLectures, lectureCompleted };
                    } catch (error) {
                        console.error('Error getting progress for course:', course._id, error);
                        return { totalLectures: 0, lectureCompleted: 0 };
                    }
                })
            );

            setProgressData(tempProgressArray);
        } catch (error) {
            console.error('Error in getCourseProgress:', error);
        }
    };

    useEffect(() => {
        console.log('MyEnrollments useEffect - userData:', userData);
        if (userData) {
            fetchUserEnrolledCourses()
        } else {
            console.log('No userData available, cannot fetch enrolled courses');
        }
    }, [userData])

    useEffect(() => {

        if (enrolledCourses.length > 0) {
            getCourseProgress()
        }

    }, [enrolledCourses])

    // Defensive: show loading if userData is not available
    if (!userData) {
        return (
            <div className="min-h-screen bg-green-50 flex items-center justify-center">
                <div className="text-center">
                    <Loading />
                    <p className="text-green-700 mt-4">Loading user data...</p>
                </div>
            </div>
        );
    }

    // Defensive: show loading if enrolledCourses is not loaded
    if (!Array.isArray(enrolledCourses)) return <Loading />;
    if (enrolledCourses.length === 0) return <p className="p-8 text-green-700">You have not enrolled in any courses yet.</p>;

    return (
        <>
            <div className="min-h-screen bg-green-50">
                <h1 className="text-3xl font-bold text-green-900 py-8 text-center">My Enrollments</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8 pb-16">
                    {enrolledCourses.map((course, idx) => (
                        <div key={course._id} className="bg-white border border-green-200 rounded-lg shadow p-6 flex flex-col gap-4">
                            <h2 className="text-xl font-semibold text-green-900">{course.title}</h2>
                            <p className="text-green-700">{course.createdBy || 'Unknown Educator'}</p>
                            <p className="text-green-700">{calculateCourseDuration(course)} | {calculateNoOfLectures(course)} lessons</p>
                            <div className="flex items-center gap-2">
                                <Line percent={progressArray[idx]?.lectureCompleted / progressArray[idx]?.totalLectures * 100 || 0} strokeWidth={4} strokeColor="#22c55e" trailWidth={4} trailColor="#e5f9ed" />
                                <span className="text-green-700 text-sm">{progressArray[idx]?.lectureCompleted || 0}/{progressArray[idx]?.totalLectures || 0} completed</span>
                            </div>
                            <button onClick={() => navigate(`/player/${course._id}`)} className="bg-green-500 hover:bg-green-600 text-white py-2 rounded mt-2 font-semibold">Continue</button>
                        </div>
                    ))}
                </div>
                <Footer />
            </div>
        </>
    )
}

export default MyEnrollments