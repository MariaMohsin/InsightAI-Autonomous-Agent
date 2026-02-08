# Reusable Specification Prompts

This file contains ready-to-use prompt templates for creating specifications with `/sp.specify`.

---

## 1. Event-Driven Architecture + Cloud Deployment

**Use Case**: Transform existing app into event-driven microservices on cloud

```
/sp.specify Event-Driven Architecture with [Runtime] on [Cloud Platform]

CONTEXT
[List existing features] are already implemented.
This spec focuses on infrastructure, event-driven patterns, and cloud deployment only.

TECH STACK (FIXED)
Frontend: [Framework + Language + Styling]
Backend: [Framework + Language + Database]
Cloud: [Provider + Orchestration + Container Registry + Monitoring]
Events: [Message Broker + Service Mesh/Runtime]
CI/CD: [Platform]

SCOPE
- Event-driven architecture with [Broker]
- [Number] microservices: [Service 1], [Service 2], [Service 3]...
- Full [Runtime] integration (pub/sub, state, invocation, bindings, secrets)
- [Cloud] Kubernetes deployment
- Containerization with multi-stage builds
- CI/CD pipeline with [Platform]
- Centralized logging and monitoring

OUT OF SCOPE
- Reimplementation of existing features
- UI/UX changes
- Non-[Cloud Provider] clouds
- Serverless architectures

SUCCESS CRITERIA
- [Uptime %] availability
- [Number] concurrent users with <[Time]ms response
- Event latency <[Time] seconds
- Zero-downtime deployments
- Infrastructure cost <$[Amount]/month

DELIVERABLES
- Infrastructure specification
- Event schemas
- [Runtime] component specs (YAML)
- [Cloud] deployment structure
- CI/CD workflow
```

---

## 2. The Actual Prompt Used (006-event-driven-aws-deployment)

```
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

## 3. Quick Copy-Paste Templates

### Template A: Simple Cloud Migration

```
/sp.specify Migrate [App Name] to [Cloud Provider]

CONTEXT
Existing app with [list features] already working locally.
Need cloud deployment only - no feature changes.

TECH STACK
Frontend: [Framework]
Backend: [Framework]
Database: [Type] ([Managed Service])
Cloud: [Provider] ([Services needed])

SCOPE
- Containerize all services
- Deploy to [Cloud Orchestration]
- CI/CD with [Platform]
- Monitoring and logging
- Auto-scaling configuration

OUT OF SCOPE
- Feature development
- Architecture changes
- UI/UX redesign

SUCCESS CRITERIA
- 99.9% uptime
- <[X]ms response time
- Cost <$[Amount]/month
- Zero-downtime deployments
```

### Template B: Add Microservices

```
/sp.specify Split [Service Name] into Microservices

CONTEXT
Existing monolithic [service] handles [responsibilities].
Need to split into independent services for scalability.

SERVICES TO CREATE
1) [Service 1]: [Responsibility]
2) [Service 2]: [Responsibility]
3) [Service 3]: [Responsibility]

COMMUNICATION
- [Pattern]: REST / gRPC / Events / Message Queue

SCOPE
- Define service boundaries
- API contracts
- Data ownership
- Deployment strategy

OUT OF SCOPE
- Feature changes
- Database migration (shared DB for now)

SUCCESS CRITERIA
- Services independently deployable
- <[X]ms inter-service latency
- Gradual rollout (canary deployments)
```

### Template C: Add Event-Driven Pattern

```
/sp.specify Add Event-Driven Architecture to [App Name]

CONTEXT
Existing app uses synchronous API calls.
Need asynchronous event-driven communication.

EVENT TOPICS
- [topic-1]: [Purpose]
- [topic-2]: [Purpose]
- [topic-3]: [Purpose]

BROKER
[Kafka / RabbitMQ / Redis / SQS]

SCOPE
- Define event schemas
- Producers and consumers
- Event versioning strategy
- Idempotency guarantees
- Dead letter queues

OUT OF SCOPE
- UI changes
- Existing API endpoints (keep for backward compatibility)

SUCCESS CRITERIA
- Event latency <[X] seconds
- 99.99% delivery guarantee
- No duplicate processing
```

---

## How to Use These Prompts

1. **Copy** the appropriate template
2. **Replace** placeholders in [brackets]
3. **Paste** into Claude Code with `/sp.specify` command
4. **Review** generated specification
5. **Proceed** with `/speckit.plan` for implementation

---

## Tips

- Be **specific** about technologies (don't say "database", say "PostgreSQL")
- **Quantify** success criteria (use numbers!)
- **Exclude** what's not in scope (prevents scope creep)
- **Consider** costs upfront (add budget constraints)
- **Think** production-ready (monitoring, logging, security)

---

## File Locations

- This file: `./PROMPT_EXAMPLES.md`
- Detailed template: `./.specify/templates/infrastructure-deployment-prompt-template.md`
- Generated specs: `./specs/[number]-[feature-name]/spec.md`
