import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const currency = import.meta.env.VITE_CURRENCY

    const navigate = useNavigate()
    const { getToken } = useAuth()
    const { user } = useUser()

    const [showLogin, setShowLogin] = useState(false)
    const [isEducator,setIsEducator] = useState(false)
    const [allCourses, setAllCourses] = useState([])
    const [userData, setUserData] = useState(null)
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [users, setUsers] = useState([])
    const [courses, setCourses] = useState([]); // Ensure courses state is initialized as an empty array

    // Fetch All Courses
    const fetchAllCourses = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/course/all');

            if (data.success) {
                setAllCourses(data.courses)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }

    }

    // Fetch UserData 
    const fetchUserData = async () => {

        try {

            if (user.publicMetadata.role === 'educator') {
                setIsEducator(true)
            }

            const token = await getToken();

            const { data } = await axios.get(backendUrl + '/api/user/data',
                { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setUserData(data.user)
            } else (
                toast.error(data.message)
            )

        } catch (error) {
            toast.error(error.message)
        }

    }

    // Fetch User Enrolled Courses
    const fetchUserEnrolledCourses = async () => {

        const token = await getToken();

        const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses',
            { headers: { Authorization: `Bearer ${token}` } })

        if (data.success) {
            setEnrolledCourses(data.enrolledCourses.reverse())
        } else (
            toast.error(data.message)
        )

    }

    // Admin: Fetch All Users
    const fetchAllUsers = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                toast.error('Failed to fetch users.');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch users.');
        }
    };

    // Admin: Fetch Courses
    const fetchCourses = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/admin/courses`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (Array.isArray(data)) {
                setCourses(data);
            } else {
                toast.error('Failed to fetch courses.');
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch courses.');
        }
    };

    // Admin: Manage Courses
    const manageCourses = async (action, courseId, courseData) => {
        try {
            const token = await getToken();
            const url = `${backendUrl}/api/admin/courses`;
            let response;

            if (action === 'delete') {
                response = await axios.delete(url, {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { courseId },
                });
            } else if (action === 'update') {
                response = await axios.put(url, { courseId, ...courseData }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else if (action === 'create') {
                response = await axios.post(url, courseData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                throw new Error('Invalid action');
            }

            if (response.data.success) {
                toast.success(response.data.message);
                fetchAllCourses(); // Refresh courses after action
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error managing courses:', error);
            toast.error(error.response?.data?.message || 'Failed to manage courses.');
        }
    };

    // Admin: Update Settings
    const updateAdminSettings = async (settings) => {
        try {
            const token = await getToken();
            const { data } = await axios.put(`${backendUrl}/api/admin/settings`, settings, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) {
                toast.success('Settings updated successfully.');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error(error.response?.data?.message || 'Failed to update settings.');
        }
    };

    // Function to Calculate Course Chapter Time
    const calculateChapterTime = (chapter) => {

        let time = 0

        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)

        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })

    }

    // Function to Calculate Course Duration
    const calculateCourseDuration = (course) => {

        let time = 0

        course.courseContent.map(
            (chapter) => chapter.chapterContent.map(
                (lecture) => time += lecture.lectureDuration
            )
        )

        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })

    }

    const calculateRating = (course) => {

        if (course.courseRatings.length === 0) {
            return 0
        }

        let totalRating = 0
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating
        })
        return Math.floor(totalRating / course.courseRatings.length)
    }

    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach(chapter => {
            if (Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    }


    useEffect(() => {
        fetchAllCourses()
    }, [])

    // Fetch User's Data if User is Logged In
    useEffect(() => {
        if (user) {
            fetchUserData()
            fetchUserEnrolledCourses()
        }
    }, [user])

    const value = {
        showLogin, setShowLogin,
        backendUrl, currency, navigate,
        userData, setUserData, getToken,
        allCourses, fetchAllCourses,
        enrolledCourses, fetchUserEnrolledCourses,
        calculateChapterTime, calculateCourseDuration,
        calculateRating, calculateNoOfLectures,
        isEducator, setIsEducator,
        users, fetchAllUsers,
        courses, fetchCourses, // <-- Ensure fetchCourses is exposed here
        manageCourses, updateAdminSettings
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}
