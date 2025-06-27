# 🚨 CORS Issue Fix - Deployment Guide

## Problem
CORS errors preventing frontend from communicating with backend:
```
Access to XMLHttpRequest at 'https://lms-backend-six-coral.vercel.app/api/user/pending-purchases' 
from origin 'https://lms-client-one-lemon.vercel.app' has been blocked by CORS policy
```

## ✅ Fixes Applied

### 1. Enhanced Server CORS Configuration (`server/server.js`)
- ✅ More permissive origin checking
- ✅ Additional allowed headers
- ✅ Better debugging logs
- ✅ Fallback CORS headers middleware

### 2. Updated Vercel Configuration (`server/vercel.json`)
- ✅ Added CORS headers at deployment level
- ✅ Configured for all routes

### 3. Improved Webhook CORS (`server/controllers/webhooks.js`)
- ✅ Multi-origin support
- ✅ Enhanced header configuration

## 🚀 Next Steps

### 1. Deploy Backend Changes
```bash
cd server
git add .
git commit -m "Fix CORS configuration for frontend communication"
git push
```

### 2. Test CORS Connection
After deployment, test the CORS endpoint:
```
https://lms-backend-six-coral.vercel.app/api/cors-test
```

### 3. Verify Frontend Communication
Check if these endpoints work from your frontend:
- `/api/user/pending-purchases`
- `/api/courses`
- `/api/user/data`

## 🔧 Debugging Tools

### 1. Check CORS Test Endpoint
Visit: `https://lms-backend-six-coral.vercel.app/api/cors-test`
Expected response:
```json
{
  "success": true,
  "message": "CORS is working!",
  "origin": "https://lms-client-one-lemon.vercel.app",
  "timestamp": "2025-06-27T..."
}
```

### 2. Check Browser Console
Look for CORS DEBUG logs in Vercel function logs:
- `CORS DEBUG: Origin check: https://lms-client-one-lemon.vercel.app`
- `CORS DEBUG: Allowing origin for debugging`

### 3. Verify Vercel Deployment
Ensure your backend is deployed to the correct URL:
- Backend: `https://lms-backend-six-coral.vercel.app`
- Frontend: `https://lms-client-one-lemon.vercel.app`

## 🛠️ If Still Not Working

### Option 1: Temporary All-Origins Fix
In `server.js`, temporarily use:
```javascript
app.use(cors({
  origin: "*", // Allow all origins temporarily
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Option 2: Check Environment Variables
Verify `FRONTEND_URL` is set correctly in Vercel environment variables:
```
FRONTEND_URL=https://lms-client-one-lemon.vercel.app
```

### Option 3: Manual Headers
Add manual CORS headers to specific routes:
```javascript
app.use('/api/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://lms-client-one-lemon.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});
```

## ✅ Success Indicators

You'll know it's fixed when:
- ✅ No CORS errors in browser console
- ✅ API requests complete successfully
- ✅ Frontend loads user data properly
- ✅ Course enrollment works
- ✅ Admin panel functions correctly

## 📋 Final Checklist

- [ ] Deploy backend with updated CORS config
- [ ] Test CORS endpoint responds correctly  
- [ ] Verify frontend can fetch pending purchases
- [ ] Check course listing loads properly
- [ ] Test user authentication works
- [ ] Confirm admin panel functionality

---

**Status**: Ready for deployment and testing
**ETA**: Should resolve CORS issues within 5-10 minutes of deployment
