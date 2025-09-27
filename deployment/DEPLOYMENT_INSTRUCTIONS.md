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
