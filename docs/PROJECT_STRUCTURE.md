# MoneyLens Project Structure

## Root Directory Organization

### Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `.env` - Environment variables

### Build & Deployment
- `netlify.toml` - Netlify deployment configuration
- `vercel.json` - Vercel deployment configuration
- `_redirects` - URL redirection rules
- `dist/` - Build output directory

### Documentation
- `README.md` - Main project documentation
- `DATABASE_SETUP.md` - Database setup instructions
- `POTS_SYSTEM_README.md` - Pots system documentation
- `NETLIFY_DEPLOYMENT_GUIDE.md` - Deployment guide
- `BUILD_COMPLETION_SUMMARY.md` - Build status summary

### Development Tools
- `scripts/` - Database migration and utility scripts
- `supabase/` - Supabase configuration and migrations
- `public/` - Static assets

## Source Code Structure (`src/`)

### Core Application
- `App.tsx` - Main application component
- `main.tsx` - Application entry point
- `index.css` - Global styles

### Features (Domain-Driven Organization)
- `features/dashboard/` - Dashboard-related components and pages
- `features/transactions/` - Transaction management
- `features/planning/` - Financial planning (budget, goals, pots)
- `features/analytics/` - Analytics and reporting
- `features/tools/` - Financial calculators and tools
- `features/auth/` - Authentication and user management
- `features/settings/` - Application settings

### Shared Components
- `shared/components/` - Reusable UI components
- `shared/hooks/` - Custom React hooks
- `shared/utils/` - Utility functions
- `shared/types/` - TypeScript type definitions

### Layout Components
- `layouts/` - Layout components (sidebar, header, navigation)

### Core Infrastructure
- `core/` - Core application logic and services
- `core/contexts/` - React contexts
- `core/services/` - Business logic services
- `core/integrations/` - External service integrations

## Benefits of This Structure

1. **Domain-Driven Design** - Components are organized by business domain
2. **Scalability** - Easy to add new features without cluttering existing folders
3. **Maintainability** - Related files are grouped together
4. **Reusability** - Shared components are clearly separated
5. **Clear Separation** - Business logic separated from UI components

## Migration Strategy

1. Move domain-specific components to feature folders
2. Extract shared components to shared folder
3. Reorganize pages to match feature structure
4. Update import paths throughout the application
5. Test functionality after reorganization
