# Quickstart Guide: Todo Application

**Feature**: 001-todo-app-mvp
**Date**: 2026-01-12
**Phase**: 1 (Design)

## Overview

This guide provides step-by-step instructions to set up and run the Todo Full-Stack Web Application locally for development and testing. Follow these instructions to get the application running on your machine within 15-20 minutes.

## Prerequisites

Before starting, ensure you have these tools installed:

- **Node.js**: v18+ (for Next.js frontend)
- **Python**: 3.11+ (for FastAPI backend)
- **PostgreSQL Client**: psql or equivalent (optional, for database inspection)
- **Git**: For cloning the repository
- **Code Editor**: VS Code, Cursor, or your preferred IDE

**Check versions**:
```bash
node --version  # Should be v18 or higher
python --version  # Should be 3.11 or higher
git --version
```

## Project Structure

```
todo-app/
├── backend/          # Python FastAPI backend
├── frontend/         # Next.js frontend
├── specs/            # Feature specifications and design docs
├── .env.example      # Environment variable templates
└── README.md         # Project documentation
```

## Setup Steps

### 1. Clone Repository

```bash
git clone <repository-url>
cd todo-app
```

### 2. Set Up Database (Neon PostgreSQL)

#### Option A: Use Neon Serverless PostgreSQL (Recommended)

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project named "todo-app"
4. Copy the connection string (format: `postgresql://user:pass@host/dbname`)
5. Save it for the next step

#### Option B: Use Local PostgreSQL

```bash
# Install PostgreSQL (if not installed)
# On macOS:
brew install postgresql

# On Ubuntu:
sudo apt-get install postgresql

# Start PostgreSQL service
pg_ctl -D /usr/local/var/postgres start

# Create database
createdb todoapp

# Connection string:
postgresql://localhost/todoapp
```

### 3. Set Up Backend

```bash
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Edit `backend/.env`**:
```bash
DATABASE_URL=postgresql://user:pass@host/dbname  # Your Neon connection string
BETTER_AUTH_SECRET=your-32-character-secret-here-change-this-in-production
CORS_ORIGINS=http://localhost:3000
```

**Generate a secure secret**:
```bash
# Generate 32-character random secret
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Initialize database tables**:
```bash
python -c "from app.database import init_db; init_db()"
```

**Run backend server**:
```bash
uvicorn app.main:app --reload --port 8000
```

**Verify backend is running**:
- Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser
- You should see the Swagger UI with API documentation

### 4. Set Up Frontend

Open a **new terminal** (keep backend running):

```bash
cd frontend

# Install Node dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local
```

**Edit `frontend/.env.local`**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
BETTER_AUTH_SECRET=your-32-character-secret-here-same-as-backend
```

**Important**: Use the SAME `BETTER_AUTH_SECRET` as in backend `.env` file!

**Run frontend development server**:
```bash
npm run dev
```

**Verify frontend is running**:
- Open [http://localhost:3000](http://localhost:3000) in your browser
- You should see the Todo application landing page

### 5. Test the Application

#### Sign Up

1. Navigate to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Click "Sign Up"
5. You should be redirected to the task dashboard

#### Create a Task

1. Click "Add Task" button
2. Enter title: "My first task"
3. Enter description (optional): "Testing the application"
4. Click "Create"
5. Task should appear in the list

#### Complete a Task

1. Click the checkbox next to your task
2. Task should show as completed (strikethrough or checkmark)

#### Edit a Task

1. Click "Edit" button on your task
2. Modify the title or description
3. Click "Save"
4. Changes should be reflected immediately

#### Delete a Task

1. Click "Delete" button on your task
2. Confirm deletion
3. Task should be removed from the list

#### Sign Out and Sign In

1. Click "Sign Out" button
2. You should be redirected to the sign-in page
3. Sign in with the same credentials
4. Your tasks should still be there (persistent storage)

## Development Workflow

### Running Both Servers

Use two terminal windows:

**Terminal 1 - Backend**:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

### Making Code Changes

**Backend Changes**:
- Edit Python files in `backend/app/`
- FastAPI automatically reloads on file changes (due to `--reload` flag)
- Check terminal for any errors

**Frontend Changes**:
- Edit TypeScript/React files in `frontend/`
- Next.js automatically hot-reloads
- Changes appear immediately in browser

### Database Changes

**View database contents** (using psql):
```bash
# Connect to database
psql <your-database-url>

# List all users
SELECT * FROM users;

# List all tasks
SELECT * FROM tasks;

# Exit
\q
```

**Reset database** (delete all data):
```python
# In Python shell
from app.database import engine
from app.models import User, Task
from sqlmodel import SQLModel

SQLModel.metadata.drop_all(engine)  # Drop all tables
SQLModel.metadata.create_all(engine)  # Recreate tables
```

## Troubleshooting

### Backend Issues

**Error: "ModuleNotFoundError: No module named 'fastapi'"**
- Solution: Activate virtual environment and reinstall dependencies
  ```bash
  source venv/bin/activate
  pip install -r requirements.txt
  ```

**Error: "Database connection failed"**
- Solution: Check `DATABASE_URL` in `.env` file
- Verify Neon database is running
- Test connection: `psql <database-url>`

**Error: "BETTER_AUTH_SECRET not set"**
- Solution: Add `BETTER_AUTH_SECRET` to `backend/.env` file
- Generate a new secret if needed

**Error: "CORS policy error"**
- Solution: Check `CORS_ORIGINS` in `backend/.env` includes frontend URL (`http://localhost:3000`)

### Frontend Issues

**Error: "Failed to fetch"**
- Solution: Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

**Error: "Invalid token" or "Unauthorized"**
- Solution: Ensure `BETTER_AUTH_SECRET` is identical in both frontend and backend `.env` files
- Sign out and sign in again to get a new token

**Error: "npm install fails"**
- Solution: Delete `node_modules` and `package-lock.json`, then run `npm install` again
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Database Issues

**Tables don't exist**
- Solution: Run database initialization:
  ```python
  python -c "from app.database import init_db; init_db()"
  ```

**Connection pool exhausted**
- Solution: Restart backend server
- Check `pool_size` and `max_overflow` in `backend/app/database.py`

## API Documentation

**Swagger UI** (interactive):
- [http://localhost:8000/docs](http://localhost:8000/docs)

**ReDoc** (readable):
- [http://localhost:8000/redoc](http://localhost:8000/redoc)

**OpenAPI JSON**:
- [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

## Testing Endpoints with curl

**Sign up**:
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"curl@example.com","password":"password123"}'
```

**Sign in**:
```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"curl@example.com","password":"password123"}'
```

**Create task** (replace TOKEN with JWT from sign in response):
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task from curl"}'
```

**List tasks**:
```bash
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer TOKEN"
```

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `BETTER_AUTH_SECRET` | Yes | JWT signing secret (32+ chars) | `abc123...xyz789` |
| `CORS_ORIGINS` | Yes | Allowed frontend URLs | `http://localhost:3000` |

### Frontend (.env.local)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL | `http://localhost:8000/api` |
| `BETTER_AUTH_SECRET` | Yes | JWT signing secret (must match backend) | `abc123...xyz789` |

## Next Steps

After completing the quickstart:

1. **Read the Spec**: Review `specs/001-todo-app-mvp/spec.md` to understand all functional requirements
2. **Review API Contracts**: Check `specs/001-todo-app-mvp/contracts/openapi.yaml` for API details
3. **Explore Data Model**: See `specs/001-todo-app-mvp/data-model.md` for database schema
4. **Run Tests** (if implemented): `pytest` for backend, `npm test` for frontend
5. **Deploy**: Follow deployment guides for Vercel (frontend), Railway/Render (backend)

## Getting Help

- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Specification**: `specs/001-todo-app-mvp/spec.md`
- **Data Model**: `specs/001-todo-app-mvp/data-model.md`
- **API Contracts**: `specs/001-todo-app-mvp/contracts/`
- **Research Decisions**: `specs/001-todo-app-mvp/research.md`

## Quick Reference

**Start Development**:
```bash
# Terminal 1 - Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend && npm run dev
```

**URLs**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- API Docs: http://localhost:8000/docs

**Common Commands**:
```bash
# Backend
pip install <package>              # Install Python package
pip freeze > requirements.txt      # Update dependencies
python -m pytest                   # Run tests

# Frontend
npm install <package>              # Install Node package
npm run build                      # Build for production
npm run lint                       # Check code quality
```

---

**Status**: Quickstart guide complete. Ready to update agent context (Phase 1 continuation).
