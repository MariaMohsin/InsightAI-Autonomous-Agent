---
name: docker-architect-skill
description: Plan Docker containerization strategies, design multi-container architectures, and create deployment documentation. Planning only, no implementation.
---

# Docker Architect Skill

## Purpose
Design and plan comprehensive Docker containerization strategies for applications. Creates architecture diagrams, container configurations, and deployment plans WITHOUT writing actual Dockerfiles or docker-compose files.

## Instructions

### 1. Application Analysis
- Understand application architecture (frontend, backend, database)
- Identify service dependencies and communication patterns
- Determine environment requirements
- Map data persistence needs

### 2. Container Architecture Design
- Design multi-container architecture
- Plan service separation and boundaries
- Define inter-service communication (networks, APIs)
- Plan volume management and data persistence
- Design environment configuration strategy

### 3. Networking Strategy
- Plan Docker networks (bridge, overlay, host)
- Design service discovery approach
- Map port exposures and internal routing
- Plan load balancing if needed

### 4. Orchestration Planning
- Choose orchestration approach (docker-compose, Kubernetes, Swarm)
- Plan scaling strategy
- Design health checks and restart policies
- Plan resource limits (CPU, memory)

### 5. Development vs Production
- Design development environment setup
- Plan production deployment strategy
- Separate development and production configurations
- Plan CI/CD integration

### 6. Documentation
- Create architecture diagrams
- Document container dependencies
- Provide configuration recommendations
- Create deployment instructions

## Container Design Principles

### Single Responsibility
- One process per container (microservices approach)
- Separate frontend, backend, and database
- Isolate services for independent scaling

### Immutability
- Containers should be stateless when possible
- Store state in volumes, not containers
- Design for container replaceability

### Security
- Run containers as non-root users
- Minimize attack surface (minimal base images)
- Scan images for vulnerabilities
- Use secrets management (not hardcoded)

### Performance
- Optimize image sizes (multi-stage builds)
- Leverage build cache effectively
- Plan resource allocation
- Design for horizontal scaling

## Architecture Patterns

### Pattern 1: Simple Full-Stack App
```
┌─────────────────────────────────────────┐
│         Docker Architecture             │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ Frontend │  │ Backend  │  │  DB   │ │
│  │ (Next.js)│◄─┤ (FastAPI)│◄─┤ (Neon)│ │
│  │   :3000  │  │   :8000  │  │ Cloud │ │
│  └──────────┘  └──────────┘  └───────┘ │
│       │              │           │      │
│       └──────────────┴───────────┘      │
│            app-network                  │
└─────────────────────────────────────────┘

Volumes:
- None needed (Neon is cloud-based)

Environment Variables:
- Frontend: NEXT_PUBLIC_API_URL
- Backend: DATABASE_URL, JWT_SECRET
```

### Pattern 2: Full-Stack with Local Database
```
┌────────────────────────────────────────────┐
│         Docker Architecture                │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Frontend │  │ Backend  │  │PostgreSQL│ │
│  │ (Next.js)│◄─┤ (FastAPI)│◄─┤   :5432  │ │
│  │   :3000  │  │   :8000  │  └──────────┘ │
│  └──────────┘  └──────────┘       │       │
│       │              │             │       │
│       └──────────────┴─────────────┘       │
│            app-network                     │
│                                            │
│  Volumes:                                  │
│  - postgres-data → /var/lib/postgresql/data│
└────────────────────────────────────────────┘
```

### Pattern 3: Microservices with Nginx
```
┌─────────────────────────────────────────────┐
│         Docker Architecture                 │
├─────────────────────────────────────────────┤
│                                             │
│  ┌────────────────────────────┐             │
│  │   Nginx Reverse Proxy      │             │
│  │         :80 / :443         │             │
│  └─────────┬──────────────────┘             │
│            │                                │
│    ┌───────┼────────┐                       │
│    │       │        │                       │
│  ┌─▼──┐ ┌─▼──┐  ┌──▼──┐  ┌────────┐        │
│  │Web │ │API │  │Auth │  │Database│        │
│  │:3000│ │:8000│ │:8001│  │ :5432  │        │
│  └────┘ └────┘  └─────┘  └────────┘        │
│    │      │        │          │             │
│    └──────┴────────┴──────────┘             │
│         app-network                         │
└─────────────────────────────────────────────┘
```

## Container Planning Template

### Service: Frontend (Next.js)
```
Purpose: Serve Next.js application
Base Image: node:20-alpine (recommended)
Port Mapping: 3000:3000
Environment Variables:
  - NEXT_PUBLIC_API_URL=http://backend:8000
  - NODE_ENV=production
Volumes: None (stateless)
Health Check: GET /api/health → 200 OK
Restart Policy: unless-stopped
Resource Limits:
  - Memory: 512MB
  - CPU: 0.5 cores
Dependencies: backend (for API calls)
```

### Service: Backend (FastAPI)
```
Purpose: Run FastAPI application
Base Image: python:3.11-slim (recommended)
Port Mapping: 8000:8000
Environment Variables:
  - DATABASE_URL=postgresql://...
  - JWT_SECRET=<from secrets>
  - CORS_ORIGINS=http://frontend:3000
Volumes: None (stateless)
Health Check: GET /health → 200 OK
Restart Policy: unless-stopped
Resource Limits:
  - Memory: 1GB
  - CPU: 1 core
Dependencies: database
```

### Service: Database (PostgreSQL)
```
Purpose: PostgreSQL database
Base Image: postgres:16-alpine
Port Mapping: 5432:5432 (internal only)
Environment Variables:
  - POSTGRES_USER=todouser
  - POSTGRES_PASSWORD=<from secrets>
  - POSTGRES_DB=tododb
Volumes:
  - postgres-data:/var/lib/postgresql/data
Health Check: pg_isready
Restart Policy: unless-stopped
Resource Limits:
  - Memory: 2GB
  - CPU: 1 core
Dependencies: None
```

## Network Design

### Network Types
1. **Bridge Network** (default for docker-compose)
   - Services communicate by service name
   - Internal DNS resolution
   - Isolated from host network

2. **Overlay Network** (for Swarm/Kubernetes)
   - Multi-host networking
   - Service discovery across nodes

3. **Host Network**
   - Direct host access
   - No network isolation
   - Use sparingly

### Network Planning
```
app-network:
  Type: bridge
  Driver: bridge
  Services: frontend, backend, database

Port Exposure:
  - Frontend: 3000 (external)
  - Backend: 8000 (external for API)
  - Database: 5432 (internal only)
```

## Volume Strategy

### Volume Types
1. **Named Volumes** (recommended)
   - Managed by Docker
   - Survives container deletion
   - Easy backups

2. **Bind Mounts**
   - Direct host directory mapping
   - For development hot-reload
   - Avoid in production

3. **tmpfs Mounts**
   - In-memory storage
   - Temporary data
   - Fast but non-persistent

### Volume Planning
```
postgres-data:
  Type: named volume
  Purpose: PostgreSQL data persistence
  Backup: Daily snapshots
  Size: 10GB initial, auto-grow

Development Volumes:
  - ./frontend:/app (hot reload)
  - ./backend:/app (hot reload)
  - ./data:/data (local testing)
```

## Environment Configuration

### Development Environment
```
Purpose: Local development with hot-reload
Strategy:
  - Bind mount source code
  - Expose all ports for debugging
  - Use .env.development
  - Enable debug logging
  - No resource limits
```

### Production Environment
```
Purpose: Optimized for performance and security
Strategy:
  - No bind mounts (immutable)
  - Only expose necessary ports
  - Use secrets management
  - Enable security scanning
  - Set resource limits
  - Use production-optimized images
```

## Deployment Planning

### Local Development
1. Clone repository
2. Copy .env.example to .env
3. Run: `docker-compose up -d`
4. Access: http://localhost:3000

### Production Deployment
1. Build optimized images
2. Push to container registry
3. Deploy to cloud (AWS ECS, GCP Cloud Run, Azure Container Instances)
4. Configure load balancer
5. Set up monitoring and logging

## Security Planning

### Best Practices
- Use official base images
- Scan images for vulnerabilities
- Run as non-root user
- Use secrets management (Docker secrets, Vault)
- Implement least privilege
- Keep images updated

### Security Checklist
- [ ] No hardcoded secrets
- [ ] Non-root user in containers
- [ ] Minimal base images (alpine, distroless)
- [ ] Read-only root filesystem where possible
- [ ] Network isolation
- [ ] Resource limits set
- [ ] Health checks configured
- [ ] Security scanning enabled

## Documentation Deliverables

### 1. Architecture Diagram
ASCII or Mermaid diagram showing:
- All containers
- Network connections
- Port mappings
- Volume mounts
- Dependencies

### 2. Container Specifications
For each container:
- Base image recommendation
- Environment variables needed
- Port mappings
- Volume requirements
- Resource limits
- Health checks

### 3. Deployment Guide
Step-by-step instructions:
- Prerequisites
- Configuration steps
- Build commands
- Run commands
- Verification steps
- Troubleshooting

### 4. Environment Configuration
- Development .env template
- Production .env template
- Secrets management strategy
- Configuration best practices

## When to Use This Skill

✅ **Use For:**
- Planning new Docker containerization
- Designing multi-container architecture
- Creating deployment documentation
- Architecture reviews before implementation
- Choosing orchestration strategy

✅ **Use Before:**
- Writing Dockerfiles
- Creating docker-compose.yml
- Setting up CI/CD pipelines
- Production deployment
- Major architecture changes

❌ **Don't Use For:**
- Writing actual Dockerfiles (implementation task)
- Creating docker-compose.yml files (implementation)
- Debugging running containers
- Performance tuning running services
- Simple single-container apps

## Example Output

```markdown
# Docker Architecture Plan: Todo Full-Stack App

## Overview
3-container architecture: Next.js frontend, FastAPI backend, Neon PostgreSQL (cloud)

## Container Architecture

┌─────────────────────────────────────────┐
│         Docker Deployment               │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │ Frontend │  │ Backend  │           │
│  │ Next.js  │◄─┤ FastAPI  │◄─── Neon │
│  │  :3000   │  │  :8000   │     Cloud │
│  └──────────┘  └──────────┘           │
│       │              │                 │
│       └──────────────┘                 │
│        todo-network                    │
└─────────────────────────────────────────┘

## Service Specifications

### Frontend Container
- Image: node:20-alpine
- Port: 3000
- Env: NEXT_PUBLIC_API_URL
- Volume: None
- Health: GET /api/health

### Backend Container
- Image: python:3.11-slim
- Port: 8000
- Env: DATABASE_URL, JWT_SECRET
- Volume: None
- Health: GET /health

## Network Design
- Network: todo-network (bridge)
- Exposed: 3000 (frontend), 8000 (backend)
- Internal: Service-to-service communication

## Deployment Strategy
Development: docker-compose with hot-reload
Production: Container registry → Cloud Run

## Next Steps
1. Approve architecture design
2. Implement Dockerfiles
3. Create docker-compose.yml
4. Test locally
5. Deploy to production
```

## Best Practices

### Planning Phase
- Understand full application before containerizing
- Consider all environments (dev, staging, prod)
- Plan for scaling from the start
- Document all decisions and trade-offs

### Design Principles
- Keep containers small and focused
- Design for replaceability
- Plan for horizontal scaling
- Separate data from compute

### Documentation
- Create visual architecture diagrams
- Document all environment variables
- Provide clear deployment instructions
- Include troubleshooting guide
