#!/bin/bash

# 🚀 Deploy LMS with Cloudinary Direct Upload Solution
echo "🚀 Deploying LMS with Direct Cloudinary Upload - No More 413 Errors!"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    exit 1
fi

echo "📦 Installing dependencies..."

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies  
echo "Installing client dependencies..."
cd client
npm install
cd ..

# Install admin dependencies
echo "Installing admin dependencies..."
cd admin
npm install
cd ..

echo ""
echo "🎯 SOLUTION IMPLEMENTED: Direct Cloudinary Upload"
echo "=================================="
echo ""
echo "✅ NEW FEATURES:"
echo "  - Direct upload to Cloudinary (no server proxy)"
echo "  - Support for 100MB+ videos (vs 8MB server limit)"
echo "  - New endpoint: /api/educator/add-lecture-cloudinary"
echo "  - Enhanced upload components with dual options"
echo "  - No more 413 payload errors!"
echo ""
echo "📋 FILES CREATED/MODIFIED:"
echo "  Server:"
echo "    - controllers/educatorController.js (new endpoint)"
echo "    - routes/educatorRoutes.js (new route)"
echo "  Client:"
echo "    - components/educator/CloudinaryVideoUpload.jsx (NEW)"
echo "    - pages/educator/MyCoursesWithCloudinary.jsx (EXAMPLE)"
echo "  Documentation:"
echo "    - CLOUDINARY_SETUP_GUIDE.md (SETUP GUIDE)"
echo ""
echo "🔧 NEXT STEPS:"
echo "1. Set up Cloudinary account (FREE):"
echo "   → Go to https://cloudinary.com/"
echo "   → Sign up and get your Cloud Name"
echo "   → Create an 'Unsigned' upload preset"
echo ""
echo "2. Configure your app:"
echo "   → Update CLOUDINARY_CLOUD_NAME in CloudinaryVideoUpload.jsx"
echo "   → Update CLOUDINARY_UPLOAD_PRESET in CloudinaryVideoUpload.jsx"
echo "   → OR use environment variables (recommended)"
echo ""
echo "3. Integration options:"
echo "   → Replace existing upload completely, OR"
echo "   → Use dual system (let users choose upload method)"
echo ""
echo "4. Deploy to production:"
echo "   cd server && vercel --prod"
echo "   cd client && vercel --prod"
echo "   cd admin && vercel --prod"
echo ""
echo "💡 BENEFITS:"
echo "  ✅ No 413 errors - direct upload bypasses server limits"
echo "  ✅ 12x larger files - 100MB vs 8MB"
echo "  ✅ Faster uploads - direct to CDN"
echo "  ✅ Better reliability - less server load"
echo "  ✅ Still FREE - uses Cloudinary free tier"
echo "  ✅ Same user experience - seamless integration"
echo ""
echo "📖 Read CLOUDINARY_SETUP_GUIDE.md for detailed setup instructions"
echo ""
echo "🎉 Ready to deploy! Your 413 errors are now solved! 🎉"
