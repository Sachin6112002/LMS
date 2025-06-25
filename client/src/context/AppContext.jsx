import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext()

export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()

    // JWT and user state
    const [jwt, setJwt] = useState(() => localStorage.getItem('jwtToken') || null)
    const [userData, setUserData] = useState(() => {
        const stored = localStorage.getItem('userData')
        return stored ? JSON.parse(stored) : null
    })
    const [showLogin, setShowLogin] = useState(false)
    const [isEducator, setIsEducator] = useState(false)
    const [allCourses, setAllCourses] = useState([])
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [users, setUsers] = useState([])
    const [courses, setCourses] = useState([])

    // Auth helpers
    const getToken = () => jwt
    const saveAuth = (token, user) => {
        setJwt(token)
        setUserData(user)
        localStorage.setItem('jwtToken', token)
        localStorage.setItem('userData', JSON.stringify(user))
    }
    const logout = () => {
        setJwt(null)
        setUserData(null)
        setIsEducator(false)
        localStorage.removeItem('jwtToken')
        localStorage.removeItem('userData')
        toast.success('Logged out successfully')
        navigate('/')
    }
    // Registration
    const register = async (form, isFormData = false) => {
        try {
            const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
            const { data } = await axios.post(`${backendUrl}/api/user/register`, form, config);
            if (data.success) {
                toast.success('Registration successful! Please login.')
                navigate('/login')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    }
    // Login
    const login = async (form) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/login`, form)
            if (data.success) {
                saveAuth(data.token, data.user)
                toast.success('Login successful!')
                if (data.user.role === 'educator') setIsEducator(true)
                navigate('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    }

    // Fetch All Courses
    const fetchAllCourses = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/courses/all');
            if (data.success) {
                setAllCourses(data.courses)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Fetch UserData (from backend, using JWT)
    const fetchUserData = async () => {
        if (!jwt) return
        try {
            const { data } = await axios.get(backendUrl + '/api/user/data',
                { headers: { Authorization: `Bearer ${jwt}` } })
            if (data.success) {
                setUserData(data.user)
                localStorage.setItem('userData', JSON.stringify(data.user))
                if (data.user.role === 'educator') setIsEducator(true)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Fetch User Enrolled Courses
    const fetchUserEnrolledCourses = async () => {
        if (!jwt) return
        try {
            const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses',
                { headers: { Authorization: `Bearer ${jwt}` } })
            if (data.success) {
                setEnrolledCourses(data.enrolledCourses.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
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

    // Helper to reload userData (e.g., after registration or login)
    const reloadUserData = async () => {
        await fetchUserData();
    };

    useEffect(() => {
        fetchAllCourses()
    }, [])

    useEffect(() => {
        if (jwt) {
            fetchUserData()
            fetchUserEnrolledCourses()
        }
    }, [jwt])

    // On mount, validate JWT and clear userData if invalid
    useEffect(() => {
        const checkAuth = async () => {
            if (!jwt) {
                setUserData(null);
                localStorage.removeItem('userData');
                return;
            }
            try {
                const { data } = await axios.get(
                    backendUrl + '/api/user/data',
                    { headers: { Authorization: `Bearer ${jwt}` } }
                );
                if (!data.success) {
                    setUserData(null);
                    setJwt(null);
                    localStorage.removeItem('userData');
                    localStorage.removeItem('jwtToken');
                }
            } catch (error) {
                setUserData(null);
                setJwt(null);
                localStorage.removeItem('userData');
                localStorage.removeItem('jwtToken');
            }
        };
        checkAuth();
        // eslint-disable-next-line
    }, []);

    // TEMP: Force userData for debug
    useEffect(() => {
        if (!userData) {
            setUserData({
                id: "testid",
                email: "test@example.com",
                name: "Test User",
                role: "student",
                imageUrl: ""
            });
        }
    }, []);

    const value = {
        showLogin, setShowLogin,
        backendUrl, currency, navigate,
        userData, setUserData, getToken,
        allCourses, fetchAllCourses,
        enrolledCourses, fetchUserEnrolledCourses,
        isEducator, setIsEducator,
        users, courses,
        // Auth
        login, register, logout,
        // Function to Calculate Course Chapter Time
        calculateChapterTime, calculateCourseDuration,
        calculateRating, calculateNoOfLectures,
        // Admin
        fetchAllUsers, fetchCourses, manageCourses, updateAdminSettings,
        // Helper to reload userData (e.g., after registration or login)
        reloadUserData
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
