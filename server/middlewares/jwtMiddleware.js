import jwt from 'jsonwebtoken';

// Middleware to decode JWT and set req.auth.userId
export const jwtMiddleware = (req, res, next) => {
    // Skip JWT processing for OPTIONS requests
    if (req.method === 'OPTIONS') {
        return next();
    }
    
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.auth = {};
        return next();
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key');
        req.auth = { userId: decoded.id || decoded.userId };
    } catch (err) {
        req.auth = {};
    }
    next();
};
