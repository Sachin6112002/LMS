#!/bin/bash

# Quick script to deploy with Cloudinary configuration
echo "🚀 Deploying LMS with Cloudinary Environment Variables"

echo "📋 Required Environment Variables for Vercel:"
echo "REACT_APP_CLOUDINARY_CLOUD_NAME=denhmcs4e"
echo "REACT_APP_CLOUDINARY_UPLOAD_PRESET=ml_default"
echo ""
echo "🔧 Add these to your Vercel dashboard:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Select your client project"
echo "3. Go to Settings → Environment Variables"
echo "4. Add both variables above"
echo "5. Redeploy"
echo ""
echo "✅ After adding env vars, your 413 errors will be solved!"
echo "📈 Now supports 100MB video uploads (vs 8MB before)"
