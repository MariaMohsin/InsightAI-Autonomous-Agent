---
id: 0001
title: Create Claude Agent Usage Guide
stage: documentation
date: 2026-01-12
surface: agent
model: claude-sonnet-4-5-20250929
feature: project-setup
branch: master
user: User
command: manual
labels: ["documentation", "agent-guide", "project-setup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - Claude.md
tests:

---

## Prompt

```text
Update the `Claude.md` file based on my requirements. In this file:
-Use Auth Agent for Authentication
-Use Frontend Agent for frontend development (e.g Next.js)
-Use DB Agent for database design and operations
-Use Backend Agent for FastAPI development

Below are my project requirements:

Phase II: Todo Full-Stack Web Application
Basic Level Functionality
Objective: Using Claude Code and Spec-Kit Plus transform the console app into a modern
multi-user web application with persistent storage.

Requirements:
• Implement all 5 Basic Level features as a web application
• Create RESTful API endpoints
• Build responsive frontend interface
• Store data in Neon Serverless PostgreSQL database
• Authentication – Implement user signup/signin using Better Auth

Technology Stack:
- Frontend: Next.js 16+ (App Router)
- Backend: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Spec-Driven: Claude Code + Spec-Kit Plus
- Authentication: Better Auth

Better Auth configured to issue JWT (JSON Web Token) tokens when users log in.
These tokens are self-contained credentials that include user information and can be
verified by any service that knows the secret key.

How It Works:
● User logs in on Frontend → Better Auth creates a session and issues a JWT token
● Frontend makes API call → JWT token included in Authorization header
```

## Response snapshot

Created `Claude.md` with comprehensive project documentation including:
- Agent usage instructions for Auth, Frontend, DB, and Backend agents
- Complete technology stack specification
- Authentication flow with Better Auth and JWT tokens
- Project requirements and objectives
- Database schema suggestions
- API endpoint structure
- Development workflow
- Best practices for full-stack development

## Outcome

- ✅ Impact: `Claude.md` created, providing clear guidance for agent usage throughout development
- 🧪 Tests: N/A - documentation file
- 📁 Files: `Claude.md` created at project root
- 🔁 Next prompts: Ready to create project constitution
- 🧠 Reflection: Successfully documented agent responsibilities and project architecture for Phase II hackathon

## Evaluation notes (flywheel)

- Failure modes observed: File didn't exist initially, created new file instead of updating
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider moving to `.specify/` directory for better organization
