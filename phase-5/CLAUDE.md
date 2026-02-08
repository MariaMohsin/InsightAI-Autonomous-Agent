# Claude Code Agent Usage Guide

## Project Overview
This is a Todo Full-Stack Web Application built using spec-driven development with Claude Code and Spec-Kit Plus.

## Agent Usage Instructions

### Authentication Development
**Use Auth Agent** for all authentication-related tasks:
- User signup/signin implementation
- Better Auth integration and configuration
- JWT token generation and validation
- Session management
- Password hashing and security
- Authentication middleware

### Frontend Development
**Use Frontend Agent** for all frontend tasks:
- Next.js 16+ (App Router) implementation
- Building responsive UI components
- Creating pages and layouts
- Client-side routing
- State management
- API integration from frontend
- Better Auth client-side integration

### Database Operations
**Use DB Agent** for all database-related tasks:
- Database schema design
- Neon Serverless PostgreSQL setup and configuration
- SQLModel model definitions
- Database migrations
- Query optimization
- Connection management

### Backend Development
**Use Backend Agent** for all backend tasks:
- FastAPI development
- RESTful API endpoint creation
- Request/response handling
- SQLModel ORM integration
- Backend validation with Pydantic
- API documentation
- Backend error handling

## Project Requirements

### Phase II: Todo Full-Stack Web Application

#### Objective
Transform the console app into a modern multi-user web application with persistent storage using Claude Code and Spec-Kit Plus.

#### Basic Level Functionality Requirements
- Implement all 5 Basic Level features as a web application
- Create RESTful API endpoints
- Build responsive frontend interface
- Store data in Neon Serverless PostgreSQL database
- Implement user signup/signin using Better Auth

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16+ (App Router) |
| Backend | Python FastAPI |
| ORM | SQLModel |
| Database | Neon Serverless PostgreSQL |
| Spec-Driven | Claude Code + Spec-Kit Plus |
| Authentication | Better Auth |

### Authentication Flow

Better Auth is configured to issue JWT (JSON Web Token) tokens when users log in. These tokens are self-contained credentials that include user information and can be verified by any service that knows the secret key.

#### How It Works
1. User logs in on Frontend → Better Auth creates a session and issues a JWT token
2. Frontend makes API calls → JWT token is included in Authorization header
3. Backend validates JWT → Verifies token signature and extracts user information
4. API processes request → Returns response based on authenticated user context

### API Endpoints
All backend endpoints should follow RESTful conventions:
- Authentication endpoints (signup, signin, signout)
- Todo CRUD operations (create, read, update, delete)
- User-specific todo management
- Todo filtering and search capabilities

### Database Schema
- Users table (id, email, password_hash, created_at)
- Todos table (id, user_id, title, description, status, priority, due_date, created_at, updated_at)
- Proper foreign key relationships and indexes

### Frontend Features
- User authentication pages (signup/signin)
- Todo dashboard with CRUD operations
- Responsive design for mobile and desktop
- Real-time updates and error handling
- Form validation and user feedback

## Development Workflow

1. **Planning**: Use Spec-Kit Plus to create specifications
2. **Database Design**: Use DB Agent to design schema and setup Neon PostgreSQL
3. **Authentication**: Use Auth Agent to implement Better Auth with JWT tokens
4. **Backend APIs**: Use Backend Agent to build FastAPI endpoints with SQLModel
5. **Frontend**: Use Frontend Agent to build Next.js interface
6. **Integration**: Connect all layers and test the complete flow
7. **Testing**: Validate all features work end-to-end

## Best Practices

- Always use the appropriate specialized agent for each layer
- Follow RESTful API design principles
- Implement proper error handling at all layers
- Use environment variables for sensitive configuration
- Validate data at both frontend and backend
- Follow security best practices for authentication and authorization
- Write clean, maintainable, and documented code

## Active Technologies
- Neon Serverless PostgreSQL with connection pooling via pgbouncer (001-todo-app-mvp)
- TypeScript 5.x with Next.js 16+ (App Router, React 19) (003-todo-frontend)
- N/A (frontend only - backend handles Neon PostgreSQL) (003-todo-frontend)

## Recent Changes
- 001-todo-app-mvp: Added Neon Serverless PostgreSQL with connection pooling via pgbouncer
