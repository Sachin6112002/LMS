import { clerkClient } from "@clerk/express"

// Middleware ( Protect Educator Routes )
export const protectEducator = async (req,res,next) => {

    try {

        const userId = req.auth.userId
        
        const response = await clerkClient.users.getUser(userId)

        if (response.publicMetadata.role !== 'educator') {
            return res.json({success:false, message: 'Unauthorized Access'})
        }
        
        next ()

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

// Middleware to authorize admin users
export const authorizeAdmin = async (req, res, next) => {
    try {
        const userId = req.auth?.userId;
        const user = await clerkClient.users.getUser(userId);
        if (user.publicMetadata.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
        }
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};