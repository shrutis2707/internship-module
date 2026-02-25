# Fix & Modernize Submission Portal

## Current Issues Identified

### Backend Issues
1. **Missing error handling middleware** - No global error handler in server.js
2. **No input validation** - Routes accept any data without sanitization
3. **Security concerns**:
   - JWT secret is weak/default
   - No rate limiting on auth endpoints
   - No helmet for security headers
   - CORS is wide open
4. **Missing features**:
   - No password strength validation
   - No email format validation
   - No file type validation beyond mimetype (can be spoofed)
   - Faculty cannot see their past reviews
   - No pagination on list endpoints
   - No way to get list of faculty for admin assignment

### Frontend Issues
1. **Outdated UI** - Basic Bootstrap, not modern
2. **Poor UX** - Admin has to copy-paste IDs manually
3. **No loading states** - Users don't know when data is loading
4. **No error boundaries** - Errors crash the UI
5. **Missing features**:
   - No search/filter on tables
   - No sorting
   - No confirmation dialogs
   - No toast notifications
   - No responsive mobile design

---

## Implementation Plan

### Phase 1: Backend Fixes & Enhancements

#### 1.1 Security & Validation
- Add `express-validator` for input validation
- Add `helmet` for security headers
- Add `express-rate-limit` for API protection
- Add `express-mongo-sanitize` to prevent NoSQL injection
- Update CORS to be more restrictive
- Add password strength requirements

#### 1.2 Error Handling
- Add global error handling middleware
- Create custom error classes
- Add async wrapper for controllers

#### 1.3 API Improvements
- Add `/api/admin/faculty` endpoint to list faculty for assignment dropdown
- Add `/api/faculty/reviews` endpoint to see faculty's review history
- Add pagination to list endpoints
- Add search/filter query parameters

#### 1.4 File Upload Security
- Add magic number validation for PDF files
- Add file size limits with proper error messages
- Store files with UUID names to prevent conflicts

### Phase 2: Modern React Frontend

#### 2.1 Project Setup
- Create React app with Vite
- Setup Tailwind CSS for modern styling
- Add shadcn/ui component library
- Setup React Router for navigation
- Add React Query for server state management
- Add Zustand for client state management

#### 2.2 Components Structure
```
src/
├── components/
│   ├── ui/           # shadcn components
│   ├── layout/       # Layout components
│   └── common/       # Shared components
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── StudentDashboard.jsx
│   ├── FacultyDashboard.jsx
│   └── AdminDashboard.jsx
├── hooks/            # Custom React hooks
├── lib/              # Utilities
├── store/            # Zustand stores
└── api/              # API functions
```

#### 2.3 Features
- Modern login/register with form validation
- Toast notifications for all actions
- Loading skeletons and spinners
- Data tables with sorting and filtering
- Modal dialogs for confirmations
- Responsive design for mobile/tablet/desktop
- Dark mode support

### Phase 3: Database & Models

#### 3.1 Model Enhancements
- Add indexes for frequently queried fields
- Add pre-save hooks for data normalization
- Add virtual fields where needed

---

## Files to Modify/Create

### Backend (Modify)
1. `server.js` - Add middleware, error handling
2. `package.json` - Add new dependencies
3. `routes/authRoutes.js` - Add validation
4. `routes/submissionRoutes.js` - Add validation, pagination
5. `routes/adminRoutes.js` - Add faculty list endpoint
6. `routes/facultyRoutes.js` - Add review history endpoint
7. `middleware/auth.js` - Enhance error messages

### Backend (Create)
1. `middleware/errorHandler.js` - Global error handler
2. `middleware/validate.js` - Validation middleware
3. `utils/ApiError.js` - Custom error class
4. `utils/catchAsync.js` - Async wrapper

### Frontend (Create New React App)
1. Complete new React application in `/frontend` folder
2. All pages with modern UI
3. API integration layer
4. State management

---

## Dependencies to Add

### Backend
```json
{
  "express-validator": "^7.x",
  "helmet": "^7.x",
  "express-rate-limit": "^7.x",
  "express-mongo-sanitize": "^2.x",
  "uuid": "^9.x"
}
```

### Frontend
- React 18 with Vite
- Tailwind CSS
- shadcn/ui components
- React Query (TanStack Query)
- Zustand
- React Router DOM
- Axios
- React Hook Form + Zod
- Sonner (toast notifications)
- Lucide React (icons)

---

## Migration Strategy
1. Keep existing backend running during development
2. Build new frontend separately
3. Test all endpoints with new frontend
4. Switch over when complete
5. Remove old `public/` folder HTML files
