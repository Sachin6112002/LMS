import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// update role to educator
export const updateRoleToEducator = async (req, res) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
    }
    try {
        const userId = req.auth.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.publicMetadata.role = 'educator';
        await user.save();
        res.json({ success: true, message: 'You can publish a course now' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Add New Course
export const addCourse = async (req, res) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
    }
    try {
        const { courseData } = req.body
        const imageFile = req.file
        const educatorId = req.auth.userId
        // Debug log incoming fields and file
        console.log('addCourse fields:', req.body);
        console.log('addCourse file:', req.file);
        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail Not Attached' })
        }
        const parsedCourseData = await JSON.parse(courseData)
        parsedCourseData.educator = educatorId
        // Ensure course is always created as draft
        parsedCourseData.status = 'draft'
        const newCourse = await Course.create(parsedCourseData)
        const imageUpload = await cloudinary.uploader.upload(imageFile.path)
        newCourse.courseThumbnail = imageUpload.secure_url
        await newCourse.save()
        res.json({ success: true, message: 'Course Added', course: newCourse })
    } catch (error) {
        console.log('addCourse error:', error);
        res.json({ success: false, message: error.message })
    }
}

// Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
    }
    try {

        const educator = req.auth.userId

        const courses = await Course.find({ educator })

        res.json({ success: true, courses })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Educator Dashboard Data ( Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing or invalid token' });
    }
    try {
        const educator = req.auth.userId;

        const courses = await Course.find({ educator });

        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        // Calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        // Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, 'name imageUrl');

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        res.json({
            success: true,
            dashboardData: {
                totalEarnings,
                enrolledStudentsData,
                totalCourses
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
    }
    try {
        const educator = req.auth.userId;

        // Fetch all courses created by the educator
        const courses = await Course.find({ educator });

        // Get the list of course IDs
        const courseIds = courses.map(course => course._id);

        // Fetch purchases with user and course data
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');

        // enrolled students data
        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.json({
            success: true,
            enrolledStudents
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Remove legacy uploadLectureVideo controller
// export const uploadLectureVideo = async (req, res) => {
//     try {
//         const { courseId, chapterId, lectureId } = req.body;
//         if (!req.file) return res.status(400).json({ message: 'No video file uploaded' });
//         const course = await Course.findById(courseId);
//         if (!course) return res.status(404).json({ message: 'Course not found' });
//         let updated = false;
//         for (const chapter of course.courseContent) {
//             if (chapter.chapterId === chapterId) {
//                 for (const lecture of chapter.chapterContent) {
//                     if (lecture.lectureId === lectureId) {
//                         lecture.videoFile = req.file.filename;
//                         lecture.lectureUrl = req.file.filename; // <-- Fix: set lectureUrl to filename
//                         updated = true;
//                     }
//                 }
//             }
//         }
//         if (!updated) return res.status(404).json({ message: 'Lecture not found' });
//         await course.save();
//         res.json({ success: true, filename: req.file.filename });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

// Add Chapter to Course
export const addChapter = async (req, res) => {
    try {
        const { courseId, chapterTitle, chapterOrder } = req.body;
        if (!courseId || !chapterTitle) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        const chapterId = new mongoose.Types.ObjectId().toString();
        const newChapter = {
            chapterId,
            chapterTitle,
            chapterOrder,
            chapterContent: []
        };
        course.courseContent.push(newChapter);
        await course.save();
        res.json({ success: true, chapter: newChapter });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Add Lecture to Chapter
export const addLecture = async (req, res) => {
    try {
        // Debug log incoming fields and file
        console.log('addLecture fields:', req.body);
        console.log('addLecture file:', req.file);
        const { courseId, chapterId, lectureTitle, lectureDuration, isPreviewFree, lectureOrder } = req.body;
        if (!courseId || !chapterId || !lectureTitle || !lectureDuration) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        if (!req.file) return res.status(400).json({ success: false, message: 'Missing required parameter - file' });

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        const chapter = course.courseContent.find(ch => ch.chapterId === chapterId);
        if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

        const lectureId = new mongoose.Types.ObjectId().toString();
        const newLecture = {
            lectureId,
            lectureTitle,
            lectureDuration,
            isPreviewFree,
            lectureOrder,
            videoFile: req.file.filename,
            lectureUrl: req.file.filename
        };
        chapter.chapterContent.push(newLecture);
        await course.save();
        res.json({ success: true, lecture: newLecture });
    } catch (err) {
        console.log('addLecture error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUBLISH COURSE ENDPOINT
export const publishCourse = async (req, res) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
    }
    try {
        const { courseId } = req.body;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
        if (course.educator !== req.auth.userId) {
            return res.status(403).json({ success: false, message: 'Not your course' });
        }
        // Must have at least one chapter and one lecture
        if (!course.courseContent || course.courseContent.length === 0) {
            return res.status(400).json({ success: false, message: 'Add at least one chapter before publishing.' });
        }
        const hasLecture = course.courseContent.some(ch => ch.chapterContent && ch.chapterContent.length > 0);
        if (!hasLecture) {
            return res.status(400).json({ success: false, message: 'Add at least one lecture before publishing.' });
        }
        course.status = 'published';
        await course.save();
        res.json({ success: true, message: 'Course published!', course });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Fetch a single course by ID (for always up-to-date frontend sync)
export const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.query;
        if (!courseId) return res.status(400).json({ success: false, message: 'Missing courseId' });
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
        res.json({ success: true, course });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
