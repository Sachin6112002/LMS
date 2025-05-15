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
    const [isLoading, setIsLoading] = useState(true)

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

            const token = await getToken();

            const { data } = await axios.get(backendUrl + '/api/user/data',
                { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setUserData(data.user)
                if (data.user.publicMetadata.role === 'educator') {
                    setIsEducator(true)
                }
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

    // Added debugging logs to identify where the application is getting stuck
    useEffect(() => {
        const initializeApp = async () => {
            console.log('Initializing AppContext...');
            try {
                const token = await getToken();
                console.log('Token retrieved:', token);

                const [coursesResponse, userResponse] = await Promise.all([
                    axios.get(backendUrl + '/api/course/all'),
                    axios.get(backendUrl + '/api/user/data', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                console.log('Courses Response:', coursesResponse);
                console.log('User Response:', userResponse);

                if (coursesResponse.data.success) {
                    setAllCourses(coursesResponse.data.courses);
                } else {
                    toast.error(coursesResponse.data.message);
                }

                if (userResponse.data.success) {
                    setUserData(userResponse.data.user);
                    if (userResponse.data.user.publicMetadata.role === 'educator') {
                        setIsEducator(true);
                    }
                } else {
                    toast.error(userResponse.data.message);
                }
            } catch (error) {
                console.error('Error during initialization:', error);
                toast.error(error.message);
            } finally {
                setIsLoading(false);
                console.log('AppContext initialization complete.');
            }
        };

        initializeApp();
    }, [getToken]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const value = {
        showLogin, setShowLogin,
        backendUrl, currency, navigate,
        userData, setUserData, getToken,
        allCourses, fetchAllCourses,
        enrolledCourses, fetchUserEnrolledCourses,
        calculateChapterTime, calculateCourseDuration,
        calculateRating, calculateNoOfLectures,
        isEducator,setIsEducator
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}
