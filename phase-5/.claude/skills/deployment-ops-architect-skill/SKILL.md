---
name: deployment-ops-architect-skill
description: Plan deployment strategies, scaling configurations, monitoring/alerting specifications, and operational procedures. Planning only, no implementation.
---

# Deployment & Operations Architect Skill

## Purpose
Design and plan comprehensive deployment strategies, operational procedures, monitoring/alerting systems, and scaling configurations for production applications. Creates operational specifications and deployment plans WITHOUT implementing actual infrastructure code.

## Instructions

### 1. Deployment Strategy Planning
- Analyze application architecture and dependencies
- Choose appropriate deployment platform (cloud, containers, serverless)
- Plan deployment pipeline (CI/CD workflow)
- Design zero-downtime deployment approach
- Plan rollback and disaster recovery strategy

### 2. Infrastructure Planning
- Design infrastructure architecture (servers, databases, load balancers)
- Plan resource allocation (CPU, memory, storage)
- Design network architecture and security groups
- Plan for high availability and redundancy
- Choose appropriate service tiers and instance types

### 3. Scaling Strategy
- Plan horizontal vs vertical scaling approach
- Design auto-scaling policies and triggers
- Plan load balancing strategy
- Design caching layers for performance
- Plan for database scaling (read replicas, sharding)

### 4. Monitoring & Observability
- Design monitoring architecture (metrics, logs, traces)
- Plan alerting rules and thresholds
- Design dashboards for visibility
- Plan log aggregation and analysis
- Design uptime monitoring and health checks

### 5. Security & Compliance
- Plan secrets management strategy
- Design security policies and IAM roles
- Plan SSL/TLS certificate management
- Design backup and disaster recovery procedures
- Plan compliance requirements (GDPR, SOC2, etc.)

### 6. Operational Procedures
- Create runbooks for common operations
- Plan incident response procedures
- Design maintenance windows and update strategies
- Plan cost optimization approaches
- Document operational best practices

## Deployment Platforms Comparison

### Platform 1: Traditional VPS/VM (DigitalOcean, Linode, AWS EC2)
```
Pros:
✅ Full control over environment
✅ Predictable pricing
✅ Can run any software

Cons:
❌ Manual scaling
❌ More maintenance overhead
❌ Need to manage OS updates

Best For:
- Long-running applications
- Predictable workloads
- Full control requirements
```

### Platform 2: Container Orchestration (AWS ECS, GCP Cloud Run, Azure Container Apps)
```
Pros:
✅ Auto-scaling
✅ Pay per use
✅ Easy rollbacks
✅ Zero-downtime deployments

Cons:
❌ Platform lock-in
❌ Cold start issues (serverless)
❌ More complex setup

Best For:
- Microservices
- Variable workloads
- Fast iteration
```

### Platform 3: Platform-as-a-Service (Vercel, Netlify, Railway, Render)
```
Pros:
✅ Simplest deployment
✅ Automatic CI/CD
✅ Built-in SSL, CDN
✅ Developer-friendly

Cons:
❌ Less control
❌ Vendor lock-in
❌ Can be expensive at scale

Best For:
- Startups/MVPs
- Frontend applications
- Quick prototypes
```

### Platform 4: Serverless (AWS Lambda, Vercel Functions, Cloudflare Workers)
```
Pros:
✅ Pay only for execution
✅ Infinite scaling
✅ No server management

Cons:
❌ Cold starts
❌ Execution time limits
❌ Stateless constraints

Best For:
- Event-driven workloads
- API endpoints
- Scheduled tasks
```

## Deployment Architecture Template

### Todo Application - Production Deployment Plan

```
┌────────────────────────────────────────────────────────┐
│           Production Architecture                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────┐         │
│  │         CDN / Edge Network               │         │
│  │         (CloudFlare / Vercel Edge)       │         │
│  └──────────────┬───────────────────────────┘         │
│                 │                                      │
│                 ▼                                      │
│  ┌──────────────────────────────────────────┐         │
│  │      Load Balancer / API Gateway         │         │
│  │         (AWS ALB / Cloud Run)            │         │
│  └──────────┬───────────────┬───────────────┘         │
│             │               │                          │
│   ┌─────────▼──────┐  ┌────▼──────────────┐          │
│   │   Frontend     │  │     Backend        │          │
│   │   (Vercel)     │  │   (Cloud Run)      │          │
│   │   Next.js      │  │   FastAPI          │          │
│   │   Auto-scale   │  │   Auto-scale       │          │
│   │   1-10 instances│ │   1-20 instances   │          │
│   └────────────────┘  └────┬───────────────┘          │
│                            │                           │
│                            ▼                           │
│             ┌──────────────────────────┐               │
│             │   Database (Primary)     │               │
│             │   Neon PostgreSQL        │               │
│             │   Connection Pooling     │               │
│             └──────────┬───────────────┘               │
│                        │                               │
│                        ▼                               │
│             ┌──────────────────────────┐               │
│             │   Read Replica (Optional)│               │
│             │   Neon Branch            │               │
│             └──────────────────────────┘               │
│                                                        │
│  Supporting Services:                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│  │  Monitoring│  │   Logging  │  │   Secrets  │      │
│  │  (DataDog) │  │  (LogDNA)  │  │   (Vault)  │      │
│  └────────────┘  └────────────┘  └────────────┘      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Deployment Pipeline Design

### CI/CD Workflow (GitHub Actions)

```
┌─────────────────────────────────────────────────┐
│         Deployment Pipeline Stages              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Stage 1: Code Push                             │
│  ├─ Developer pushes to branch                  │
│  └─ Trigger: git push                           │
│                                                 │
│  Stage 2: Build & Test (3-5 min)                │
│  ├─ Install dependencies                        │
│  ├─ Run linting (ESLint, Ruff)                  │
│  ├─ Run unit tests                              │
│  ├─ Run integration tests                       │
│  ├─ Build Docker images                         │
│  └─ Trigger: Every commit                       │
│                                                 │
│  Stage 3: Security Scan (2-3 min)               │
│  ├─ Dependency vulnerability scan               │
│  ├─ Container image scan                        │
│  ├─ SAST (Static analysis)                      │
│  └─ Trigger: Pull request                       │
│                                                 │
│  Stage 4: Preview Deployment (Staging)          │
│  ├─ Deploy to staging environment               │
│  ├─ Run E2E tests                               │
│  ├─ Generate preview URL                        │
│  └─ Trigger: Pull request to main               │
│                                                 │
│  Stage 5: Production Deployment                 │
│  ├─ Deploy backend (Cloud Run)                  │
│  ├─ Deploy frontend (Vercel)                    │
│  ├─ Run smoke tests                             │
│  ├─ Health check validation                     │
│  └─ Trigger: Merge to main (auto) or manual    │
│                                                 │
│  Stage 6: Post-Deployment                       │
│  ├─ Send Slack notification                     │
│  ├─ Update status page                          │
│  ├─ Tag release in Git                          │
│  └─ Monitor error rates                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Auto-Scaling Configuration

### Frontend Scaling (Vercel)
```
Platform: Vercel (Auto-scaling built-in)

Configuration:
- Edge Functions: Auto-scale globally
- Static Assets: CDN cached
- API Routes: Serverless (auto-scale)

Limits:
- Concurrent executions: 1000 (Pro plan)
- Duration: 60s max per request

Cost Optimization:
- Use static generation where possible
- Implement proper caching headers
- Optimize bundle size
```

### Backend Scaling (Cloud Run)
```
Platform: Google Cloud Run

Auto-scaling Configuration:
- Min Instances: 1 (keep warm, avoid cold starts)
- Max Instances: 20 (prevent runaway costs)
- Concurrency: 80 requests per instance
- CPU: 1 vCPU per instance
- Memory: 512 MB per instance

Scaling Triggers:
- CPU Utilization > 70% → Scale up
- Request count > 80 per instance → Scale up
- CPU Utilization < 30% for 5 min → Scale down

Scaling Behavior:
- Scale up: Add instance in ~5 seconds
- Scale down: Remove instance after 5 min idle
- Cold start: ~2-3 seconds

Cost Estimate:
- $0.00002400 per vCPU-second
- $0.00000250 per GB-second
- ~$20-50/month for low-medium traffic
```

### Database Scaling (Neon PostgreSQL)
```
Platform: Neon Serverless PostgreSQL

Configuration:
- Compute: Auto-scale 0.25 - 2 CU
- Storage: Auto-grow (pay per GB)
- Connection Pooling: PgBouncer (transaction mode)

Scaling Strategy:
- Vertical scaling: Auto-adjust compute units
- Read replicas: Create for read-heavy workloads
- Connection pooling: Handle 1000+ concurrent connections

Performance Optimization:
- Use connection pooling (required for serverless)
- Implement query result caching
- Create appropriate indexes
- Use read replicas for analytics

Cost Estimate:
- Compute: ~$0.16 per compute hour
- Storage: ~$0.14 per GB/month
- ~$10-30/month for small-medium apps
```

## Monitoring & Alerting Strategy

### Metrics to Monitor

**Application Metrics**
```
Performance:
- API response time (p50, p95, p99)
- Database query duration
- Frontend load time
- Cache hit ratio

Availability:
- Uptime percentage
- Error rate (4xx, 5xx)
- Health check status

Resource Utilization:
- CPU usage
- Memory usage
- Network bandwidth
- Disk I/O
```

**Business Metrics**
```
User Activity:
- Active users
- Signups per day
- Todos created per user
- Feature usage

Performance:
- User session duration
- Page views
- Bounce rate
```

### Alerting Rules

**Critical Alerts (Page immediately)**
```
🚨 P0 - Production Down
Trigger: Uptime < 99% for 2 minutes
Action: Page on-call engineer, auto-rollback

🚨 P0 - Database Connection Failure
Trigger: Database connection errors > 5% for 1 minute
Action: Page on-call, escalate to DB team

🚨 P0 - Error Rate Spike
Trigger: 5xx errors > 10% for 5 minutes
Action: Page on-call, investigate immediately
```

**High Priority Alerts (Notify team)**
```
⚠️ P1 - High Response Time
Trigger: API p95 response time > 1s for 10 minutes
Action: Slack alert, investigate during business hours

⚠️ P1 - Memory Usage High
Trigger: Memory usage > 85% for 15 minutes
Action: Slack alert, consider scaling

⚠️ P1 - Disk Space Low
Trigger: Disk usage > 80%
Action: Slack alert, cleanup or expand storage
```

**Medium Priority Alerts (Monitor)**
```
ℹ️ P2 - Slow Queries
Trigger: Database query > 500ms
Action: Log for optimization

ℹ️ P2 - Cache Miss Rate High
Trigger: Cache hit ratio < 80%
Action: Log for review

ℹ️ P2 - Unusual Traffic Pattern
Trigger: Traffic 3x above baseline
Action: Monitor for DDoS or bot activity
```

### Monitoring Tools Recommendation

**Option 1: DataDog (Comprehensive, Expensive)**
```
✅ Application Performance Monitoring (APM)
✅ Infrastructure monitoring
✅ Log aggregation
✅ Custom dashboards
✅ Alerting and integrations

Cost: ~$31/host/month
Best For: Production applications, teams > 5
```

**Option 2: Sentry + CloudWatch (Budget-Friendly)**
```
Sentry: Error tracking and performance
CloudWatch: Infrastructure metrics and logs

✅ Error tracking with stack traces
✅ Performance monitoring
✅ Infrastructure metrics
✅ Log aggregation

Cost: ~$26/month (Sentry Team) + AWS costs
Best For: Startups, small teams
```

**Option 3: Self-Hosted (Grafana + Prometheus + Loki)**
```
✅ Full control
✅ No vendor lock-in
✅ Customizable dashboards

❌ Maintenance overhead
❌ Need DevOps expertise

Cost: Server costs only (~$20/month)
Best For: Cost-sensitive, technical teams
```

## Health Checks and Uptime Monitoring

### Health Check Endpoints

**Backend Health Check**
```
Endpoint: GET /health

Response:
{
  "status": "healthy",
  "version": "1.2.3",
  "database": "connected",
  "uptime": 345600,
  "timestamp": "2024-02-07T10:30:00Z"
}

Checks:
✅ API is responding
✅ Database connection active
✅ Memory usage acceptable
✅ No critical errors in logs

Frequency: Every 30 seconds
Timeout: 5 seconds
```

**Frontend Health Check**
```
Endpoint: GET /api/health

Response:
{
  "status": "healthy",
  "backend": "connected",
  "timestamp": "2024-02-07T10:30:00Z"
}

Checks:
✅ Next.js app is serving
✅ Backend API reachable
✅ Static assets loading

Frequency: Every 60 seconds
```

**Database Health Check**
```
Query: SELECT 1;

Checks:
✅ Connection pool available
✅ Query execution < 100ms
✅ Active connections < max_connections

Frequency: Every 60 seconds
```

### Uptime Monitoring Services

**Option 1: UptimeRobot (Free tier available)**
```
- Monitor up to 50 endpoints (free)
- 5-minute check intervals
- Email/SMS alerts
- Status page

Cost: Free - $7/month
```

**Option 2: Pingdom (Professional)**
```
- 1-minute check intervals
- Global monitoring locations
- Real user monitoring
- Advanced analytics

Cost: $15/month
```

## Secrets Management

### Secrets Strategy

**Development Environment**
```
Method: .env.local files (not committed to git)

Example:
DATABASE_URL=postgresql://user:pass@localhost/db
JWT_SECRET=dev-secret-key-do-not-use-in-prod
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Production Environment**
```
Method: Cloud provider secrets manager

Vercel (Frontend):
- Environment Variables in Vercel Dashboard
- Encrypted at rest
- Available at build and runtime

Cloud Run (Backend):
- Google Secret Manager
- Mounted as environment variables
- Automatic rotation support
- IAM-based access control

Best Practices:
✅ Never commit secrets to git
✅ Use different secrets per environment
✅ Rotate secrets regularly
✅ Audit secret access
✅ Use least privilege access
```

## Backup and Disaster Recovery

### Database Backup Strategy

**Neon PostgreSQL Backups**
```
Automatic Backups:
- Point-in-time recovery (PITR)
- 7 days retention (Free tier)
- 30 days retention (Pro tier)
- Stored in cloud storage

Backup Schedule:
- Continuous WAL archiving
- Daily full backups
- Instant recovery to any point in time

Recovery Time Objective (RTO): < 5 minutes
Recovery Point Objective (RPO): < 1 minute

Manual Backups:
- Create branch from main database
- Export to SQL dump (pg_dump)
- Store in S3 or cloud storage
```

### Application Backup Strategy

**Code and Configuration**
```
- Git repository (GitHub) - Primary source of truth
- Tagged releases for each deployment
- Infrastructure as Code in repository
- Configuration files version controlled
```

**User Data**
```
- Database backups (see above)
- File uploads (if any) → S3 with versioning
- Session data → Redis with persistence
```

### Disaster Recovery Plan

**Scenario 1: Database Failure**
```
Detection: Health checks fail, monitoring alerts
Response Time: < 5 minutes

Steps:
1. Verify issue (database unreachable)
2. Check Neon status page
3. Restore from PITR backup
4. Update connection string if needed
5. Verify application functionality
6. Post-mortem analysis

Fallback: Restore to new Neon instance from backup
```

**Scenario 2: Application Deployment Failure**
```
Detection: Post-deployment health checks fail
Response Time: < 2 minutes

Steps:
1. Stop deployment pipeline
2. Rollback to previous version (Cloud Run revision)
3. Verify rollback successful
4. Investigate failure cause
5. Fix and redeploy

Automatic Rollback: Yes (on health check failure)
```

**Scenario 3: Complete Platform Outage**
```
Detection: All services unreachable
Response Time: < 15 minutes

Steps:
1. Declare incident
2. Communicate via status page
3. Deploy to backup region/platform
4. Update DNS to point to backup
5. Restore database from backup
6. Verify full functionality

Backup Platform: AWS (if primary is GCP)
```

## Cost Optimization Strategy

### Current Cost Estimate (Small App, 1000 users)

```
Frontend (Vercel):
- Pro Plan: $20/month
- Bandwidth: Included (100GB)
Total: ~$20/month

Backend (Cloud Run):
- Compute: $25/month (low traffic)
- Network egress: $5/month
Total: ~$30/month

Database (Neon):
- Pro Plan: $19/month
- Storage (10GB): $1.40/month
Total: ~$20/month

Monitoring (Sentry):
- Team Plan: $26/month
Total: ~$26/month

Domain & SSL:
- Domain: $12/year
- SSL: Free (Let's Encrypt)
Total: ~$1/month

───────────────────────────
TOTAL: ~$97/month
```

### Cost Optimization Tips

**Optimize Compute**
```
✅ Use auto-scaling with appropriate min/max instances
✅ Right-size instances (don't over-provision)
✅ Use spot instances for non-critical workloads
✅ Implement connection pooling to reduce database compute
```

**Optimize Storage**
```
✅ Compress images before upload
✅ Use CDN for static assets
✅ Implement soft delete cleanup (archive old data)
✅ Use appropriate database indexes (reduce scan costs)
```

**Optimize Bandwidth**
```
✅ Enable compression (gzip, brotli)
✅ Use CDN for global distribution
✅ Implement proper caching headers
✅ Optimize bundle sizes (code splitting, tree shaking)
```

**Optimize Monitoring**
```
✅ Sample high-volume traces (don't log everything)
✅ Use log levels appropriately
✅ Set data retention limits
✅ Use free tiers where possible (CloudWatch, Sentry)
```

## Documentation Deliverables

### 1. Deployment Architecture Diagram
```
Complete visual representation:
- All services and their relationships
- Data flow and communication patterns
- Scaling configuration
- Monitoring and alerting setup
```

### 2. CI/CD Pipeline Specification
```
Detailed pipeline configuration:
- Stage definitions
- Trigger conditions
- Test execution
- Deployment steps
- Rollback procedures
```

### 3. Scaling Configuration Document
```
Auto-scaling specifications:
- Min/max instances
- Scaling triggers and thresholds
- Resource limits
- Cost implications
```

### 4. Monitoring & Alerting Plan
```
Complete monitoring strategy:
- Metrics to track
- Alerting rules and thresholds
- Dashboard designs
- On-call procedures
```

### 5. Runbooks
```
Operational procedures for:
- Deployment process
- Rollback process
- Incident response
- Database maintenance
- Scaling operations
```

### 6. Disaster Recovery Plan
```
Recovery procedures:
- Backup strategy
- Recovery steps
- RTO and RPO targets
- Failover procedures
```

## When to Use This Skill

✅ **Use For:**
- Planning production deployment strategy
- Designing scaling and monitoring architecture
- Creating operational procedures and runbooks
- Planning disaster recovery approach
- Optimizing infrastructure costs

✅ **Use Before:**
- Deploying to production
- Setting up CI/CD pipelines
- Implementing monitoring
- Creating infrastructure code
- Launching to users

❌ **Don't Use For:**
- Writing actual infrastructure code (Terraform, CloudFormation)
- Implementing CI/CD pipelines
- Debugging production issues
- Day-to-day operations

## Example Output

```markdown
# Deployment & Operations Plan: Todo Application

## Deployment Architecture
- Frontend: Vercel (Next.js with Edge Functions)
- Backend: Google Cloud Run (FastAPI containers, 1-20 instances)
- Database: Neon PostgreSQL (auto-scaling compute, connection pooling)

## CI/CD Pipeline
6-stage pipeline: Build → Test → Scan → Preview → Deploy → Monitor
Deployment time: ~8 minutes from commit to production
Automatic rollback on health check failure

## Auto-Scaling Configuration
Frontend: Automatic (Vercel Edge)
Backend: 1-20 instances, scale on CPU > 70%
Database: 0.25-2 CU based on load

## Monitoring & Alerting
Tools: Sentry (errors) + CloudWatch (infrastructure)
Critical alerts: Uptime < 99%, error rate > 10%, DB failures
Dashboard: Real-time metrics for response time, error rate, traffic

## Disaster Recovery
Database: PITR backups, 7-day retention, <5 min RTO
Application: Automatic rollback to previous version
Backup region: AWS (if GCP primary fails)

## Cost Estimate
Total: ~$97/month (1000 users, low-medium traffic)
Breakdown: Vercel $20 + Cloud Run $30 + Neon $20 + Monitoring $26

## Next Steps
1. Approve deployment architecture
2. Set up infrastructure (accounts, billing)
3. Implement CI/CD pipeline
4. Configure monitoring and alerts
5. Deploy to staging for testing
6. Production launch with monitoring
```

## Best Practices

### Deployment Planning
- Plan for zero-downtime deployments
- Implement gradual rollouts (canary, blue-green)
- Always have a rollback strategy
- Test deployments in staging first

### Operational Excellence
- Automate everything possible
- Monitor proactively, not reactively
- Document all procedures
- Implement chaos engineering

### Cost Management
- Set budget alerts
- Review costs monthly
- Optimize based on actual usage
- Use reserved instances for predictable workloads

### Security
- Rotate secrets regularly
- Implement least privilege access
- Scan for vulnerabilities continuously
- Keep dependencies updated
