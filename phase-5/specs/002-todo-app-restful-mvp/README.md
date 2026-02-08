# Spec 002: Todo RESTful API MVP

**Status**: Draft
**Created**: 2026-01-14
**Branch**: `002-todo-app-restful-mvp` (not yet created)

## Overview

This is an alternative specification for the Todo Full-Stack Web Application, focusing on:
- **SQLite for local development** (PostgreSQL-ready for production)
- **SQLAlchemy ORM** (standard Python ORM)
- **Flexibility**: React OR Next.js for frontend (TBD)
- **Educational focus**: Target audience includes junior/mid-level developers

## Key Differences from Spec 001

| Aspect | Spec 001 (001-todo-app-mvp) | Spec 002 (002-todo-app-restful-mvp) |
|--------|------------------------------|--------------------------------------|
| **Status** | In Progress (Phase 1 & 2 Complete) | Draft (Not started) |
| **Database** | Neon Serverless PostgreSQL (cloud) | SQLite (local), PostgreSQL-ready |
| **ORM** | SQLModel (ORM + Pydantic) | SQLAlchemy (traditional ORM) |
| **Frontend** | Next.js 16+ (decided) | React or Next.js (flexible) |
| **Auth Library** | Better Auth | Pure JWT implementation |
| **Target** | Production deployment ready | Educational/learning focused |

## When to Use This Spec

Use **Spec 002** if you want:
- Local development with SQLite (no cloud database required)
- Traditional SQLAlchemy ORM patterns
- Flexibility to choose React vs Next.js
- Educational reference for learning full-stack development
- Hackathon project with simpler setup

Use **Spec 001** if you want:
- Cloud-native deployment (Neon PostgreSQL)
- SQLModel for combined ORM + validation
- Next.js 16+ with App Router
- Production-ready architecture from day one
- Already have Phase 1 & 2 complete (foundation built)

## Implementation Status

**Spec 002**: Not yet implemented
**Spec 001**: 23/80 tasks complete (28.75%)

## Files

- `spec.md` - Complete feature specification with user stories, requirements, API design, and database schema

## Next Steps

To implement this spec:
1. Create feature branch: `git checkout -b 002-todo-app-restful-mvp`
2. Run planning phase: `/sp.plan` (or create plan.md manually)
3. Generate tasks: `/sp.tasks` (or create tasks.md manually)
4. Begin implementation following the task list

---

**Note**: This spec was created as an alternative to the in-progress Spec 001. You can choose to implement either spec or continue with Spec 001's current progress.
