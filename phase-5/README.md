# Todo Full-Stack Web Application

A modern, feature-rich todo application built with Next.js, FastAPI, and PostgreSQL. Includes advanced task management features like priorities, tags, search, recurring tasks, reminders, and more.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Phase V Features](#phase-v-features)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)

## ✨ Features

### Core Features (Phases I-IV)
- ✅ User authentication with JWT tokens
- ✅ Create, read, update, delete todos
- ✅ Real-time updates
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ AI-powered chat assistant (Phase III)
- ✅ Microservices architecture ready (Phase IV)

### Phase V: Advanced Features 🚀
- 🎯 **Priority Management**: Organize tasks by Low/Medium/High priority
- 🏷️ **Tag System**: Flexible categorization with autocomplete
- 🔍 **Smart Search**: Case-insensitive search across title and description
- 🎚️ **Advanced Filtering**: Combine status, priority, tags, due dates, and search
- 📅 **Due Dates**: Set deadlines with overdue warnings
- 🔄 **Recurring Tasks**: Daily, weekly, monthly auto-generation
- ⏰ **Reminders**: Set reminder times (requires due date)
- 🎨 **Polished UI**: Smooth animations, toast notifications, keyboard shortcuts

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Notifications**: react-hot-toast
- **Authentication**: Better Auth with JWT

### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL (Neon Serverless)
- **Migrations**: Alembic
- **Authentication**: JWT tokens
- **Validation**: Pydantic v2
- **Date Handling**: python-dateutil

### Infrastructure
- **Database**: Neon Serverless PostgreSQL with connection pooling
- **Deployment**: Vercel (Frontend), Heroku/Railway (Backend)
- **Version Control**: Git

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Pages   │  │Components│  │  Hooks & Utils   │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP/REST API
┌─────────────────────┴───────────────────────────────┐
│                  Backend (FastAPI)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Routers  │  │ Services │  │  Models/Schemas  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────┬───────────────────────────────┘
                      │ SQLAlchemy ORM
┌─────────────────────┴───────────────────────────────┐
│              PostgreSQL (Neon Serverless)            │
│     users │ todos │ tags │ todo_tags │ messages     │
└───────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL database (or Neon account)

### Quick Start

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd phase-5
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Run migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload
# Backend runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

#### 3. Frontend Setup
```bash
# From project root
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with NEXT_PUBLIC_API_URL=http://localhost:8000

# Start frontend server
npm run dev
# Frontend runs at http://localhost:3000
```

#### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Create an account and start managing todos! 🎉

## 📚 API Documentation

### Authentication Endpoints
```
POST /auth/signup       - Create new user account
POST /auth/signin       - Login and get JWT token
POST /auth/signout      - Logout
GET  /auth/me           - Get current user info
```

### Todo Endpoints
```
GET    /todos/                    - List todos (with filters & search)
GET    /todos/{id}/               - Get specific todo
POST   /todos/                    - Create todo
PUT    /todos/{id}/               - Update todo
PATCH  /todos/{id}/               - Toggle completion
PATCH  /todos/{id}/complete       - Complete recurring todo
DELETE /todos/{id}/               - Delete todo
GET    /todos/reminders/pending   - Get pending reminders
```

### Tag Endpoints
```
GET    /tags/              - List all user tags
GET    /tags/search        - Autocomplete search
GET    /tags/{id}/         - Get specific tag
POST   /tags/              - Create or get tag
DELETE /tags/{id}/         - Delete tag
```

### Query Parameters (GET /todos/)
```
?status=pending|in_progress|completed
?priority=low|medium|high
?tag=Work&tag=Urgent                    (AND logic)
?search=keyword                         (searches title & description)
?due_range=overdue|today|this_week
?sort_by=created_at|updated_at|due_date|priority
?sort_order=asc|desc
?skip=0&limit=100                       (pagination)
```

## 🎯 Phase V Features

### 1. Priority Management
Organize tasks by priority level with visual indicators.

**Features**:
- Assign priority: Low (🟢), Medium (🟡), High (🔴)
- Filter by priority
- Sort by priority
- Color-coded badges

**Usage**:
```javascript
// Create todo with high priority
await createTodo({
  title: "Critical bug fix",
  priority: "high"
});

// Filter high priority tasks
GET /todos/?priority=high
```

### 2. Tag System
Flexible categorization with case-insensitive tag deduplication.

**Features**:
- Create unlimited tags
- Autocomplete search
- Multi-tag assignment
- Filter by tags (AND logic)
- Case-insensitive ("Work" = "work")

**Usage**:
```javascript
// Create todo with tags
await createTodo({
  title: "Team meeting",
  tag_names: ["Work", "Important"]
});

// Filter by multiple tags
GET /todos/?tag=Work&tag=Important
```

### 3. Smart Search
Case-insensitive search with relevance-based sorting.

**Features**:
- Search title and description
- 500ms debounce
- Relevance sorting (exact → starts with → contains)
- Works with all filters

**Usage**:
```javascript
// Search for "meeting"
GET /todos/?search=meeting

// Combine with filters
GET /todos/?search=meeting&priority=high&tag=Work
```

### 4. Advanced Filtering
Combine multiple filters with AND logic.

**Features**:
- Status: Pending, In Progress, Completed
- Priority: Low, Medium, High
- Tags: Multi-select
- Due Date: Overdue, Today, This Week
- Search: Keyword
- All filters work together

**Usage**:
```javascript
// Complex filter
GET /todos/?status=pending&priority=high&tag=Work&due_range=overdue&search=report
```

### 5. Due Dates
Set deadlines and track overdue tasks.

**Features**:
- DatePicker component
- Overdue warnings (⚠️)
- Due date range filtering
- Sort by due date

**Usage**:
```javascript
await createTodo({
  title: "Submit report",
  due_date: "2026-02-15T10:00:00Z"
});

// Filter overdue tasks
GET /todos/?due_range=overdue
```

### 6. Recurring Tasks
Automatically generate next instance on completion.

**Features**:
- Daily, Weekly, Monthly recurrence
- Auto-creates next instance
- Copies title, description, priority, tags
- Smart date calculation (handles edge cases)
- Recurrence indicator (🔄)

**Usage**:
```javascript
await createTodo({
  title: "Weekly team meeting",
  due_date: "2026-02-10T14:00:00Z",
  recurrence_rule: "weekly"
});

// Complete and get next instance
PATCH /todos/{id}/complete
// Returns: { completed_task, next_task }
```

**Date Calculation**:
- Daily: Current due + 1 day
- Weekly: Current due + 1 week
- Monthly: Current due + 1 month (Jan 31 → Feb 28)

### 7. Reminders
Set reminder times for tasks (requires due date).

**Features**:
- DateTime picker
- Requires due date validation
- Timezone-aware display
- Pending reminders endpoint
- Reminder indicator (🔔)

**Usage**:
```javascript
await createTodo({
  title: "Doctor appointment",
  due_date: "2026-02-15T10:00:00Z",
  reminder_at: "2026-02-15T09:00:00Z"  // 1 hour before
});

// Get pending reminders
GET /todos/reminders/pending
```

## 📁 Project Structure

```
phase-5/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, signup)
│   ├── (protected)/              # Protected routes (dashboard, chat)
│   └── page.tsx                  # Landing page
├── components/
│   ├── dashboard/                # Dashboard components
│   │   ├── AddTodoModal.tsx
│   │   ├── EditTodoModal.tsx
│   │   ├── TodoCard.tsx
│   │   ├── PrioritySelector.tsx
│   │   ├── TagInput.tsx
│   │   ├── SearchBar.tsx
│   │   ├── DatePicker.tsx
│   │   ├── RecurrenceSelector.tsx
│   │   └── FilterSortControls.tsx
│   ├── chat/                     # Chat components
│   └── ui/                       # Reusable UI components
├── hooks/                        # React hooks
│   ├── useAuth.ts
│   ├── useTodos.ts
│   └── useTags.ts
├── lib/
│   └── api/                      # API client
│       ├── client.ts
│       ├── todos.ts
│       └── tags.ts
├── types/                        # TypeScript types
│   ├── auth.ts
│   ├── todo.ts
│   └── chat.ts
├── backend/
│   ├── app/
│   │   ├── routers/              # API routes
│   │   │   ├── auth.py
│   │   │   ├── todos.py
│   │   │   ├── tags.py
│   │   │   └── chat.py
│   │   ├── services/             # Business logic
│   │   │   └── recurring.py
│   │   ├── models.py             # SQLAlchemy models
│   │   ├── schemas.py            # Pydantic schemas
│   │   ├── database.py           # DB connection
│   │   ├── auth.py               # JWT auth
│   │   └── main.py               # FastAPI app
│   ├── migrations/               # Alembic migrations
│   └── requirements.txt
├── specs/                        # Specifications
│   └── 005-advanced-features/
│       ├── spec.md
│       ├── plan.md
│       ├── tasks.md
│       └── data-model.md
└── IMPLEMENTATION_COMPLETE.md    # Full implementation docs
```

## 💻 Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
npm test
```

### Database Migrations
```bash
cd backend

# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Code Style
```bash
# Backend (Black, isort)
cd backend
black .
isort .

# Frontend (ESLint, Prettier)
npm run lint
npm run format
```

### Development Tools
- **Backend API Docs**: http://localhost:8000/docs (Swagger UI)
- **Database GUI**: Use pgAdmin or DBeaver to connect to Neon
- **React DevTools**: Browser extension for debugging
- **Redux DevTools**: For state inspection

## 🚢 Deployment

### Frontend (Vercel)
```bash
# Connect to Vercel
vercel

# Deploy
vercel --prod

# Environment variables needed:
# - NEXT_PUBLIC_API_URL
# - NEXTAUTH_SECRET
```

### Backend (Railway/Heroku)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up

# Environment variables needed:
# - DATABASE_URL
# - JWT_SECRET
# - CORS_ORIGINS
```

### Database (Neon)
1. Create account at https://neon.tech
2. Create new project
3. Copy connection string
4. Add to .env as DATABASE_URL

## 📖 Documentation

- **API Docs**: http://localhost:8000/docs (when backend is running)
- **Implementation Details**: See `IMPLEMENTATION_COMPLETE.md`
- **Specifications**: See `specs/005-advanced-features/`
- **Architecture Decisions**: See `history/adr/`

## 🎨 Features Showcase

### Priority Management
- Visual color indicators (green, yellow, red)
- Filter and sort by priority
- Integrated in all forms

### Tag System
- Autocomplete with 300ms debounce
- Case-insensitive deduplication
- Multi-select filtering
- Tag chips UI

### Search
- 500ms debounced input
- Relevance-based sorting
- Loading indicator
- Clear button (×) or Esc key

### Recurring Tasks
- Daily/Weekly/Monthly options
- Auto-creates next instance
- Smart date calculation
- Visual indicator (🔄)

### UI/UX
- Smooth Framer Motion animations
- Toast notifications for all actions
- Responsive design (mobile-first)
- Keyboard shortcuts (Enter, Esc)
- Loading states throughout
- Empty states with helpful messages

## 🔒 Security

- JWT authentication on all endpoints
- User ID filtering on all queries
- SQL injection prevention (parameterized queries)
- XSS prevention (React auto-escaping)
- Input validation (Pydantic)
- CORS configuration
- Environment variables for secrets

## 📊 Performance

- Database indexes on frequently queried fields
- `selectinload` to prevent N+1 queries
- Debounced search and autocomplete
- Optimistic UI updates
- Connection pooling (pgbouncer)

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check database connection
psql $DATABASE_URL

# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend build errors
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database migration issues
```bash
# Reset migrations (⚠️ destroys data)
alembic downgrade base
alembic upgrade head
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is for educational purposes.

## 👥 Authors

- Development: Claude Code + Spec-Kit Plus
- Architecture: Spec-driven development approach
- Phase V Implementation: Complete (130/135 tasks)

## 🎉 Acknowledgments

- Next.js team for the amazing framework
- FastAPI for the elegant Python API framework
- Neon for serverless PostgreSQL
- Vercel for hosting solutions
- All open-source contributors

## 📧 Support

For issues and questions:
1. Check the documentation in `IMPLEMENTATION_COMPLETE.md`
2. Review API docs at http://localhost:8000/docs
3. Check existing issues in the repository

---

**Status**: ✅ Production Ready (Phase V Complete)
**Version**: 2.0.0 (with Phase V Advanced Features)
**Last Updated**: February 2026

Built with ❤️ using Next.js, FastAPI, and PostgreSQL
