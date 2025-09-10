# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **Restaurant Management Desktop Application** built with React and packaged as an Electron app. The application provides comprehensive restaurant management features including menu management, table management, employee management, order processing, kitchen operations, and reporting.

## Technology Stack

- **Frontend**: React 18, Material-UI (MUI), React Router
- **State Management**: Zustand with persistence
- **Backend**: Supabase (authentication, database, storage)
- **Desktop App**: Electron
- **Charts & Analytics**: Chart.js, Recharts, MUI X Charts
- **UI Components**: Material-UI, Bootstrap
- **Testing**: Jest, React Testing Library

## Development Commands

### Web Development
```bash
# Start React development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run single test file
npm test -- --testNamePattern="ComponentName"

# Run tests in watch mode
npm test -- --watch
```

### Electron Development
```bash
# Run Electron app in development (with React dev server)
npm run electron-dev

# Build and run Electron app
npm run electron-build

# Build Electron distributables
npm run build-electron        # Current platform
npm run build-electron-win    # Windows only
npm run build-electron-all    # All platforms (Mac, Windows, Linux)
```

### Supabase Development
```bash
# Start local Supabase development environment
cd supabase && supabase start

# Stop local Supabase
cd supabase && supabase stop

# Reset local database
cd supabase && supabase db reset
```

## Architecture Overview

### State Management Architecture
The application uses **Zustand** for state management with a modular store architecture:

- `authStore.js` - Authentication, user sessions, onboarding flow
- `appstore.js` - Global app state, file uploads, breadcrumbs
- `restaurantStore.js` - Restaurant details and settings
- `menuStore.js` - Menu categories and management
- `menuItemsStore.js` - Individual menu items
- `tablesStore.js` - Table management and reservations
- `employeesStore.js` - Employee management
- `kitchenStore.js` - Kitchen orders and workflow
- `dashboardStore.js` - Dashboard data and analytics
- `reportStore.js` - Reporting and analytics data
- `profileStore.js` - User profile management

Each store follows the pattern:
```javascript
const useStore = create((set, get) => ({
  // State properties
  // Action methods that update state via set()
}))
```

### Authentication & Multi-tenancy
- Uses Supabase Auth with email/password authentication
- Multi-restaurant support with user memberships
- Role-based access control (Owner, Admin, Waiter, Chef, Bartender, Cashier)
- Onboarding flow for new restaurant setup with subscription management

### Database Architecture
- **Supabase PostgreSQL** backend
- Row Level Security (RLS) for multi-tenant data isolation
- Real-time subscriptions for live updates
- File storage for restaurant logos, menu images, and avatars

### Component Structure
- `/src/pages/` - Main application pages and routing
- `/src/components/` - Reusable UI components
- `/src/pages/auth/` - Authentication flow components
- `/src/pages/dashboards/` - Role-specific dashboard views
- `/src/pages/settingsTabs/` - Settings page modules

### Electron Integration
- Main process: `electron-main.js`
- Custom build scripts in `/scripts/` for packaging
- Multi-platform builds (Windows, macOS, Linux)
- Icon assets for different platforms in `/public/`

## Development Patterns

### Store Usage Pattern
```javascript
import useAuthStore from '../lib/authStore';

const Component = () => {
  const { user, signIn, signOut } = useAuthStore();
  // Component logic
};
```

### Error Handling
- Global error boundaries in `ErrorHandler.jsx`
- SweetAlert2 for user-friendly error messages
- Comprehensive validation in auth flows

### File Upload Pattern
```javascript
const { uploadFile } = useAppStore();
const publicUrl = await uploadFile(file, 'bucket-name');
```

## Key Features by Role

- **Owner/Admin**: Full restaurant management, reporting, employee management
- **Waiter**: Order taking, table management, customer service
- **Chef**: Kitchen orders, order status updates, inventory
- **Bartender**: Bar orders, drink preparation
- **Cashier**: Payment processing, order completion

## Environment Setup

1. Copy environment variables from `.env` (Supabase credentials are required)
2. Install dependencies: `npm install`
3. For local development with Supabase: Set up local Supabase instance
4. For Electron development: Ensure all required build tools are installed

## Testing Strategy

- Unit tests for store logic and utilities
- Integration tests for authentication flows
- Component testing with React Testing Library
- E2E testing for critical user journeys

## Build Process

The application supports both web and desktop builds:
- Web builds use standard React build process
- Electron builds use custom scripts to copy assets and create platform-specific distributables
- Build artifacts go to `/build/` for web, `/dist/` for Electron packages
