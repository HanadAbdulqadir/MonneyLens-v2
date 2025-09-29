#!/bin/bash

# Script to help set up GitHub Secrets for MoneyLens v2 deployment
# Run this script and follow the instructions

echo "🚀 MoneyLens v2 GitHub Secrets Setup"
echo "======================================"
echo ""

echo "📋 Required GitHub Secrets:"
echo "==========================="
echo "1. VITE_SUPABASE_URL: https://maourawciifennrsivps.supabase.co"
echo "2. VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hb3VyYXdjaWlmZW5ucnNpdnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDkyMzEsImV4cCI6MjA3NDAyNTIzMX0.vyHiZUKXPO7y3D9GHRU0HKiZQruJ5tsBEk4LCGmolgM"
echo "3. VERCEL_TOKEN: WF0jBj9F5KdIwaOoHOWIlbiY"
echo "4. VERCEL_ORG_ID: team_pyZ1S3rdyH5rkaxEfOpiPzSu"
echo "5. VERCEL_PROJECT_ID: prj_ghGmIe0ZAPTX74zs92kEeqx1MaAI"
echo "6. SURGE_TOKEN: 5b9bbd5fe75157b6822e97f547a4fdc8"
echo ""

echo "📝 Instructions:"
echo "================"
echo "1. Go to: https://github.com/HanadAbdulqadir/MonneyLens-v2/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Add each secret from the list above"
echo "4. For SURGE_TOKEN, run these commands in terminal:"
echo "   npm install -g surge"
echo "   surge login"
echo "   surge token"
echo "5. Copy the SURGE_TOKEN and add it as a GitHub secret"
echo ""

echo "✅ After adding all secrets:"
echo "============================"
echo "- GitHub Actions will automatically trigger"
echo "- Application will deploy to:"
echo "  • Vercel: https://monneylens-v2.vercel.app"
echo "  • Surge.sh: http://moneylens-app.surge.sh/"
echo "  • Netlify: https://monneylens-v2.netlify.app"
echo ""

echo "🔗 Useful Links:"
echo "================"
echo "- GitHub Actions: https://github.com/HanadAbdulqadir/MonneyLens-v2/actions"
echo "- Repository: https://github.com/HanadAbdulqadir/MonneyLens-v2"
echo ""

echo "🎉 Ready to deploy! Add the secrets and the deployment will start automatically."
