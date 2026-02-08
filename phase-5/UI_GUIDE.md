# Complete Frontend UI Guide

**Project:** Todo Full-Stack Web Application
**Date:** 2026-01-17

---

## Overview

The frontend has 4 main pages:
1. **Landing Page** (/) - Auto-redirects based on authentication
2. **Signup Page** (/signup) - Create new account
3. **Login Page** (/login) - Sign in to existing account
4. **Dashboard** (/dashboard) - Protected area (requires authentication)

---

## Page 1: Landing Page (/)

**URL:** http://localhost:3000/

**Purpose:** Entry point that redirects users

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                         Todo App                            │
│                                                             │
│                       Redirecting...                        │
│                                                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Behavior:**
- If NOT logged in → Redirects to `/login`
- If logged in → Redirects to `/dashboard`

**File:** `frontend/app/page.tsx`

---

## Page 2: Signup Page (/signup)

**URL:** http://localhost:3000/signup

**Purpose:** New user registration

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      Create Account                         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Email                                                 │ │
│  │ ┌───────────────────────────────────────────────────┐ │ │
│  │ │ your-email@example.com                            │ │ │
│  │ └───────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Password                                              │ │
│  │ ┌───────────────────────────────────────────────────┐ │ │
│  │ │ ••••••••                                          │ │ │
│  │ └───────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Confirm Password                                      │ │
│  │ ┌───────────────────────────────────────────────────┐ │ │
│  │ │ ••••••••                                          │ │ │
│  │ └───────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│            ┌────────────────────────────────┐              │
│            │      Sign Up                   │              │
│            └────────────────────────────────┘              │
│                                                             │
│           Already have an account? Log in                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Email input field (validated)
- Password input field (minimum 8 characters)
- Confirm password field (must match)
- Sign Up button (primary blue)
- Link to Login page at bottom

**Validation:**
- ✓ Email must be valid format (user@example.com)
- ✓ Password must be at least 8 characters
- ✓ Confirm password must match password
- ✓ Shows error messages in red below fields

**File:** `frontend/app/(auth)/signup/page.tsx`

---

## Page 3: Login Page (/login)

**URL:** http://localhost:3000/login

**Purpose:** Existing user authentication

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      Welcome Back                           │
│                  Sign in to your account                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Email                                                 │ │
│  │ ┌───────────────────────────────────────────────────┐ │ │
│  │ │ your-email@example.com                            │ │ │
│  │ └───────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Password                                              │ │
│  │ ┌───────────────────────────────────────────────────┐ │ │
│  │ │ ••••••••                                          │ │ │
│  │ └───────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│            ┌────────────────────────────────┐              │
│            │      Sign In                   │              │
│            └────────────────────────────────┘              │
│                                                             │
│           Don't have an account? Sign up                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Email input field
- Password input field
- Sign In button (primary blue)
- Link to Signup page at bottom

**Validation:**
- ✓ Email must be valid format
- ✓ Password required
- ✓ Shows error if credentials are incorrect

**Success:**
- Stores JWT token in sessionStorage
- Redirects to `/dashboard`
- Shows success toast: "Welcome back!"

**File:** `frontend/app/(auth)/login/page.tsx`

---

## Page 4: Dashboard (/dashboard)

**URL:** http://localhost:3000/dashboard

**Purpose:** Main application area (protected, requires login)

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  Todo App              your-email@example.com  [Logout] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  My Todos                              [+ Add Todo]    │ │
│ │                                                         │ │
│ │  ┌─────────────────────────────────────────────────┐   │ │
│ │  │                                                 │   │ │
│ │  │              📋                                 │   │ │
│ │  │                                                 │   │ │
│ │  │     Welcome to your Todo Dashboard!            │   │ │
│ │  │                                                 │   │ │
│ │  │  Todo list functionality will be available     │   │ │
│ │  │         in the next phase.                     │   │ │
│ │  │                                                 │   │ │
│ │  │  For now, you can test the authentication      │   │ │
│ │  │         flow by logging out.                   │   │ │
│ │  │                                                 │   │ │
│ │  └─────────────────────────────────────────────────┘   │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Features:**

**Navigation Bar (Top):**
- App title: "Todo App"
- User email display (shows logged-in user)
- Logout button (gray/secondary style)

**Main Content:**
- Page title: "My Todos"
- Add Todo button (primary blue) - Coming in Phase 4
- Empty state with icon and welcome message

**Protection:**
- Only accessible when logged in
- If not logged in, redirects to `/login`
- If user clicks Logout:
  - Clears sessionStorage
  - Redirects to `/login`

**File:** `frontend/app/(protected)/dashboard/page.tsx`

---

## Complete User Journey

### Journey 1: New User Signup

```
Step 1: Visit http://localhost:3000
        ↓
Step 2: Redirected to /login
        ↓
Step 3: Click "Sign up" link
        ↓
Step 4: Fill out signup form:
        - Email: your-email@example.com
        - Password: YourPassword123
        - Confirm: YourPassword123
        ↓
Step 5: Click "Sign Up" button
        ↓
Step 6: Account created ✓
        JWT token stored in sessionStorage
        ↓
Step 7: Redirected to /dashboard
        Success toast: "Account created successfully!"
        ↓
Step 8: See dashboard with your email in navbar
```

### Journey 2: Existing User Login

```
Step 1: Visit http://localhost:3000/login
        ↓
Step 2: Fill out login form:
        - Email: your-email@example.com
        - Password: YourPassword123
        ↓
Step 3: Click "Sign In" button
        ↓
Step 4: Authenticated ✓
        JWT token stored in sessionStorage
        ↓
Step 5: Redirected to /dashboard
        Success toast: "Welcome back!"
        ↓
Step 6: See dashboard with your email in navbar
```

### Journey 3: Logout

```
Step 1: On /dashboard
        ↓
Step 2: Click "Logout" button in navbar
        ↓
Step 3: SessionStorage cleared
        ↓
Step 4: Redirected to /login
        ↓
Step 5: Must login again to access dashboard
```

---

## Color Scheme

**Primary Colors:**
- Primary Blue: `#2563eb` (buttons, links)
- Primary Blue Hover: `#1d4ed8`

**Text Colors:**
- Dark Gray: `#111827` (headings)
- Medium Gray: `#4b5563` (body text)
- Light Gray: `#6b7280` (secondary text)

**Background Colors:**
- White: `#ffffff` (cards, inputs)
- Light Gray: `#f9fafb` (page background)
- Border Gray: `#d1d5db` (borders)

**Status Colors:**
- Success Green: `#10b981` (success toasts)
- Error Red: `#ef4444` (error messages, error toasts)

---

## UI Components Used

### Button Component
**Variants:**
- `primary` - Blue background, white text (Sign Up, Sign In, Add Todo)
- `secondary` - Gray background, dark text (Logout)
- `danger` - Red background, white text (Delete actions)

**States:**
- Normal
- Hover (darker shade)
- Disabled (gray, reduced opacity)
- Loading (shows loading spinner)

### Input Component
**Features:**
- Label above input
- Placeholder text
- Error message below (red text)
- Focus state (blue ring)
- Disabled state (gray background)

**Types:**
- Text (email)
- Password (hidden characters)

### Toast Notifications
**Positions:** Top-right corner

**Types:**
- Success (green) - "Account created successfully!"
- Error (red) - "Invalid credentials"
- Info (blue) - General messages

**Duration:** 3-5 seconds

---

## Responsive Design

### Desktop (1024px+)
- Max width: 1280px (7xl container)
- Centered on page
- Full sidebar if added later

### Tablet (768px - 1023px)
- Max width: 768px
- Stacked layout
- Touch-friendly buttons

### Mobile (< 768px)
- Full width with padding
- Single column layout
- Larger touch targets
- Hamburger menu if added later

---

## Accessibility Features

- ✓ Semantic HTML
- ✓ ARIA labels where needed
- ✓ Keyboard navigation support
- ✓ Focus indicators
- ✓ Error messages announced
- ✓ Form labels properly associated
- ✓ Color contrast meets WCAG AA

---

## Testing the UI

### How to Test Locally

1. **Start Backend:**
   ```bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate
   uvicorn app.main:app --reload
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser:**
   - Navigate to http://localhost:3000
   - Open DevTools (F12)
   - Test the flows below

### Test Flow 1: Signup
1. Go to http://localhost:3000/signup
2. Enter email: `test@example.com`
3. Enter password: `TestPassword123`
4. Enter confirm password: `TestPassword123`
5. Click "Sign Up"
6. Should see dashboard with your email

### Test Flow 2: Logout and Login
1. On dashboard, click "Logout"
2. Should redirect to /login
3. Enter email: `test@example.com`
4. Enter password: `TestPassword123`
5. Click "Sign In"
6. Should see dashboard again

### Test Flow 3: Error Handling
1. Go to /login
2. Enter wrong email: `wrong@example.com`
3. Enter wrong password: `wrongpass`
4. Click "Sign In"
5. Should see error toast: "Invalid credentials"

---

## Browser DevTools Tips

### Check Authentication Token
1. Open DevTools (F12)
2. Go to "Application" tab
3. Expand "Session Storage"
4. Click on "http://localhost:3000"
5. You should see:
   - `auth_token` - JWT token
   - `user_data` - User object JSON

### Check Network Requests
1. Open DevTools (F12)
2. Go to "Network" tab
3. Login or signup
4. Look for:
   - POST /auth/register or /auth/login
   - Check request headers (should have Authorization)
   - Check response (should have access_token)

### Check Console for Errors
1. Open DevTools (F12)
2. Go to "Console" tab
3. Should have no red errors
4. May have the middleware deprecation warning (can ignore)

---

## Common Issues & Solutions

### Issue 1: "Session expired" toast appears
**Cause:** JWT token invalid or expired
**Solution:**
- Logout and login again
- Check backend is running on port 8000

### Issue 2: Cannot login with correct credentials
**Cause:** Backend not running or wrong URL
**Solution:**
- Check backend running: http://localhost:8000/docs
- Check .env.local has `NEXT_PUBLIC_API_URL=http://localhost:8000`

### Issue 3: Form validation errors
**Cause:** Invalid input format
**Solution:**
- Email must be valid format (user@domain.com)
- Password must be 8+ characters
- Confirm password must match

### Issue 4: Redirects not working
**Cause:** JavaScript disabled or React error
**Solution:**
- Check browser console for errors
- Refresh page
- Clear sessionStorage and try again

---

## Next Phase: Todo CRUD UI

**Coming in Phase 4:**

The dashboard will show:
- List of todos with checkboxes
- Create new todo form/modal
- Edit todo button on each card
- Delete todo button on each card
- Filter tabs (All, Active, Completed)
- Search bar
- Todo count

---

## File Locations

All UI files are in the `frontend/` directory:

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx        ← Login Page
│   │   └── signup/page.tsx       ← Signup Page
│   ├── (protected)/
│   │   └── dashboard/page.tsx    ← Dashboard Page
│   ├── page.tsx                  ← Landing Page
│   ├── layout.tsx                ← Root Layout
│   └── globals.css               ← Global Styles
├── components/
│   ├── ui/
│   │   ├── Button.tsx            ← Button Component
│   │   ├── Input.tsx             ← Input Component
│   │   └── Modal.tsx             ← Modal Component
│   └── auth/
│       └── AuthProvider.tsx      ← Auth Context
└── hooks/
    └── useAuth.ts                ← Auth Hook
```

---

**Last Updated:** 2026-01-17
**Status:** Complete and Ready for Testing
