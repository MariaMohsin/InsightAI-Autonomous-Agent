# Implementation Plan: Todo RESTful API MVP

**Branch**: `002-todo-app-restful-mvp` | **Date**: 2026-01-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-todo-app-restful-mvp/spec.md`

## Summary

Build a production-ready Todo application with RESTful backend API and modern frontend UI following spec-driven development. The system uses SQLite for local development (PostgreSQL-ready for production), SQLAlchemy ORM for data persistence, and JWT authentication for secure user sessions. Clean separation between backend API and frontend UI enables independent development and deployment. Target audience includes junior/mid-level developers learning full-stack patterns and hackathon judges evaluating code quality.

## Technical Context

**Language/Version**:
- Backend: Python 3.9+ with type hints
- Frontend: JavaScript/TypeScript with React 18+ or Next.js 13+

**Primary Dependencies**:
- Backend: FastAPI 0.100+, SQLAlchemy 2.0+, PyJWT 2.8+, passlib[bcrypt], python-jose
- Frontend: React 18+ or Next.js 13+, TypeScript (optional but recommended)
- Database: SQLite 3.x (local), PostgreSQL 14+ (production)

**Storage**:
- Development: SQLite file-based database
- Production: PostgreSQL with connection pooling

**Testing**:
- Backend: pytest with httpx (for FastAPI testing)
- Frontend: Jest and React Testing Library (optional)

**Target Platform**:
- Backend: Python ASGI server (Uvicorn)
- Frontend: Modern browsers (Chrome, Firefox, Safari, Edge)
- Deployment: Docker-ready, can deploy to Heroku/Railway/Render (backend), Vercel/Netlify (frontend)

**Project Type**: Web application with separate backend and frontend

**Performance Goals**:
- API response time: < 500ms p95
- Page load: < 2 seconds for authenticated pages
- Todo operations: < 1 second feedback to user

**Constraints**:
- SQLite for development (easy setup, no external database required)
- PostgreSQL-compatible SQL (to enable production migration)
- JWT secret must be secured via environment variables
- User isolation enforced at database query level

**Scale/Scope**:
- Expected users: 10-100 (hackathon evaluators, demo users)
- Expected todos per user: 0-1000
- Concurrent users: 1-10
- Data retention: No automatic cleanup (manual deletion only)

---

## Phase 0: Research & Discovery

### Technology Research

**Backend Framework - FastAPI**:
- Modern async Python web framework
- Automatic OpenAPI documentation
- Built-in request validation with Pydantic
- Native async/await support
- Excellent performance comparable to Node.js and Go

**ORM Choice - SQLAlchemy**:
- Standard Python ORM, mature and battle-tested
- Supports both SQLite and PostgreSQL with same code
- Version 2.0+ has improved async support
- Declarative models with type hints
- Migration support via Alembic (optional for MVP)

**Authentication - JWT**:
- Stateless authentication (no server-side sessions)
- Token includes user ID and expiration
- HS256 signing algorithm (symmetric key)
- Access tokens only (no refresh tokens in MVP)

**Frontend Options**:
- **Option A**: React with Create React App or Vite
  - Pros: Flexible, widely known, lighter weight
  - Cons: Manual routing, state management decisions
- **Option B**: Next.js (App Router or Pages Router)
  - Pros: Built-in routing, SSR/SSG options, production-ready
  - Cons: Slightly heavier, more opinionated
- **Decision**: Defer to implementation phase, both are valid choices

**Database Migration Strategy**:
- MVP: Use SQLAlchemy's `create_all()` for automatic table creation
- Production: Add Alembic migrations for schema versioning
- SQLite → PostgreSQL migration: Change connection string only (SQL compatible)

### Architecture Decisions

**Backend Structure**:
```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization, CORS setup
│   ├── config.py            # Environment variables (pydantic BaseSettings)
│   ├── database.py          # SQLAlchemy engine and session management
│   ├── models.py            # User and Todo ORM models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── auth/
│   │   ├── utils.py         # Password hashing (bcrypt), JWT creation/validation
│   │   └── dependencies.py  # get_current_user FastAPI dependency
│   └── routers/
│       ├── auth.py          # POST /auth/register, POST /auth/login
│       └── todos.py         # CRUD endpoints for /todos/*
├── requirements.txt         # Python dependencies
├── .env.example             # Template for environment variables
├── .env                     # Actual secrets (in .gitignore)
└── README.md                # Setup instructions
```

**Frontend Structure** (if Next.js):
```
frontend/
├── app/                     # Next.js App Router
│   ├── layout.tsx           # Root layout with auth provider
│   ├── page.tsx             # Landing page (redirect logic)
│   ├── register/
│   │   └── page.tsx         # Registration form
│   ├── login/
│   │   └── page.tsx         # Login form
│   └── todos/
│       └── page.tsx         # Todo dashboard
├── components/
│   ├── TodoList.tsx         # List of todos
│   ├── TodoItem.tsx         # Single todo item with actions
│   └── TodoForm.tsx         # Create/edit todo form
├── lib/
│   ├── api.ts               # Axios or fetch wrapper with JWT handling
│   └── auth.ts              # Auth utilities (login, logout, getToken)
├── types/
│   └── index.ts             # TypeScript interfaces
├── .env.local.example
└── package.json
```

**API Design Principles**:
- RESTful endpoints with proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Consistent error response format: `{ "detail": "error message" }`
- HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found)
- Authorization header: `Authorization: Bearer <jwt-token>`
- JSON request/response bodies

**Authentication Flow**:
1. User registers: `POST /auth/register` → returns JWT token
2. User logs in: `POST /auth/login` → returns JWT token
3. Frontend stores token (localStorage or memory)
4. Frontend includes token in `Authorization` header for protected requests
5. Backend validates token via `get_current_user` dependency
6. Backend extracts user ID from token, filters data by user

**Error Handling Strategy**:
- Backend: FastAPI exception handlers for 400, 401, 403, 404, 500
- Frontend: Try/catch blocks, display user-friendly error messages
- Never expose stack traces or sensitive info to users
- Log errors server-side for debugging

---

## Phase 1: Project Setup

**Goal**: Initialize project structure, install dependencies, configure environment

**Duration Estimate**: 1-2 hours

### Backend Setup

1. **Create project structure**:
   ```bash
   mkdir -p backend/app/auth backend/app/routers
   cd backend
   ```

2. **Initialize Python environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Create requirements.txt**:
   ```
   fastapi==0.109.0
   uvicorn[standard]==0.27.0
   sqlalchemy==2.0.25
   pyjwt==2.8.0
   passlib[bcrypt]==1.7.4
   python-jose[cryptography]==3.3.0
   python-dotenv==1.0.0
   pydantic==2.5.3
   pydantic-settings==2.1.0
   ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Create .env.example**:
   ```
   DATABASE_URL=sqlite:///./todos.db
   JWT_SECRET_KEY=your-secret-key-here-change-in-production
   JWT_ALGORITHM=HS256
   JWT_EXPIRATION_HOURS=24
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

6. **Create .env** (copy from .env.example and update):
   ```bash
   cp .env.example .env
   # Generate secure secret: openssl rand -hex 32
   ```

7. **Create .gitignore**:
   ```
   venv/
   __pycache__/
   *.pyc
   .env
   *.db
   *.db-journal
   ```

8. **Create backend/README.md** with setup instructions

### Frontend Setup

1. **Choose framework** (React or Next.js):

   **Option A - Next.js**:
   ```bash
   npx create-next-app@latest frontend --typescript
   cd frontend
   ```

   **Option B - React with Vite**:
   ```bash
   npm create vite@latest frontend -- --template react-ts
   cd frontend
   npm install
   ```

2. **Install additional dependencies**:
   ```bash
   npm install axios
   # or: npm install (if using fetch API, no additional deps needed)
   ```

3. **Create .env.local.example**:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   # or for Vite: VITE_API_URL=http://localhost:8000
   ```

4. **Create .env.local** (copy from example)

5. **Create .gitignore** (usually auto-generated):
   ```
   node_modules/
   .next/
   dist/
   .env.local
   ```

6. **Create frontend/README.md** with setup instructions

### Validation

- [ ] Backend virtual environment activates successfully
- [ ] `pip list` shows all required packages installed
- [ ] Frontend dependencies install without errors
- [ ] Both .env files exist and contain required variables
- [ ] .gitignore files prevent committing secrets

---

## Phase 2: Backend Core

**Goal**: Set up FastAPI app, database connection, and ORM models

**Duration Estimate**: 2-3 hours

### Step 1: FastAPI Application (app/main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth, todos

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Todo API",
    description="RESTful API for Todo application",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(todos.router, prefix="/todos", tags=["Todos"])

@app.get("/")
def root():
    return {"message": "Todo API is running", "docs": "/docs"}
```

### Step 2: Configuration (app/config.py)

```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()
```

### Step 3: Database Connection (app/database.py)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Create SQLAlchemy engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency for route handlers
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Step 4: Database Models (app/models.py)

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    todos = relationship("Todo", back_populates="owner", cascade="all, delete-orphan")

class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    owner = relationship("User", back_populates="todos")
```

### Step 5: Pydantic Schemas (app/schemas.py)

```python
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Todo schemas
class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)

class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_completed: Optional[bool] = None

class TodoResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

### Validation

- [ ] FastAPI app starts: `uvicorn app.main:app --reload`
- [ ] OpenAPI docs accessible at `http://localhost:8000/docs`
- [ ] Database file `todos.db` created in backend directory
- [ ] Database tables `users` and `todos` exist
- [ ] CORS headers present in responses

---

## Phase 3: Authentication

**Goal**: Implement user registration, login, and JWT authentication

**Duration Estimate**: 3-4 hours

### Step 1: Auth Utilities (app/auth/utils.py)

```python
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
```

### Step 2: Auth Dependencies (app/auth/dependencies.py)

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.auth.utils import decode_token

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user
```

### Step 3: Auth Router (app/routers/auth.py)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, AuthResponse, UserResponse
from app.auth.utils import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = User(email=user_data.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate JWT token
    access_token = create_access_token({"sub": str(new_user.id)})

    return AuthResponse(
        access_token=access_token,
        user=UserResponse.from_orm(new_user)
    )

@router.post("/login", response_model=AuthResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Verify password
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Generate JWT token
    access_token = create_access_token({"sub": str(user.id)})

    return AuthResponse(
        access_token=access_token,
        user=UserResponse.from_orm(user)
    )
```

### Validation

- [ ] Register endpoint works: `POST /auth/register`
- [ ] Returns JWT token and user data
- [ ] Duplicate email returns 400 error
- [ ] Login endpoint works: `POST /auth/login`
- [ ] Invalid credentials return 401 error
- [ ] JWT token can be decoded and contains user ID

---

## Phase 4: Todo API

**Goal**: Implement CRUD endpoints for todos with user-scoped filtering

**Duration Estimate**: 3-4 hours

### Todo Router (app/routers/todos.py)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Todo
from app.schemas import TodoCreate, TodoUpdate, TodoResponse
from app.auth.dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_todo = Todo(
        user_id=current_user.id,
        title=todo_data.title,
        description=todo_data.description
    )
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo

@router.get("/", response_model=List[TodoResponse])
def list_todos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    todos = db.query(Todo).filter(Todo.user_id == current_user.id).order_by(Todo.created_at.desc()).all()
    return todos

@router.get("/{todo_id}", response_model=TodoResponse)
def get_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == current_user.id).first()
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    return todo

@router.put("/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == current_user.id).first()
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")

    if todo_data.title is not None:
        todo.title = todo_data.title
    if todo_data.description is not None:
        todo.description = todo_data.description
    if todo_data.is_completed is not None:
        todo.is_completed = todo_data.is_completed

    db.commit()
    db.refresh(todo)
    return todo

@router.patch("/{todo_id}/toggle", response_model=TodoResponse)
def toggle_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == current_user.id).first()
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")

    todo.is_completed = not todo.is_completed
    db.commit()
    db.refresh(todo)
    return todo

@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == current_user.id).first()
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")

    db.delete(todo)
    db.commit()
    return None
```

### Validation

- [ ] Create todo: `POST /todos` with JWT token
- [ ] List todos: `GET /todos` returns only current user's todos
- [ ] Get todo: `GET /todos/{id}` returns 404 for other user's todo
- [ ] Update todo: `PUT /todos/{id}` updates title, description, completion
- [ ] Toggle completion: `PATCH /todos/{id}/toggle`
- [ ] Delete todo: `DELETE /todos/{id}` returns 204
- [ ] All endpoints require authentication (401 without token)

---

## Phase 5: Frontend Integration

**Goal**: Build UI for authentication and todo management, connect to backend API

**Duration Estimate**: 5-6 hours

### Step 1: API Client (lib/api.ts)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class APIClient {
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'An error occurred');
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  // Auth methods
  async register(email: string, password: string) {
    const data = await this.request<{ access_token: string; user: any }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
    localStorage.setItem('auth_token', data.access_token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ access_token: string; user: any }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
    localStorage.setItem('auth_token', data.access_token);
    return data;
  }

  logout() {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }

  // Todo methods
  async getTodos() {
    return this.request<any[]>('/todos', { method: 'GET' });
  }

  async createTodo(title: string, description?: string) {
    return this.request<any>('/todos', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
  }

  async updateTodo(id: number, data: any) {
    return this.request<any>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleTodo(id: number) {
    return this.request<any>(`/todos/${id}/toggle`, { method: 'PATCH' });
  }

  async deleteTodo(id: number) {
    return this.request<void>(`/todos/${id}`, { method: 'DELETE' });
  }
}

export const api = new APIClient();
```

### Step 2: Auth Pages

**Register Page (app/register/page.tsx)**:
```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.register(email, password);
      router.push('/todos');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border mb-4"
          required
        />
        <input
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border mb-4"
          minLength={8}
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}
```

**Login Page (app/login/page.tsx)**: Similar to register

### Step 3: Todo Dashboard (app/todos/page.tsx)

```tsx
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function TodosPage() {
  const [todos, setTodos] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await api.getTodos();
      setTodos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createTodo(title, description);
    setTitle('');
    setDescription('');
    loadTodos();
  };

  const handleToggle = async (id: number) => {
    await api.toggleTodo(id);
    loadTodos();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this todo?')) {
      await api.deleteTodo(id);
      loadTodos();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">My Todos</h1>

      <form onSubmit={handleCreate} className="mb-8 bg-white p-4 rounded shadow">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border mb-2"
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border mb-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Todo
        </button>
      </form>

      <div className="space-y-2">
        {todos.map((todo) => (
          <div key={todo.id} className="bg-white p-4 rounded shadow flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={todo.is_completed}
                onChange={() => handleToggle(todo.id)}
              />
              <div>
                <h3 className={todo.is_completed ? 'line-through' : ''}>{todo.title}</h3>
                {todo.description && <p className="text-gray-600 text-sm">{todo.description}</p>}
              </div>
            </div>
            <button
              onClick={() => handleDelete(todo.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Validation

- [ ] User can register with email and password
- [ ] User can login and is redirected to /todos
- [ ] Todo dashboard displays user's todos
- [ ] User can create new todos
- [ ] User can toggle todo completion
- [ ] User can delete todos
- [ ] Unauthenticated users are redirected to login
- [ ] Loading states and error messages display properly

---

## Phase 6: Testing & Validation

**Goal**: Manually test all user stories and edge cases

**Duration Estimate**: 2-3 hours

### Manual Test Checklist

**User Story 1: Registration**
- [ ] Can register with valid email and password (8+ chars)
- [ ] Cannot register with duplicate email
- [ ] Cannot register with invalid email format
- [ ] Cannot register with short password (<8 chars)
- [ ] Redirected to todos after successful registration

**User Story 2: Login**
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong password
- [ ] Cannot login with non-existent email
- [ ] Redirected to todos after successful login
- [ ] Unauthenticated users redirected to login

**User Story 3-7: Todo Management**
- [ ] Can create todo with title only
- [ ] Can create todo with title and description
- [ ] Cannot create todo with empty title
- [ ] Can view all my todos (newest first)
- [ ] Cannot see other users' todos
- [ ] Can toggle todo completion status
- [ ] Can edit todo title and description
- [ ] Can delete todo with confirmation
- [ ] Cannot access other users' todos via URL manipulation

**Edge Cases**
- [ ] JWT token expiration handled gracefully (redirect to login)
- [ ] Invalid token returns 401
- [ ] Malformed requests return 400 with clear error messages
- [ ] Database connection errors are handled
- [ ] Empty todo list shows appropriate message
- [ ] Long titles/descriptions are handled (truncate or validate)

### Performance Testing

- [ ] API response times < 500ms for CRUD operations
- [ ] Page load times < 2 seconds
- [ ] Todo list with 50+ items loads acceptably

### Security Validation

- [ ] Passwords are hashed in database (never plaintext)
- [ ] JWT tokens are signed and validated
- [ ] User isolation enforced (cross-user access blocked)
- [ ] SQL injection attempts are prevented
- [ ] CORS properly configured

---

## Deployment Considerations

### Backend Deployment (Heroku/Railway/Render)

1. Add `Procfile`:
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

2. Update `DATABASE_URL` to PostgreSQL connection string

3. Set environment variables on hosting platform

4. Deploy and verify `/docs` endpoint

### Frontend Deployment (Vercel/Netlify)

1. Set `NEXT_PUBLIC_API_URL` to production backend URL

2. Build and deploy

3. Verify authentication flow and API calls work

### PostgreSQL Migration

1. Update `.env`:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

2. SQLAlchemy will auto-create tables (or use Alembic for migrations)

---

## Success Metrics

**Implementation Complete When**:
- All 7 user stories pass manual testing
- Backend API has 100% endpoint coverage (all routes working)
- Frontend can perform full CRUD workflow without errors
- Authentication flow works end-to-end
- User isolation verified (no cross-user data access)
- Code passes linting (pylint for Python, ESLint for TypeScript)
- README files are complete with setup instructions

**Quality Indicators**:
- API response times < 500ms p95
- Zero security vulnerabilities (passwords hashed, JWT validated, user isolation enforced)
- Clean code structure following best practices
- OpenAPI documentation auto-generated and accurate

---

## File Structure Summary

```
project/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth/
│   │   │   ├── __init__.py
│   │   │   ├── utils.py
│   │   │   └── dependencies.py
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       └── todos.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── .env
│   ├── .gitignore
│   └── README.md
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── todos/
│   │       └── page.tsx
│   ├── components/
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   └── TodoForm.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── auth.ts
│   ├── types/
│   │   └── index.ts
│   ├── .env.local.example
│   ├── .env.local
│   ├── package.json
│   └── README.md
│
└── specs/
    └── 002-todo-app-restful-mvp/
        ├── spec.md
        ├── plan.md (this file)
        └── README.md
```

---

**Created**: 2026-01-14
**Last Updated**: 2026-01-14
**Version**: 1.0.0
