# Project History Record: Event-Driven Architecture Specification

**Feature**: 006-event-driven-aws-deployment
**Date**: February 8, 2026
**Type**: Infrastructure Transformation
**Status**: Specification Complete ✅

---

## Overview

This PHR documents the creation of the Event-Driven Architecture specification that transforms the existing Todo application into a production-ready, cloud-native, microservices-based system using AWS EKS, Dapr runtime, and Kafka/Redpanda for event streaming.

---

## What Was Created

### 1. Feature Specification
- **File**: `specs/006-event-driven-aws-deployment/spec.md`
- **Size**: 22 KB
- **Branch**: `006-event-driven-aws-deployment`
- **Sections**: 6 User Stories, 46 Functional Requirements, 12 Success Criteria

### 2. Quality Checklist
- **File**: `specs/006-event-driven-aws-deployment/checklists/requirements.md`
- **Status**: All validation checks PASSED ✅
- **Ready for**: `/speckit.plan` command

### 3. Reusable Prompt Templates
- **Quick Reference**: `PROMPT_EXAMPLES.md` (root directory)
- **Detailed Template**: `.specify/templates/infrastructure-deployment-prompt-template.md`
- **Purpose**: Reusable for future infrastructure specs

---

## The Original Prompt (For Future Reference)

```markdown
/sp.specify SPEC.SPECIFY PROMPT
Scope: Event-Driven Architecture + Dapr + AWS Cloud Deployment

CONTEXT
Intermediate and Advanced application-level features
(Priorities, Tags, Search, Filter, Sort, Due Dates, Recurring Tasks, Reminders logic)
are already fully implemented and integrated in the frontend and backend.

This specification MUST NOT redefine or reimplement those features.

The purpose of this specification is to integrate ALL REMAINING
INFRASTRUCTURE, EVENT-DRIVEN, AND CLOUD-NATIVE COMPONENTS
on top of the existing working application.

TECH STACK (FIXED)
Frontend:
- Next.js (App Router)
- TypeScript
- Tailwind CSS

Backend:
- FastAPI (Python)
- MCP tools
- PostgreSQL (Neon – external)

Cloud & Infrastructure (AWS ONLY):
- AWS EKS (Elastic Kubernetes Service)
- AWS ECR (Container Registry)
- AWS IAM
- AWS CloudWatch (Logs & Metrics)

Event & Runtime:
- Kafka-compatible broker (Redpanda Cloud)
- Dapr (Full Runtime on Kubernetes)

CI/CD:
- GitHub Actions

SCOPE (INCLUDE)

EVENT-DRIVEN ARCHITECTURE
Define and integrate an event-driven architecture where:
- The Chat API publishes events for all task lifecycle actions
- Services communicate asynchronously via Kafka topics
- No direct service-to-service business logic coupling exists

KAFKA / REDPANDA
Define the following Kafka topics:
- task-events
- reminders
- task-updates

Specify:
- Producers for each topic
- Consumers for each topic
- Event schema definitions
- Message flow and responsibility boundaries

Use Redpanda Cloud (Kafka-compatible) as the managed broker.

DAPR INTEGRATION (FULL)
Specify full Dapr usage across all services:

1) Pub/Sub
   - Kafka abstraction via Dapr
   - Backend publishes events through Dapr, not Kafka clients

2) State Management
   - PostgreSQL (Neon) via Dapr state store
   - Define which data is accessed via state APIs

3) Service Invocation
   - Frontend → Backend calls via Dapr sidecar
   - Internal service-to-service calls via Dapr

4) Bindings
   - Cron binding for scheduled reminder checks

5) Secrets Management
   - AWS Kubernetes Secrets via Dapr secret store
   - No secrets in code or plain env files

MICROSERVICES (DEFINE CLEARLY)
Specify the following services as separate deployable units:

1) Frontend Service (Next.js)
2) Chat API / Backend Service (FastAPI + MCP)
3) Notification Service
4) Recurring Task Service
5) Audit / Activity Log Service
6) Realtime Sync / WebSocket Service

Each service must:
- Run as a container
- Have a Dapr sidecar
- Have clear input/output responsibilities

AWS KUBERNETES (EKS)
Specify AWS-based Kubernetes deployment:

- EKS cluster configuration (high-level)
- Namespaces for services and infrastructure
- Kubernetes manifests or Helm structure
- Dapr installed on EKS
- Ingress configuration (AWS ALB)

CONTAINERIZATION
Specify:
- Dockerfile standards for frontend and backend
- Multi-stage builds where applicable
- Image tagging strategy
- Push images to AWS ECR

CI/CD (GITHUB ACTIONS)
Specify a CI/CD pipeline that:
- Builds Docker images
- Pushes images to AWS ECR
- Deploys to AWS EKS
- Supports environment-based configuration

MONITORING & LOGGING
Specify:
- Centralized logging using AWS CloudWatch
- Basic metrics and health checks
- Readiness and liveness probes

OUT OF SCOPE (DO NOT INCLUDE)
- Reimplementation of Intermediate or Advanced features
- UI/UX redesign
- Non-AWS cloud providers
- Serverless (Lambda, Fargate)
- Background workers outside Kubernetes

DELIVERABLES
- Detailed infrastructure and integration specification
- Event schemas and topic responsibilities
- Dapr component specifications (YAML-level)
- AWS EKS deployment structure
- CI/CD workflow description

SUCCESS CRITERIA
This specification is successful when:
- The existing application is transformed into an event-driven system
- Kafka is fully abstracted via Dapr
- All services run on AWS EKS
- The system is scalable, observable, and production-ready
- No core business logic needs refactoring

MINDSET
Assume this system will be used in real production.
Design for failure, scaling, and future extension.
No shortcuts.
```

---

## Specification Highlights

### Architecture Transformation

**From**: Monolithic Next.js + FastAPI application
**To**: Event-driven microservices architecture

**Services Created**:
1. Frontend Service (Next.js + Dapr)
2. Backend/Chat API (FastAPI + Dapr)
3. Notification Service (Event consumer)
4. Recurring Task Service (Event consumer)
5. Audit/Activity Log Service (Event consumer)
6. Realtime Sync/WebSocket Service (Event consumer)

### Event-Driven Design

**Kafka Topics**:
- `task-events`: Task creation, deletion, completion
- `task-updates`: Task field modifications
- `reminders`: Reminder due notifications

**Event Flow**:
1. Backend publishes events via Dapr pub/sub
2. Events routed through Redpanda Cloud (Kafka-compatible)
3. Multiple consumers process events independently
4. No direct service-to-service coupling

### Dapr Integration (Full Stack)

**Capabilities Used**:
1. **Pub/Sub**: Kafka abstraction for event publishing
2. **State Management**: PostgreSQL access via Dapr state store
3. **Service Invocation**: Inter-service HTTP calls with retry/circuit-breaking
4. **Bindings**: Cron binding for scheduled reminder checks (every 1 minute)
5. **Secrets Management**: Kubernetes secrets integration

### Cloud Infrastructure (AWS)

**Components**:
- **AWS EKS**: Kubernetes cluster (minimum 3 nodes)
- **AWS ECR**: Container registry with vulnerability scanning
- **AWS CloudWatch**: Centralized logging and metrics
- **AWS ALB**: Application Load Balancer for ingress

**Namespaces**:
- `todo-prod`: Production services
- `todo-staging`: Staging/testing environment
- `todo-infra`: Infrastructure components (Dapr, monitoring)

### CI/CD Pipeline (GitHub Actions)

**Workflow**:
1. Trigger on push to `main` or pull request
2. Run unit and integration tests
3. Build multi-stage Docker images
4. Push to AWS ECR with tags (latest, commit SHA, semantic version)
5. Deploy to staging automatically
6. Manual approval gate for production
7. Rolling update with zero downtime
8. Automatic rollback on health check failures

---

## Success Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| Uptime | 99.9% | Max 43 minutes downtime per month |
| Concurrent Users | 10,000 | With <500ms response time (95th percentile) |
| Event Latency | <2 seconds | Publication to consumption (99% of events) |
| Deployment Time | <10 minutes | Automated deployment to staging |
| MTTR | <5 minutes | Mean time to recovery for failures |
| Reminder Accuracy | 99.5% | Delivered within 2 minutes of scheduled time |
| Infrastructure Cost | <$500/month | Baseline load with predictable scaling |
| Security | 100% | All inter-service traffic encrypted via mTLS |

---

## Requirements Summary

### Functional Requirements: 46 Total

**Event-Driven Architecture** (7 requirements):
- Event publishing for task lifecycle (create, update, delete, complete)
- Event schemas with correlation IDs
- Dapr pub/sub integration

**Microservices Architecture** (7 requirements):
- 6 independent services with clear boundaries
- Containerized deployments
- Dapr sidecars for each service

**Dapr Integration** (6 requirements):
- Full usage of pub/sub, state, invocation, bindings, secrets
- No direct Kafka or database clients in application code

**AWS EKS Deployment** (7 requirements):
- Minimum 3-node cluster
- Multiple replicas per service
- Horizontal pod autoscaling
- Resource requests/limits

**Containerization** (5 requirements):
- Multi-stage Dockerfiles
- Git SHA and semantic version tagging
- Non-root container users
- AWS ECR with vulnerability scanning

**CI/CD Pipeline** (7 requirements):
- GitHub Actions workflows
- Automated build, test, push, deploy
- Environment-based configuration
- Rolling updates with rollback

**Monitoring & Logging** (7 requirements):
- CloudWatch Logs (JSON format)
- Metrics collection (CPU, memory, latency, errors)
- Liveness and readiness probes
- Real-time dashboards

---

## Key Decisions & Assumptions

### Decisions Made

1. **Redpanda Cloud** chosen over self-hosted Kafka (managed service reduces operational overhead)
2. **Dapr runtime** selected for service mesh capabilities (simpler than Istio/Linkerd)
3. **AWS EKS** for orchestration (requirement specified in prompt)
4. **Kubernetes Secrets** for secret management (cost optimization vs AWS Secrets Manager)
5. **Neon PostgreSQL** retained as external database (no migration to AWS RDS)
6. **GitHub Actions** for CI/CD (already in use, tight Git integration)
7. **CloudEvents** specification for event schemas (industry standard, interoperability)

### Assumptions

1. AWS account has sufficient permissions and quotas
2. Existing application code requires minimal changes (only Dapr SDK additions)
3. Backward compatibility maintained during migration
4. Development and production use separate AWS accounts/namespaces
5. Event consumers are idempotent (handle duplicate delivery)
6. All services use UTC for timestamps
7. Schema evolution follows backward-compatible patterns
8. Gradual rollout strategy: staging → canary → production

---

## Edge Cases Addressed

1. **Kafka broker downtime**: Dapr retries with exponential backoff, dead-letter queue for failures
2. **Dapr sidecar crashes**: Kubernetes auto-restarts, ~5-10s recovery time
3. **EKS capacity exhaustion**: Cluster autoscaler provisions nodes, alerts on quota limits
4. **Database connection pool exhaustion**: Configurable limits, queue or fail-fast behavior
5. **Event schema changes**: Versioned topics, backward-compatible consumers
6. **Clock skew**: NTP-synchronized clocks, UTC timestamps, offset-based ordering
7. **Duplicate event delivery**: Idempotent consumers, unique event IDs, database constraints

---

## Out of Scope (Explicitly Excluded)

- ❌ Reimplementation of existing business logic (priorities, tags, search, filters, recurring tasks, reminders)
- ❌ UI/UX redesign or frontend feature enhancements
- ❌ Migration to non-AWS cloud providers (Azure, GCP)
- ❌ Serverless architecture (AWS Lambda, Fargate)
- ❌ Self-hosted Kafka cluster management
- ❌ Advanced service mesh features beyond Dapr (Istio traffic splitting)
- ❌ Multi-region deployment and global load balancing
- ❌ AI/ML integration or recommendation engine
- ❌ Mobile app development (iOS, Android)
- ❌ Third-party integrations (Slack, email, SMS)

---

## Dependencies

### External Services
- Redpanda Cloud (Kafka-compatible message broker)
- Neon PostgreSQL (managed database)
- AWS EKS (Kubernetes cluster)
- AWS ECR (container registry)
- AWS CloudWatch (logging and monitoring)

### Infrastructure
- AWS account with IAM permissions for EKS, ECR, CloudWatch
- GitHub repository with Actions enabled
- Domain name for ingress (optional, can use ALB DNS)

### Tooling Required
- Dapr CLI and runtime (v1.12+)
- kubectl (Kubernetes CLI)
- Helm (package manager)
- Docker (container runtime)
- AWS CLI (for ECR, EKS access)

### Knowledge/Skills
- Kubernetes fundamentals (pods, deployments, services)
- Dapr concepts (pub/sub, state management, service invocation)
- Event-driven architecture patterns
- CI/CD pipeline design
- AWS cloud services

---

## Risk Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Kafka broker downtime | High | Low | Dapr retries + dead-letter queues + event replay |
| Dapr sidecar crashes | High | Medium | Kubernetes auto-restart + circuit breakers |
| AWS EKS cost overrun | Medium | Medium | Resource quotas + Spot instances + billing alerts |
| Schema evolution breaks consumers | High | Medium | Schema versioning + backward compatibility + deploy consumers first |
| Network latency impacts events | Medium | Low | Regional deployment + payload optimization + caching |
| Secret rotation causes outages | Medium | Low | Graceful reloading + staging tests + volume mounts |

---

## Next Steps

### Immediate Actions
1. ✅ Specification complete and validated
2. ⏭️ Run `/speckit.plan` to generate implementation plan
3. ⏭️ Review and approve implementation plan
4. ⏭️ Run `/speckit.implement` to execute tasks

### Implementation Phases

**Phase 1: Core Infrastructure** (Priority P1)
- AWS EKS cluster setup
- Dapr runtime installation
- Basic containerization
- Health monitoring

**Phase 2: Event Architecture** (Priority P2)
- Redpanda Cloud configuration
- Event schema definitions
- Backend event publishing
- Consumer services (Notification, Recurring Task, Audit)

**Phase 3: CI/CD & Operations** (Priority P2/P3)
- GitHub Actions workflows
- Automated deployments
- CloudWatch logging
- Metrics dashboards

---

## Validation Results

**Specification Quality Checklist**: ✅ ALL PASSED

- ✅ No implementation details leak into spec
- ✅ Focused on user value and business needs
- ✅ Written for non-technical stakeholders
- ✅ All mandatory sections completed
- ✅ No [NEEDS CLARIFICATION] markers remain
- ✅ Requirements are testable and unambiguous
- ✅ Success criteria are measurable (quantitative metrics)
- ✅ Success criteria are technology-agnostic
- ✅ All acceptance scenarios defined
- ✅ Edge cases identified (7 cases documented)
- ✅ Scope clearly bounded (10 exclusions listed)
- ✅ Dependencies and assumptions documented

---

## Files Created

```
phase-5/
├── specs/
│   └── 006-event-driven-aws-deployment/
│       ├── spec.md                         # Main specification (22 KB)
│       └── checklists/
│           └── requirements.md             # Validation checklist (2.6 KB)
├── docs/
│   └── PHR-006-EVENT-DRIVEN-ARCHITECTURE.md  # This file
├── PROMPT_EXAMPLES.md                      # Quick reference prompts
└── .specify/
    └── templates/
        └── infrastructure-deployment-prompt-template.md  # Detailed template
```

---

## References

- **Spec File**: `specs/006-event-driven-aws-deployment/spec.md`
- **Checklist**: `specs/006-event-driven-aws-deployment/checklists/requirements.md`
- **Branch**: `006-event-driven-aws-deployment`
- **Prompt Templates**: `PROMPT_EXAMPLES.md`
- **Detailed Template**: `.specify/templates/infrastructure-deployment-prompt-template.md`

---

## Approval & Sign-off

**Specification Status**: ✅ Ready for Implementation Planning

**Created By**: Claude Code (Sonnet 4.5)
**Date**: February 8, 2026
**Validated**: All quality checks passed
**Next Command**: `/speckit.plan`

---

## Notes

- This specification preserves ALL existing business logic
- No refactoring of current features required
- Focus is purely on infrastructure transformation
- Event-driven architecture enables future extensibility
- Production rollout should be gradual: staging → canary → production
- Monitor costs weekly during initial deployment
- All services must be independently testable

---

**End of Project History Record**

For questions or clarifications, refer to the specification file or consult the implementation plan (to be generated via `/speckit.plan`).
