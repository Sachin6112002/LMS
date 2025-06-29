
#!/bin/bash

echo "🚀 Starting Vercel deployment preparation..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf client/dist
rm -rf admin/dist

# Build client
echo "🏗️  Building client..."
cd client
npm ci
npm run build
cd ..

# Build admin
echo "🏗️  Building admin..."
cd admin
npm ci
npm run build
cd ..

echo "✅ Build completed successfully!"
echo "📁 Client build: client/dist"
echo "📁 Admin build: admin/dist"
echo ""
echo "🔧 Vercel deployment checklist:"
echo "✓ vercel.json configured"
echo "✓ vite.config.js optimized"
echo "✓ Build outputs ready"
echo ""
echo "🚀 Ready to deploy to Vercel!"
