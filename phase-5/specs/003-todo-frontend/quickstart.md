# Quickstart Guide: Frontend Application Setup

**Feature**: 003-todo-frontend
**Date**: 2026-01-17
**Prerequisites**: Backend (Spec-2) must be running on `http://localhost:8000`

## Overview

This guide provides step-by-step instructions for setting up and running the Next.js frontend application that integrates with the existing FastAPI backend.

---

## Prerequisites

### Required Software

- **Node.js**: 18.x or higher (LTS recommended)
- **npm** or **pnpm**: Latest version
- **Git**: For version control
- **Code Editor**: VS Code recommended with TypeScript support

### Backend Requirements

The FastAPI backend from Spec-2 must be running:

```bash
# Verify backend is running
curl http://localhost:8000/docs
# Should return Swagger UI documentation
```

If backend is not running, start it first:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run_server.py
```

---

## Step 1: Create Next.js Project

### Initialize Project

```bash
# Navigate to project root
cd C:\Users\HP\Desktop\todo-app

# Create Next.js app with TypeScript and App Router
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# Answer prompts:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes
# - App Router: Yes
# - Customize default import alias: No (use @/*)
```

### Navigate to Frontend Directory

```bash
cd frontend
```

---

## Step 2: Install Dependencies

### Core Dependencies

```bash
npm install axios better-auth react-hook-form @hookform/resolvers zod
```

**Package Explanations**:
- `axios`: HTTP client for API requests
- `better-auth`: Authentication library for JWT handling
- `react-hook-form`: Form state management
- `@hookform/resolvers`: Zod integration for React Hook Form
- `zod`: TypeScript-first schema validation

### UI Dependencies (Optional)

```bash
npm install react-hot-toast
```

**Package Explanation**:
- `react-hot-toast`: Toast notifications for user feedback

### Development Dependencies

```bash
npm install -D @types/node @types/react @types/react-dom typescript
```

---

## Step 3: Environment Configuration

### Create Environment Files

```bash
# Create .env.local for local development
touch .env.local

# Create .env.example as template
touch .env.example
```

### Configure .env.local

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-secret-key-here-must-match-backend
```

**Important**: The `BETTER_AUTH_SECRET` must be **identical** to the backend's JWT secret.

### Configure .env.example

```bash
# .env.example (for version control)
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=<your-secret-key>
```

---

## Step 4: Project Structure Setup

### Create Directory Structure

```bash
# Create directories
mkdir -p app/\(auth\)/signup
mkdir -p app/\(auth\)/login
mkdir -p app/\(protected\)/dashboard
mkdir -p components/ui
mkdir -p components/auth
mkdir -p components/todos
mkdir -p lib/api
mkdir -p lib/auth
mkdir -p lib/utils
mkdir -p types
mkdir -p hooks
```

**Note**: On Windows, use quotes for special characters:

```bash
mkdir "app/(auth)/signup"
mkdir "app/(auth)/login"
mkdir "app/(protected)/dashboard"
```

---

## Step 5: Configure TypeScript

### Update tsconfig.json

Ensure your `tsconfig.json` has these settings:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Step 6: Configure Tailwind CSS

### Update tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
```

### Update globals.css

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition;
  }

  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500;
  }
}
```

---

## Step 7: Verify Backend Connection

### Test API Connectivity

Create a test file to verify backend is accessible:

```bash
# Create test script
touch test-backend.js
```

```javascript
// test-backend.js
const axios = require('axios');

async function testBackend() {
  try {
    const response = await axios.get('http://localhost:8000/docs');
    console.log('✅ Backend is running!');
    console.log('Status:', response.status);
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.error('Make sure the FastAPI backend is running on http://localhost:8000');
  }
}

testBackend();
```

```bash
# Run test
node test-backend.js
```

**Expected Output**:
```
✅ Backend is running!
Status: 200
```

---

## Step 8: Run Development Server

### Start Next.js Dev Server

```bash
npm run dev
```

**Expected Output**:
```
 ▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Ready in 1.2s
```

### Verify Application

1. Open browser: `http://localhost:3000`
2. You should see the Next.js default page
3. No console errors

---

## Step 9: Verify Environment Variables

### Check Environment Loading

Create a test page to verify env vars:

```typescript
// app/test-env/page.tsx
export default function TestEnvPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables</h1>
      <ul>
        <li>API URL: {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</li>
        <li>Auth Secret: {process.env.BETTER_AUTH_SECRET ? 'SET' : 'NOT SET'}</li>
      </ul>
    </div>
  );
}
```

Visit `http://localhost:3000/test-env` and verify:
- API URL shows `http://localhost:8000`
- Auth Secret shows `SET` (value is hidden for security)

---

## Step 10: Implementation Checklist

Before starting implementation, ensure:

### Backend Verification
- [ ] Backend is running on `http://localhost:8000`
- [ ] Swagger docs accessible at `http://localhost:8000/docs`
- [ ] Can create user via `POST /auth/register`
- [ ] Can login via `POST /auth/login`
- [ ] JWT secret matches between frontend and backend

### Frontend Verification
- [ ] Node.js 18+ installed
- [ ] Next.js project created
- [ ] All dependencies installed
- [ ] .env.local configured with correct values
- [ ] Directory structure created
- [ ] Tailwind CSS configured
- [ ] Dev server runs without errors
- [ ] No TypeScript errors

### Network Verification
- [ ] Backend accessible from frontend (no CORS errors)
- [ ] Can make API requests from browser console
- [ ] Environment variables loading correctly

---

## Common Issues & Troubleshooting

### Issue: CORS Errors

**Symptom**: Browser console shows "CORS policy" errors

**Solution**: Verify backend CORS configuration in `backend/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Must include frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Environment Variables Not Loading

**Symptom**: `process.env.NEXT_PUBLIC_API_URL` is undefined

**Solutions**:
1. Ensure `.env.local` exists in frontend root directory
2. Restart Next.js dev server after creating/editing `.env.local`
3. Verify variable name starts with `NEXT_PUBLIC_` for client-side access

### Issue: Backend Connection Refused

**Symptom**: "ECONNREFUSED" or "Network Error"

**Solutions**:
1. Verify backend is running: `curl http://localhost:8000`
2. Check backend port (should be 8000)
3. Ensure no firewall blocking port 8000

### Issue: TypeScript Errors

**Symptom**: Red squiggles or build errors

**Solutions**:
1. Run `npm install` to ensure all dependencies installed
2. Restart VS Code TypeScript server: Cmd/Ctrl + Shift + P → "Restart TS Server"
3. Check `tsconfig.json` paths configuration

---

## Next Steps

Once setup is complete, proceed to implementation:

1. **Review Spec**: Read `spec.md` for feature requirements
2. **Review Research**: Read `research.md` for technical decisions
3. **Review Data Model**: Read `data-model.md` for TypeScript types
4. **Review API Contract**: Read `contracts/api-contract.md` for API details
5. **Start Implementation**: Run `/speckit.tasks` to generate implementation tasks

---

## Quick Commands Reference

```bash
# Start backend
cd backend && python run_server.py

# Start frontend
cd frontend && npm run dev

# Install new package
npm install <package-name>

# Run TypeScript type checking
npm run type-check  # (if script configured)

# Build for production
npm run build

# Run production build
npm run start
```

---

## Environment Variables Summary

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:8000` | Backend API base URL |
| `BETTER_AUTH_SECRET` | Yes | None | JWT signing secret (must match backend) |

**Security Note**: Never commit `.env.local` to version control. Only commit `.env.example` as a template.

---

**Status**: ✅ COMPLETE
**Date**: 2026-01-17
**Ready for**: Implementation (`/speckit.tasks`)
