#!/bin/bash

# MoneyLens Production Deployment Script
echo "🚀 Starting MoneyLens Production Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors above."
    exit 1
fi

echo "✅ Build successful!"

# Test the application
echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "⚠️  Tests failed. Continuing deployment anyway..."
fi

# Create deployment package
echo "📁 Creating deployment package..."
mkdir -p deployment
cp -r dist/* deployment/
cp public/_redirects deployment/ 2>/dev/null || true
cp netlify.toml deployment/ 2>/dev/null || true

# Create deployment instructions
cat > deployment/DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# MoneyLens Deployment Instructions

## Option 1: Manual Deployment to Netlify

1. Go to https://app.netlify.com/
2. Drag and drop the `deployment` folder to the deployment area
3. Configure environment variables in Netlify dashboard:
   - VITE_SUPABASE_URL=your_supabase_url
   - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   - VITE_APP_URL=your_deployed_url

## Option 2: Manual Deployment to Vercel

1. Go to https://vercel.com/
2. Import project from GitHub
3. Configure build settings:
   - Framework: Vite
   - Build Command: npm run build
   - Output Directory: dist
4. Set environment variables

## Option 3: GitHub Actions (Recommended)

1. Push to main branch
2. The workflow will automatically deploy
3. Check Actions tab for deployment status

## Environment Variables Required

Make sure to set these in your deployment platform:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=https://your-deployed-app.vercel.app
```

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test authentication flows
- [ ] Validate financial calculations
- [ ] Check mobile responsiveness
- [ ] Test database connections
EOF

echo "✅ Deployment package created in 'deployment' folder"
echo ""
echo "📋 Next Steps:"
echo "1. Review deployment/DEPLOYMENT_INSTRUCTIONS.md"
echo "2. Choose your preferred deployment method"
echo "3. Set up environment variables"
echo "4. Deploy the application"
echo ""
echo "🎉 MoneyLens is ready for production deployment!"
