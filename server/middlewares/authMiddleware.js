import User from '../models/User.js'

// Middleware ( Protect Educator Routes )
export const protectEducator = async (req,res,next) => {
    try {
        if (!req.auth || !req.auth.userId) {
            console.log('protectEducator: No userId in req.auth');
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const userId = req.auth.userId;
        const user = await User.findById(userId);
        console.log('protectEducator: userId', userId, 'user', user);
        if (!user) {
            console.log('protectEducator: User not found');
            return res.json({success:false, message: 'Unauthorized Access: User not found'})
        }
        if (user.publicMetadata.role !== 'educator') {
            console.log('protectEducator: User role is', user.publicMetadata.role);
            return res.json({success:false, message: 'Unauthorized Access: Not an educator'})
        }
        next()
    } catch (error) {
        console.log('protectEducator: Error', error);
        res.json({success:false, message: error.message})
    }
}

// Middleware to authenticate users
export const authenticate = async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Alias for backward compatibility
export const authMiddleware = authenticate;