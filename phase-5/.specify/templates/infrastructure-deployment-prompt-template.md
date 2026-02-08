# Infrastructure & Cloud Deployment Specification Prompt Template

Use this template when you need to create specifications for transforming existing applications into cloud-native, event-driven, or microservices architectures.

---

## Template Prompt

```
/sp.specify SPEC.SPECIFY PROMPT
Scope: [Architecture Type] + [Infrastructure Platform] + [Deployment Target]

CONTEXT
[List existing features/functionality that are already implemented]
are already fully implemented and integrated in the frontend and backend.

This specification MUST NOT redefine or reimplement those features.

The purpose of this specification is to integrate ALL REMAINING
[INFRASTRUCTURE/EVENT-DRIVEN/CLOUD-NATIVE] COMPONENTS
on top of the existing working application.

TECH STACK (FIXED)
Frontend:
- [Framework] (e.g., Next.js, React, Vue)
- [Language] (e.g., TypeScript, JavaScript)
- [Styling] (e.g., Tailwind CSS, Material-UI)

Backend:
- [Framework] (e.g., FastAPI, Express, Django)
- [Additional Tools] (e.g., MCP tools, GraphQL)
- [Database] (e.g., PostgreSQL, MongoDB) – [Hosted where]

Cloud & Infrastructure ([Cloud Provider] ONLY):
- [Orchestration] (e.g., AWS EKS, GCP GKE, Azure AKS)
- [Container Registry] (e.g., AWS ECR, Docker Hub)
- [IAM/Auth] (e.g., AWS IAM, GCP IAM)
- [Logging/Monitoring] (e.g., CloudWatch, Stackdriver, Azure Monitor)

Event & Runtime:
- [Message Broker] (e.g., Kafka, RabbitMQ, Redis Streams)
- [Service Mesh/Runtime] (e.g., Dapr, Istio, Linkerd)

CI/CD:
- [Platform] (e.g., GitHub Actions, GitLab CI, Jenkins)

SCOPE (INCLUDE)

[ARCHITECTURE PATTERN - e.g., EVENT-DRIVEN ARCHITECTURE]
Define and integrate an [architecture pattern] where:
- [Component A] publishes events for [specific actions]
- Services communicate [asynchronously/synchronously] via [mechanism]
- No direct [coupling type] exists

[MESSAGE BROKER - e.g., KAFKA / REDPANDA]
Define the following [broker] topics:
- [topic-1]
- [topic-2]
- [topic-3]

Specify:
- Producers for each topic
- Consumers for each topic
- Event schema definitions
- Message flow and responsibility boundaries

Use [Managed Service] as the managed broker.

[RUNTIME INTEGRATION - e.g., DAPR INTEGRATION] (FULL)
Specify full [runtime] usage across all services:

1) [Capability 1 - e.g., Pub/Sub]
   - [Details]

2) [Capability 2 - e.g., State Management]
   - [Details]

3) [Capability 3 - e.g., Service Invocation]
   - [Details]

4) [Capability 4 - e.g., Bindings]
   - [Details]

5) [Capability 5 - e.g., Secrets Management]
   - [Details]

MICROSERVICES (DEFINE CLEARLY)
Specify the following services as separate deployable units:

1) [Service Name 1] ([Tech Stack])
2) [Service Name 2] ([Tech Stack])
3) [Service Name 3] ([Tech Stack])
4) [Service Name 4] ([Tech Stack])
5) [Service Name 5] ([Tech Stack])

Each service must:
- Run as a container
- Have a [sidecar/agent] if applicable
- Have clear input/output responsibilities

[CLOUD ORCHESTRATION - e.g., AWS KUBERNETES (EKS)]
Specify [cloud provider]-based [orchestration] deployment:

- [Cluster] configuration (high-level)
- Namespaces for services and infrastructure
- [Manifests/Helm] structure
- [Runtime] installed on [orchestration platform]
- Ingress configuration ([Load Balancer Type])

CONTAINERIZATION
Specify:
- Dockerfile standards for frontend and backend
- Multi-stage builds where applicable
- Image tagging strategy
- Push images to [Container Registry]

CI/CD ([Platform])
Specify a CI/CD pipeline that:
- Builds Docker images
- Pushes images to [Container Registry]
- Deploys to [Orchestration Platform]
- Supports environment-based configuration

MONITORING & LOGGING
Specify:
- Centralized logging using [Logging Service]
- Basic metrics and health checks
- Readiness and liveness probes

OUT OF SCOPE (DO NOT INCLUDE)
- Reimplementation of [existing features]
- UI/UX redesign
- Non-[Cloud Provider] cloud providers
- [Architecture patterns to exclude]
- [Other exclusions]

DELIVERABLES
- Detailed infrastructure and integration specification
- Event schemas and topic responsibilities
- [Runtime] component specifications (YAML-level)
- [Cloud] deployment structure
- CI/CD workflow description

SUCCESS CRITERIA
This specification is successful when:
- The existing application is transformed into [target architecture]
- [Message Broker] is fully abstracted via [Runtime]
- All services run on [Cloud Platform]
- The system is scalable, observable, and production-ready
- No core business logic needs refactoring

MINDSET
Assume this system will be used in real production.
Design for failure, scaling, and future extension.
No shortcuts.
```

---

## Example Usage - Event-Driven Architecture on AWS

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

[... rest of the specification ...]
```

---

## Key Sections to Customize

1. **Scope Header**: Define what architecture pattern you're implementing
2. **Tech Stack**: List all fixed technologies (don't change during spec)
3. **Architecture Pattern**: Event-driven, Microservices, Serverless, etc.
4. **Message Broker**: Kafka, RabbitMQ, Redis, SQS, etc.
5. **Runtime/Service Mesh**: Dapr, Istio, Linkerd, or none
6. **Cloud Provider**: AWS, GCP, Azure (pick ONE)
7. **Microservices**: List all services to be created
8. **Out of Scope**: Explicitly state what's NOT being changed

---

## Tips for Creating Infrastructure Specs

1. **Preserve Existing Logic**: Always state existing features won't be reimplemented
2. **Be Specific About Cloud**: Pick ONE cloud provider, don't mix AWS + GCP
3. **Define Services Clearly**: Each microservice needs a clear responsibility
4. **Event Schemas**: Define topics, producers, consumers upfront
5. **Success Criteria**: Use measurable outcomes (99.9% uptime, <500ms response)
6. **Cost Awareness**: Include budget constraints in success criteria
7. **Security First**: Specify secrets management, mTLS, encryption
8. **Observability**: Logging, metrics, tracing, alerting requirements
9. **Deployment Strategy**: Zero-downtime, rolling updates, rollback plans
10. **Edge Cases**: Network failures, broker downtime, schema evolution

---

## Common Patterns

### Pattern 1: Monolith → Microservices
- Define service boundaries
- Specify inter-service communication (REST, gRPC, events)
- Database per service or shared database
- Gradual migration strategy

### Pattern 2: Synchronous → Event-Driven
- Identify domain events
- Define topics/queues
- Specify event schemas
- Idempotency requirements

### Pattern 3: On-Premise → Cloud
- Cloud provider selection
- Containerization strategy
- CI/CD automation
- Cost optimization

### Pattern 4: Manual Deployment → GitOps
- Git as source of truth
- Automated pipelines
- Environment promotion
- Rollback mechanisms

---

## Validation Checklist

Before submitting the spec, verify:

- ✅ No existing features are reimplemented
- ✅ All services have clear responsibilities
- ✅ Event schemas are defined
- ✅ Success criteria are measurable (numbers!)
- ✅ Out of scope is explicitly stated
- ✅ Cloud provider is consistent (no mixing)
- ✅ Security requirements specified
- ✅ Cost constraints mentioned
- ✅ Edge cases considered
- ✅ Dependencies listed

---

## File Location

Save this prompt template to:
```
.specify/templates/infrastructure-deployment-prompt-template.md
```

Access it anytime to create similar infrastructure specifications.
