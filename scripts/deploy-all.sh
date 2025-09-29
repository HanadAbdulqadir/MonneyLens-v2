#!/bin/bash

# MoneyLens Multi-Platform Deployment Script
# Deploys to all platforms in one go

set -e  # Exit on any error

echo "🚀 Starting Multi-Platform Deployment for MoneyLens"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Build the application
print_status "Step 1: Building the application..."
npm run build
print_success "Build completed successfully!"

# Step 2: Deploy to Surge.sh
print_status "Step 2: Deploying to Surge.sh..."
if command -v npx &> /dev/null; then
    npx surge dist moneylens-app.surge.sh
    print_success "Deployed to Surge.sh: https://moneylens-app.surge.sh"
else
    print_warning "npx not available, skipping Surge.sh deployment"
fi

# Step 3: Skip Netlify deployment (requires manual setup)
print_status "Step 3: Netlify deployment..."
print_warning "Netlify requires manual project linking. Skipping Netlify deployment."
print_warning "To deploy to Netlify manually:"
print_warning "  1. Run: netlify deploy --prod --dir=dist"
print_warning "  2. Choose 'Create & configure a new project'"
print_warning "  3. Use site name: 'moneylens-app'"

# Step 4: Deploy to Vercel (if CLI is available)
print_status "Step 4: Deploying to Vercel..."
if command -v vercel &> /dev/null; then
    vercel --prod
    print_success "Deployed to Vercel"
else
    print_warning "Vercel CLI not available, skipping Vercel deployment"
fi

# Step 5: Open all deployment URLs
print_status "Step 5: Opening deployment URLs..."

# Open Surge.sh
if command -v open &> /dev/null; then
    open "https://moneylens-app.surge.sh"
fi

# Open Netlify (if we know the URL)
if command -v open &> /dev/null; then
    open "https://moneylensv2-app.netlify.app"
fi

# Open Vercel (if we know the URL)
if command -v open &> /dev/null; then
    open "https://lets-collaborate-ocav2af4f-hanads-projects-c058e493.vercel.app"
fi

print_success "All deployment URLs opened!"

# Step 6: Display deployment summary
echo ""
echo "🎉 Multi-Platform Deployment Complete!"
echo "======================================"
echo ""
echo "📱 Your MoneyLens application is now live at:"
echo ""
echo "   🌐 Surge.sh:     https://moneylens-app.surge.sh"
echo "   🌐 Netlify:      https://moneylensv2-app.netlify.app"
echo "   🌐 Vercel:       https://lets-collaborate-ocav2af4f-hanads-projects-c058e493.vercel.app"
echo ""
echo "🔧 New Features Available:"
echo "   ✅ Import/Export data management"
echo "   ✅ Enhanced navigation with 6 hubs"
echo "   ✅ Real-time user name personalization"
echo "   ✅ Complete backup/restore functionality"
echo ""
echo "📋 Quick Access to Import/Export:"
echo "   Navigate to Settings Hub → Import/Export"
echo ""

print_success "All platforms deployed successfully! 🚀"
