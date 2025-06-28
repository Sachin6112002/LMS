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
        console.log('updateRoleToEducator: user after update', user);
        res.json({ success: true, message: 'You can publish a course now', user });
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
        const imageFile = req.file;
        const educatorId = req.auth.userId;
        // Debug log incoming fields and file
        console.log('addCourse fields:', req.body);
        console.log('addCourse file:', req.file);
        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail Not Attached' });
        }
        // Read course fields directly from req.body
        const courseData = {
            title: req.body.title,
            description: req.body.description,
            thumbnail: '', // will be set after upload
            createdBy: educatorId,
            status: 'draft',
            chapters: Array.isArray(req.body.chapters) ? req.body.chapters : []
        };
        const newCourse = await Course.create(courseData);
        // Upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload_stream({ resource_type: 'image' }, async (error, result) => {
            if (error) {
                console.log('Cloudinary upload error:', error);
                return res.json({ success: false, message: 'Image upload failed' });
            }
            newCourse.thumbnail = result.secure_url;
            await newCourse.save();
            res.json({ success: true, message: 'Course Added', course: newCourse });
        });
        imageUpload.end(imageFile.buffer);
    } catch (error) {
        console.log('addCourse error:', error);
        res.json({ success: false, message: error.message });
    }
}

// Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
    }
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ createdBy: educator });
        
        // Transform courses to match frontend expectations
        const transformedCourses = courses.map(course => ({
            ...course.toObject(),
            courseTitle: course.title, // Map title to courseTitle
            courseThumbnail: course.thumbnail, // Map thumbnail to courseThumbnail
            coursePrice: course.price, // Map price to coursePrice
            educator: course.createdBy // Add educator field for consistency
        }));
        
        res.json({ success: true, courses: transformedCourses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Educator Dashboard Data ( Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing or invalid token' });
    }
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ createdBy: educator });

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
            // Defensive: ensure course.enrolledStudents is always an array
            const enrolledStudentsArr = Array.isArray(course.enrolledStudents) ? course.enrolledStudents : [];
            // Defensive: ensure chapters and lectures are always arrays
            course.chapters = Array.isArray(course.chapters) ? course.chapters : [];
            course.chapters = course.chapters.map(chapter => ({
                ...chapter.toObject?.() || chapter,
                lectures: Array.isArray(chapter.lectures) ? chapter.lectures : []
            }));
            const students = await User.find({
                _id: { $in: enrolledStudentsArr }
            }, 'name imageUrl');

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.title,
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
        const courses = await Course.find({ createdBy: educator });

        // Get the list of course IDs
        const courseIds = courses.map(course => course._id);

        // Fetch purchases with user and course data
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'title'); // changed from 'courseTitle' to 'title'

        // enrolled students data
        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.title, // changed from purchase.courseId.courseTitle
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
        const { courseId, title } = req.body;
        if (!courseId || !title) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        const newChapter = {
            title,
            lectures: []
        };
        course.chapters.push(newChapter);
        await course.save();
        res.json({ success: true, chapter: newChapter, course });
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
        const { courseId, chapterIndex, title, duration, videoUrl, isPreviewFree } = req.body;
        if (courseId === undefined || chapterIndex === undefined || !title || !duration || !videoUrl) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
        if (!course.chapters[chapterIndex]) return res.status(404).json({ success: false, message: 'Chapter not found' });
        const newLecture = {
            title,
            duration,
            videoUrl,
            isPreviewFree: !!isPreviewFree
        };
        course.chapters[chapterIndex].lectures.push(newLecture);
        await course.save();
        res.json({ success: true, lecture: newLecture, course });
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
        // Debug log for educator and userId
        console.log('publishCourse: req.auth.userId', req.auth.userId, 'course.createdBy', course.createdBy);
        if (course.createdBy.toString() !== req.auth.userId.toString()) {
            return res.status(403).json({ success: false, message: 'Not your course' });
        }
        // Must have at least one chapter and one lecture
        if (!course.chapters || course.chapters.length === 0) {
            return res.status(400).json({ success: false, message: 'Add at least one chapter before publishing.' });
        }
        // Must have at least one chapter and one lecture
        const hasAnyLecture = course.chapters.some(ch => ch.lectures && ch.lectures.length > 0);
        if (!hasAnyLecture) {
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

// Get course data for editing
export const getCourseForEdit = async (req, res) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
    }
    
    try {
        const { courseId } = req.params;
        const educatorId = req.auth.userId;
        
        if (!courseId) {
            return res.status(400).json({ success: false, message: 'Course ID is required' });
        }
        
        const course = await Course.findById(courseId);
        
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        
        // Check if the educator owns this course
        if (course.educator?.toString() !== educatorId && course.createdBy?.toString() !== educatorId) {
            return res.status(403).json({ success: false, message: 'Unauthorized: You can only edit your own courses' });
        }
        
        // Transform course data to match frontend expectations
        const transformedCourse = {
            ...course.toObject(),
            courseTitle: course.title,
            courseThumbnail: course.thumbnail,
            coursePrice: course.price
        };
        
        res.json({ success: true, courseData: transformedCourse });
    } catch (error) {
        console.error('getCourseForEdit error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch course data' });
    }
};

// Edit course
export const editCourse = async (req, res) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
    }
    
    try {
        const { courseId } = req.params;
        const educatorId = req.auth.userId;
        const imageFile = req.file;
        
        if (!courseId) {
            return res.status(400).json({ success: false, message: 'Course ID is required' });
        }
        
        const course = await Course.findById(courseId);
        
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        
        // Check if the educator owns this course
        if (course.educator?.toString() !== educatorId && course.createdBy?.toString() !== educatorId) {
            return res.status(403).json({ success: false, message: 'Unauthorized: You can only edit your own courses' });
        }
        
        // Update course fields
        if (req.body.courseTitle) course.title = req.body.courseTitle;
        if (req.body.description) course.description = req.body.description;
        if (req.body.coursePrice !== undefined) course.price = req.body.coursePrice;
        if (req.body.discount !== undefined) course.discount = req.body.discount;
        if (req.body.category) course.category = req.body.category;
        if (req.body.status) course.status = req.body.status;
        
        // Update thumbnail if new image is provided
        if (imageFile) {
            try {
                // Upload new image to cloudinary
                const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                    resource_type: 'image'
                });
                course.thumbnail = imageUpload.secure_url;
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return res.status(500).json({ success: false, message: 'Failed to upload thumbnail' });
            }
        }
        
        const updatedCourse = await course.save();
        
        res.json({ 
            success: true, 
            message: 'Course updated successfully', 
            course: updatedCourse 
        });
    } catch (error) {
        console.error('editCourse error:', error);
        res.status(500).json({ success: false, message: 'Failed to update course' });
    }
};
