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
    const [courses, setCourses] = useState([])
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [users, setUsers] = useState([])

    // Setup axios interceptor for handling 401 errors
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && jwt) {
                    console.log('401 error detected, clearing invalid token');
                    setJwt(null);
                    setUserData(null);
                    setIsEducator(false);
                    setEnrolledCourses([]);
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('userData');
                    toast.error('Session expired. Please login again.');
                    navigate('/login');
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [jwt, navigate]);

    // Auth helpers
    const getToken = () => jwt
    const isAuthenticated = () => !!jwt && !!userData
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
        setEnrolledCourses([])
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
                // Check role from publicMetadata or direct role field
                const userRole = data.user.publicMetadata?.role || data.user.role;
                if (userRole === 'educator') setIsEducator(true)
                navigate('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    }

    // Unified Fetch Courses
    const fetchCourses = async (admin = false) => {
        try {
            const token = getToken();
            const url = admin ? `${backendUrl}/api/admin/courses` : `${backendUrl}/api/courses`;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const { data } = await axios.get(url, { headers });
            // Admin endpoint returns array, user endpoint returns { success, courses }
            if (admin) {
                if (Array.isArray(data)) {
                    setCourses(data);
                } else {
                    toast.error('Failed to fetch courses.');
                }
            } else {
                if (data.success) {
                    setCourses(data.courses);
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch courses.');
        }
    }    

    // Fetch UserData (from backend, using JWT)
    const fetchUserData = async () => {
        if (!jwt) {
            console.log('No JWT token available for fetching user data');
            return;
        }
        try {
            console.log('Fetching user data...');
            const { data } = await axios.get(backendUrl + '/api/user/data',
                { headers: { Authorization: `Bearer ${jwt}` } })
            if (data.success) {
                setUserData(data.user)
                localStorage.setItem('userData', JSON.stringify(data.user))
                // Check role from publicMetadata or direct role field
                const userRole = data.user.publicMetadata?.role || data.user.role;
                if (userRole === 'educator') setIsEducator(true)
                console.log('User data fetched successfully:', data.user);
            } else {
                console.error('Failed to fetch user data:', data.message);
                // Don't show toast for user not found when not logged in
                if (jwt) {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            // Only show error toast if we have a token (user should be logged in)
            if (jwt && error.response?.status !== 401) {
                if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error('Failed to fetch user data. Please try logging in again.');
                }
            }
            // If 401 error (unauthorized), clear invalid token
            if (error.response?.status === 401) {
                console.log('Token appears to be invalid, clearing auth data');
                logout();
            }
        }
    }

    // Fetch User Enrolled Courses
    const fetchUserEnrolledCourses = async () => {
        if (!jwt) {
            console.log('No JWT token available for fetching enrolled courses');
            return;
        }
        try {
            console.log('Fetching enrolled courses for user...');
            const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses',
                { headers: { Authorization: `Bearer ${jwt}` } })
            if (data.success) {
                setEnrolledCourses(data.enrolledCourses.reverse())
                console.log('Enrolled courses fetched successfully:', data.enrolledCourses.length, 'courses');
            } else {
                console.error('Failed to fetch enrolled courses:', data.message);
                // Don't show toast for enrolled courses when not logged in
                if (jwt) {
                    toast.error(data.message || 'Failed to fetch enrolled courses')
                }
            }
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            // Only show error toast if we have a token (user should be logged in)
            if (jwt && error.response?.status !== 401) {
                if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error('Failed to fetch enrolled courses. Please try logging in again.');
                }
            }
            // If 401 error (unauthorized), clear invalid token
            if (error.response?.status === 401) {
                console.log('Token appears to be invalid, clearing auth data');
                logout();
            }
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
                fetchCourses(true); // Refresh courses after action
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

    // Add Chapter to Course
    const addChapterToCourse = async (courseId, chapterData) => {
        try {
            const token = getToken();
            if (!token) throw new Error('Not authenticated');
            const { data } = await axios.post(
                `${backendUrl}/api/courses/${courseId}/chapters`,
                chapterData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success('Chapter added successfully!');
                fetchCourses(); // Optionally refresh courses
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }

    // Become Educator
    const becomeEducator = async () => {
        try {
            const token = getToken();
            if (!token) {
                toast.error('Please login first');
                return false;
            }
            
            const { data } = await axios.post(
                `${backendUrl}/api/user/become-educator`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (data.success) {
                // Update local state
                setIsEducator(true);
                const updatedUserData = { ...userData, role: 'educator' };
                setUserData(updatedUserData);
                localStorage.setItem('userData', JSON.stringify(updatedUserData));
                
                toast.success('Congratulations! You are now an educator!');
                return true;
            } else {
                toast.error(data.message || 'Failed to become educator');
                return false;
            }
        } catch (error) {
            console.error('Error becoming educator:', error);
            toast.error(error.response?.data?.message || 'Failed to become educator');
            return false;
        }
    };

    // Function to Calculate Course Chapter Time
    const calculateChapterTime = (chapter) => {
        if (!chapter) return "0m";
        
        let time = 0;
        // Support both new and old model
        const lectures = Array.isArray(chapter.lectures) ? chapter.lectures : 
                        (Array.isArray(chapter.chapterContent) ? chapter.chapterContent : []);
        
        lectures.forEach((lecture) => {
            if (lecture && (lecture.lectureDuration || lecture.duration)) {
                time += lecture.lectureDuration || lecture.duration;
            }
        });
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
    }

    // Function to Calculate Course Duration
    const calculateCourseDuration = (course) => {
        if (!course) return "0m";
        
        let time = 0;
        // Support both new and old model
        const chapters = Array.isArray(course.chapters) ? course.chapters : 
                        (Array.isArray(course.courseContent) ? course.courseContent : []);
        
        chapters.forEach((chapter) => {
            if (chapter) {
                const lectures = Array.isArray(chapter.lectures) ? chapter.lectures : 
                               (Array.isArray(chapter.chapterContent) ? chapter.chapterContent : []);
                lectures.forEach((lecture) => {
                    if (lecture && (lecture.lectureDuration || lecture.duration)) {
                        time += lecture.lectureDuration || lecture.duration;
                    }
                });
            }
        });
        return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
    }

    const calculateRating = (course) => {
        if (!course || !Array.isArray(course.courseRatings) || course.courseRatings.length === 0) {
            return 0
        }

        let totalRating = 0
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating
        })
        return Math.floor(totalRating / course.courseRatings.length)
    }

    const calculateNoOfLectures = (course) => {
        if (!course) return 0;
        
        let totalLectures = 0;
        // Support both old courseContent and new chapters structure
        const chapters = Array.isArray(course.chapters) ? course.chapters : 
                        (Array.isArray(course.courseContent) ? course.courseContent : []);
        
        chapters.forEach(chapter => {
            const lectures = Array.isArray(chapter.lectures) ? chapter.lectures :
                           (Array.isArray(chapter.chapterContent) ? chapter.chapterContent : []);
            totalLectures += lectures.length;
        });
        return totalLectures;
    }

    // Helper to reload userData (e.g., after registration or login)
    const reloadUserData = async () => {
        await fetchUserData();
    };

    useEffect(() => {
        fetchCourses()
    }, [])

    useEffect(() => {
        if (jwt) {
            fetchUserData()
            fetchUserEnrolledCourses()
        }
    }, [jwt])

    // Sync isEducator with userData to avoid stale state
    useEffect(() => {
        if (userData && userData.role === 'educator') {
            setIsEducator(true);
        } else {
            setIsEducator(false);
        }
    }, [userData]);

    // Defensive: If JWT is removed or invalid, clear all sensitive state
    useEffect(() => {
        if (!jwt) {
            console.log('JWT cleared, cleaning up user state');
            setUserData(null);
            setIsEducator(false);
            setEnrolledCourses([]);
            localStorage.removeItem('userData');
            localStorage.removeItem('jwtToken');
            // Don't force redirect to login - let individual pages handle this
        }
        // eslint-disable-next-line
    }, [jwt]);

    // On mount, validate JWT and clear userData if invalid
    useEffect(() => {
        const checkAuth = async () => {
            if (!jwt) {
                console.log('No JWT token found on mount, clearing any stored user data');
                setUserData(null);
                setIsEducator(false);
                localStorage.removeItem('userData');
                return;
            }
            try {
                console.log('Validating JWT token on mount...');
                const { data } = await axios.get(
                    backendUrl + '/api/user/data',
                    { headers: { Authorization: `Bearer ${jwt}` } }
                );
                if (data.success) {
                    console.log('JWT is valid, user data loaded');
                    setUserData(data.user);
                    localStorage.setItem('userData', JSON.stringify(data.user));
                    // Check role from publicMetadata or direct role field
                    const userRole = data.user.publicMetadata?.role || data.user.role;
                    if (userRole === 'educator') setIsEducator(true);
                } else {
                    console.log('JWT validation failed, clearing auth data');
                    setUserData(null);
                    setJwt(null);
                    setIsEducator(false);
                    localStorage.removeItem('userData');
                    localStorage.removeItem('jwtToken');
                }
            } catch (error) {
                console.log('JWT validation error, clearing auth data:', error.response?.status);
                setUserData(null);
                setJwt(null);
                setIsEducator(false);
                localStorage.removeItem('userData');
                localStorage.removeItem('jwtToken');
            }
        };
        checkAuth();
        // eslint-disable-next-line
    }, []);

    const value = {
        showLogin, setShowLogin,
        backendUrl, currency, navigate,
        userData, setUserData, getToken, isAuthenticated,
        courses,
        fetchCourses,
        enrolledCourses, fetchUserEnrolledCourses,
        isEducator, setIsEducator,
        users,
        // Auth
        login, register, logout,
        // Function to Calculate Course Chapter Time
        calculateChapterTime, calculateCourseDuration,
        calculateRating, calculateNoOfLectures,
        // Admin
        fetchAllUsers, manageCourses, updateAdminSettings,
        // Helper to reload userData (e.g., after registration or login)
        reloadUserData,
        addChapterToCourse,
        becomeEducator
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
