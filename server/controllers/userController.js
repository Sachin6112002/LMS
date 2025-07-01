import Course from "../models/Course.js"
import { CourseProgress } from "../models/CourseProgress.js"
import { Purchase } from "../models/Purchase.js"
import User from "../models/User.js"
import stripe from "stripe"
import { v2 as cloudinary } from 'cloudinary';
import connectCloudinary from '../configs/cloudinary.js';
import streamifier from 'streamifier';

// Get User Data
export const getUserData = async (req, res) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
    }
    try {

        const userId = req.auth.userId

        const user = await User.findById(userId)

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        res.json({ 
            success: true, 
            user: {
                ...user.toObject(),
                role: user.publicMetadata.role
            }
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// Purchase Course 
export const purchaseCourse = async (req, res) => {

    try {

        const { courseId } = req.body
        const { origin } = req.headers


        const userId = req.auth.userId

        const courseData = await Course.findById(courseId)
        const userData = await User.findById(userId)

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data Not Found' })
        }

        // Prevent educator from enrolling in their own course
        if (courseData.educator && userData._id.toString() === courseData.educator.toString()) {
            return res.json({ success: false, message: 'Educators cannot enroll in their own course.' });
        }

        // Prevent duplicate pending purchases
        const existingPending = await Purchase.findOne({
            courseId: courseData._id,
            userId,
            status: 'pending'
        });
        if (existingPending) {
            return res.json({ success: false, message: 'A pending purchase already exists for this course. Please complete the payment or wait for it to finish processing.' });
        }

        // Calculate final price after discount
        // Ensure price and discount are numbers
        const basePrice = Number(courseData.price) || 0;
        const discount = Number(courseData.discount) || 0;
        const finalPrice = Math.max(Math.round(basePrice * (1 - discount / 100)), 0);
        console.log('[DEBUG] basePrice:', basePrice, 'discount:', discount, 'finalPrice:', finalPrice, 'courseId:', courseData._id);

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: finalPrice, // Use discounted price for payment and free/paid check
        }

        const newPurchase = await Purchase.create(purchaseData)

        // Handle free courses differently
        if (newPurchase.amount === 0) {
            // For free courses, complete enrollment immediately
            courseData.enrolledStudents = Array.isArray(courseData.enrolledStudents) ? courseData.enrolledStudents : [];
            if (!courseData.enrolledStudents.map(id => id.toString()).includes(userData._id.toString())) {
                courseData.enrolledStudents.push(userData._id);
                await courseData.save();
            }

            userData.enrolledCourses = Array.isArray(userData.enrolledCourses) ? userData.enrolledCourses : [];
            if (!userData.enrolledCourses.map(id => id.toString()).includes(courseData._id.toString())) {
                userData.enrolledCourses.push(courseData._id);
                await userData.save();
            }

            newPurchase.status = 'completed';
            await newPurchase.save();

            return res.json({ 
                success: true, 
                message: 'Free course enrolled successfully!',
                isFree: true
            });
        }

        // Stripe Gateway Initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        // Force currency to INR for Stripe
        const currency = 'inr';
        if (process.env.CURRENCY && process.env.CURRENCY.toLowerCase() !== 'inr') {
            console.warn('CURRENCY in .env is not INR. For rupees, set CURRENCY=INR');
        }

        // Creating line items for Stripe (amount in paise)
        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.title // Use new model's title field
                },
                unit_amount: Math.max(Math.floor(newPurchase.amount) * 100, 100) // Minimum ₹1 for Stripe
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })

        res.json({ success: true, session_url: session.url });


    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Users Enrolled Courses With Lecture Links
export const userEnrolledCourses = async (req, res) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
    }
    try {

        const userId = req.auth.userId

        const userData = await User.findById(userId)
            .populate({
                path: 'enrolledCourses',
                populate: { path: 'createdBy', select: 'name' }
            })

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User data not found' });
        }

        res.json({ success: true, enrolledCourses: userData.enrolledCourses || [] })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
    }
    try {

        const userId = req.auth.userId

        const { courseId, lectureId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })

        if (progressData) {

            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: 'Lecture Already Completed' })
            }

            progressData.lectureCompleted.push(lectureId)
            await progressData.save()

        } else {

            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })

        }

        res.json({ success: true, message: 'Progress Updated' })

    } catch (error) {
        console.error('Error in updateUserCourseProgress:', error);
        res.json({ success: false, message: error.message })
    }

}

// get User Course Progress
export const getUserCourseProgress = async (req, res) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
    }
    try {

        const userId = req.auth.userId

        const { courseId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })

        res.json({ success: true, progressData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Add User Ratings to Course
export const addUserRating = async (req, res) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
    }
    const userId = req.auth.userId;
    const { courseId, rating } = req.body;

    // Validate inputs
    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: 'InValid Details' });
    }

    try {
        // Find the course by ID
        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({ success: false, message: 'Course not found.' });
        }

        const user = await User.findById(userId);

        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'User has not purchased this course.' });
        }

        // Check is user already rated
        // Ensure courseRatings exists (for backwards compatibility with existing courses)
        if (!course.courseRatings) {
            course.courseRatings = [];
        }
        
        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);

        if (existingRatingIndex > -1) {
            // Update the existing rating
            course.courseRatings[existingRatingIndex].rating = rating;
        } else {
            // Add a new rating
            course.courseRatings.push({ userId, rating });
        }

        await course.save();

        return res.json({ success: true, message: 'Rating added' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Example registration logic (add this after creating a new user):
export const registerUser = async (req, res) => {
    try {
        // Check required fields
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Name and email are required.' });
        }

        // Connect to Cloudinary
        await connectCloudinary();

        let imageUrl = req.body.imageUrl;
        if (req.file) {
            // Upload image buffer to Cloudinary using stream
            const streamUpload = (buffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'lms_users', resource_type: 'image' },
                        (error, result) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(error);
                            }
                        }
                    );
                    streamifier.createReadStream(buffer).pipe(stream);
                });
            };
            const result = await streamUpload(req.file.buffer);
            imageUrl = result.secure_url;
        }
        if (!imageUrl) {
            return res.status(400).json({ success: false, message: 'Image is required.' });
        }

        // Create user (let MongoDB generate _id)
        const newUser = await User.create({
            name,
            email,
            imageUrl,
            // ...other fields as needed...
        });

        // Optionally assign admin to first user (uncomment if needed)
        // await assignAdminToFirstUser(newUser._id);

        // Re-fetch user to get updated role
        const updatedUser = await User.findById(newUser._id);
        res.status(201).json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Change user role to educator
export const becomeEducator = async (req, res) => {
    if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: userId missing' });
    }
    
    try {
        const userId = req.auth.userId;
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Check if user is already an educator
        if (user.publicMetadata.role === 'educator') {
            return res.json({ success: false, message: 'User is already an educator' });
        }
        
        // Update user role to educator
        user.publicMetadata.role = 'educator';
        await user.save();
        
        res.json({ 
            success: true, 
            message: 'Successfully became an educator!',
            user: {
                ...user.toObject(),
                role: user.publicMetadata.role
            }
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Manual purchase completion for debugging
export const completePendingPurchase = async (req, res) => {
    try {
        const { purchaseId } = req.body;
        const userId = req.auth.userId;

        if (!purchaseId) {
            return res.json({ success: false, message: 'Purchase ID is required' });
        }

        const purchaseData = await Purchase.findById(purchaseId);
        if (!purchaseData) {
            return res.json({ success: false, message: 'Purchase not found' });
        }

        // Verify the purchase belongs to the user
        if (purchaseData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized access to purchase' });
        }

        if (purchaseData.status === 'completed') {
            return res.json({ success: false, message: 'Purchase already completed' });
        }

        const userData = await User.findById(purchaseData.userId);
        const courseData = await Course.findById(purchaseData.courseId?.toString());

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'User or Course not found' });
        }

        // Prevent duplicate enrollments
        courseData.enrolledStudents = Array.isArray(courseData.enrolledStudents) ? courseData.enrolledStudents : [];
        if (!courseData.enrolledStudents.map(id => id.toString()).includes(userData._id.toString())) {
            courseData.enrolledStudents.push(userData._id);
            await courseData.save();
        }

        userData.enrolledCourses = Array.isArray(userData.enrolledCourses) ? userData.enrolledCourses : [];
        if (!userData.enrolledCourses.map(id => id.toString()).includes(courseData._id.toString())) {
            userData.enrolledCourses.push(courseData._id);
            await userData.save();
        }

        purchaseData.status = 'completed';
        await purchaseData.save();

        res.json({ 
            success: true, 
            message: 'Purchase completed successfully',
            courseTitle: courseData.title
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get user's pending purchases
export const getUserPendingPurchases = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const pendingPurchases = await Purchase.find({ 
            userId, 
            status: 'pending' 
        }).populate('courseId', 'title description thumbnail');

        res.json({ 
            success: true, 
            pendingPurchases: pendingPurchases || []
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};