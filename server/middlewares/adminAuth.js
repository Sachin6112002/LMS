import jwt from 'jsonwebtoken';

export const adminAuth = (req, res, next) => {
  // Skip authentication for OPTIONS requests
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized as admin' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
