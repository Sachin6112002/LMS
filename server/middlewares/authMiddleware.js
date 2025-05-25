import User from '../models/User.js'

// Middleware ( Protect Educator Routes )
export const protectEducator = async (req,res,next) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const userId = req.auth.userId;
        const user = await User.findById(userId);
        if (!user || user.publicMetadata.role !== 'educator') {
            return res.json({success:false, message: 'Unauthorized Access'})
        }
        next()
    } catch (error) {
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
};