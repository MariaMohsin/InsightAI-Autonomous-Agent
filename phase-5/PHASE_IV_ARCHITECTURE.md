# Phase IV: Deployment Architecture

## 📁 Project Structure (Phase IV Files)

```
todo-chatbot-ui/
│
├── frontend/
│   ├── Dockerfile                    ✨ NEW - Multi-stage Next.js build
│   ├── .dockerignore                 ✨ NEW - Docker build optimization
│   ├── next.config.ts                ✏️ UPDATED - Added standalone output
│   └── ... (existing Next.js files)
│
├── backend/
│   ├── Dockerfile                    ✏️ UPDATED - Port 8000 for K8s
│   ├── .dockerignore                 (existing)
│   └── ... (existing FastAPI files)
│
├── helm/                             ✨ NEW - Helm Charts Directory
│   │
│   ├── frontend/
│   │   ├── Chart.yaml               - Frontend chart metadata
│   │   ├── values.yaml              - Frontend configuration
│   │   └── templates/
│   │       ├── deployment.yaml      - Frontend K8s Deployment
│   │       └── service.yaml         - Frontend K8s Service (NodePort)
│   │
│   └── backend/
│       ├── Chart.yaml               - Backend chart metadata
│       ├── values.yaml              - Backend configuration
│       └── templates/
│           ├── deployment.yaml      - Backend K8s Deployment
│           └── service.yaml         - Backend K8s Service (ClusterIP)
│
├── deploy-to-minikube.sh            ✨ NEW - Automated deployment (Linux/Mac)
├── deploy-to-minikube.bat           ✨ NEW - Automated deployment (Windows)
│
├── PHASE_IV_DEPLOYMENT.md           ✨ NEW - Complete step-by-step guide
├── KUBERNETES_QUICK_REFERENCE.md    ✨ NEW - Quick command reference
├── README_PHASE_IV.md               ✨ NEW - Overview and summary
└── PHASE_IV_ARCHITECTURE.md         ✨ NEW - This file
```

---

## 🏗️ Deployment Architecture

### Local Development (Phase III)
```
┌─────────────────────────────────────────────────────────┐
│                     Your Computer                        │
│                                                          │
│  ┌──────────┐        ┌──────────┐       ┌──────────┐   │
│  │ Browser  │───────▶│ Next.js  │──────▶│  FastAPI │   │
│  │          │        │  :3000   │       │   :8000  │   │
│  └──────────┘        └──────────┘       └────┬─────┘   │
│                                               │          │
│                       ┌───────────────────────┴──────┐  │
│                       │                              │  │
│                       ▼                              ▼  │
│                 ┌──────────┐                 ┌─────────┐│
│                 │ Postgres │                 │ Ollama  ││
│                 │  :5432   │                 │ :11434  ││
│                 └──────────┘                 └─────────┘│
└─────────────────────────────────────────────────────────┘
```

### Kubernetes Deployment (Phase IV)
```
┌────────────────────────────────────────────────────────────────────┐
│                          Your Computer                              │
│                                                                     │
│  ┌──────────┐                                                      │
│  │ Browser  │                                                      │
│  └─────┬────┘                                                      │
│        │                                                           │
│        │ http://192.168.49.2:30080                                │
│        │                                                           │
│  ┌─────▼──────────────────────────────────────────────────────┐  │
│  │              Minikube (Kubernetes Cluster)                  │  │
│  │                                                             │  │
│  │  ┌───────────────────────────────────────────────────┐    │  │
│  │  │  NodePort Service (todo-chatbot-frontend:30080)   │    │  │
│  │  └───────────────────┬───────────────────────────────┘    │  │
│  │                      │                                      │  │
│  │  ┌───────────────────▼───────────────────────────────┐    │  │
│  │  │          Frontend Deployment                       │    │  │
│  │  │  ┌──────────────────────────────────────────┐     │    │  │
│  │  │  │  Pod: todo-chatbot-frontend-xxx          │     │    │  │
│  │  │  │  ┌────────────────────────────────┐     │     │    │  │
│  │  │  │  │  Container: Next.js :3000      │     │     │    │  │
│  │  │  │  │  Image: todo-chatbot-frontend  │     │     │    │  │
│  │  │  │  └────────────┬───────────────────┘     │     │    │  │
│  │  │  └───────────────┼─────────────────────────┘     │    │  │
│  │  └──────────────────┼───────────────────────────────┘    │  │
│  │                     │ http://todo-chatbot-backend:8000   │  │
│  │  ┌──────────────────▼───────────────────────────────┐    │  │
│  │  │    ClusterIP Service (todo-chatbot-backend)      │    │  │
│  │  └──────────────────┬───────────────────────────────┘    │  │
│  │                     │                                      │  │
│  │  ┌──────────────────▼───────────────────────────────┐    │  │
│  │  │          Backend Deployment                       │    │  │
│  │  │  ┌──────────────────────────────────────────┐    │    │  │
│  │  │  │  Pod: todo-chatbot-backend-xxx           │    │    │  │
│  │  │  │  ┌────────────────────────────────┐     │    │    │  │
│  │  │  │  │  Container: FastAPI :8000      │     │    │    │  │
│  │  │  │  │  Image: todo-chatbot-backend   │     │    │    │  │
│  │  │  │  └────┬───────────────────┬───────┘     │    │    │  │
│  │  │  └───────┼───────────────────┼─────────────┘    │    │  │
│  │  └──────────┼───────────────────┼──────────────────┘    │  │
│  │             │                   │                         │  │
│  └─────────────┼───────────────────┼─────────────────────────┘  │
│                │                   │                             │
│    ┌───────────▼──────────┐       │                             │
│    │   Postgres (Neon)    │       │                             │
│    │   External Service   │       │                             │
│    └──────────────────────┘       │                             │
│                                    │                             │
│    ┌───────────────────────────────▼──────┐                     │
│    │  Ollama :11434                       │                     │
│    │  (host.minikube.internal:11434)      │                     │
│    └──────────────────────────────────────┘                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow

### User Creates a Todo
```
1. Browser
   │
   ├─▶ http://192.168.49.2:30080/dashboard
   │
2. NodePort Service :30080
   │
   ├─▶ Routes to Frontend Pod
   │
3. Frontend Pod (Next.js)
   │
   ├─▶ POST http://todo-chatbot-backend:8000/api/todos
   │
4. ClusterIP Service :8000
   │
   ├─▶ Routes to Backend Pod
   │
5. Backend Pod (FastAPI)
   │
   ├─▶ Validates request
   ├─▶ Saves to Postgres (Neon)
   │
   └─▶ Returns response
   │
6. Frontend Pod
   │
   ├─▶ Updates UI
   │
7. Browser
   │
   └─▶ Shows new todo
```

### User Chats with AI
```
1. Browser
   │
   ├─▶ POST to /api/chat
   │
2. Frontend Pod → Backend Pod
   │
3. Backend Pod
   │
   ├─▶ Receives chat message
   ├─▶ Connects to Ollama (host.minikube.internal:11434)
   ├─▶ Gets AI response
   ├─▶ Saves to database
   │
   └─▶ Returns AI response
   │
4. Frontend Pod → Browser
   │
   └─▶ Displays AI message
```

---

## 🐳 Container Images

### Frontend Image (Multi-Stage Build)
```
Stage 1: deps (node:20-alpine)
  - Install production dependencies
  ↓
Stage 2: builder (node:20-alpine)
  - Copy dependencies from deps stage
  - Copy source code
  - Run npm build
  - Generate .next/standalone
  ↓
Stage 3: runner (node:20-alpine)
  - Create non-root user (nextjs)
  - Copy only production files
  - Set permissions
  - Expose port 3000
  - Run node server.js

Result: ~200MB optimized image
```

### Backend Image (Single Stage)
```
Base: python:3.11-slim
  ↓
Install system dependencies (gcc, postgresql-client)
  ↓
Copy requirements.txt
  ↓
Install Python packages
  ↓
Copy application code
  ↓
Expose port 8000
  ↓
Health check endpoint /health
  ↓
Run uvicorn app.main:app

Result: ~500MB image with all dependencies
```

---

## ☸️ Kubernetes Resources

### Frontend Resources
```yaml
Deployment:
  - Name: todo-chatbot-frontend
  - Replicas: 1 (scalable)
  - Container: todo-chatbot-frontend:latest
  - Port: 3000
  - Resources:
      Requests: 250m CPU, 256Mi RAM
      Limits: 500m CPU, 512Mi RAM
  - Probes:
      Liveness: HTTP GET / :3000
      Readiness: HTTP GET / :3000

Service:
  - Name: todo-chatbot-frontend
  - Type: NodePort
  - Port: 3000
  - NodePort: 30080 (external access)
  - Selector: app=todo-chatbot-frontend
```

### Backend Resources
```yaml
Deployment:
  - Name: todo-chatbot-backend
  - Replicas: 1 (scalable)
  - Container: todo-chatbot-backend:latest
  - Port: 8000
  - Resources:
      Requests: 500m CPU, 512Mi RAM
      Limits: 1000m CPU, 1Gi RAM
  - Probes:
      Liveness: HTTP GET /health :8000
      Readiness: HTTP GET /health :8000

Service:
  - Name: todo-chatbot-backend
  - Type: ClusterIP (internal only)
  - Port: 8000
  - Selector: app=todo-chatbot-backend
```

---

## 🔐 Security Considerations

### Current Setup (Dev/Learning)
- ✅ Non-root users in containers
- ✅ Resource limits to prevent resource exhaustion
- ✅ Health checks for reliability
- ✅ ReadOnly root filesystem (could be added)
- ⚠️ Secrets in values.yaml (plaintext)
- ⚠️ No network policies
- ⚠️ No pod security policies

### Production Recommendations
```yaml
# Use Kubernetes Secrets
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  db-password: <base64-encoded>
  jwt-secret: <base64-encoded>

# Network Policies
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-policy
spec:
  podSelector:
    matchLabels:
      app: todo-chatbot-backend
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: todo-chatbot-frontend

# Pod Security Standards
apiVersion: v1
kind: Pod
metadata:
  name: backend
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 1000
  containers:
  - name: backend
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
```

---

## 📊 Resource Allocation

### Current Allocation
```
Frontend Pod:
  - Request: 250m CPU (0.25 cores), 256Mi RAM
  - Limit:   500m CPU (0.5 cores),  512Mi RAM

Backend Pod:
  - Request: 500m CPU (0.5 cores),  512Mi RAM
  - Limit:   1000m CPU (1 core),     1Gi RAM

Total Cluster Requirements:
  - Minimum: 750m CPU (0.75 cores), 768Mi RAM
  - Maximum: 1500m CPU (1.5 cores),  1.5Gi RAM
```

### Scaling Example (3 backend replicas)
```
Frontend (1 replica):  0.25-0.5 CPU, 256-512Mi
Backend (3 replicas):  1.5-3 CPU,    1.5-3Gi

Total: 1.75-3.5 CPU, 1.75-3.5Gi RAM
```

---

## 🔄 CI/CD Pipeline (Future Enhancement)

```
┌─────────────────────────────────────────────────────┐
│ Developer                                            │
│   │                                                  │
│   ├─▶ git push                                      │
│   │                                                  │
│   ▼                                                  │
│ ┌─────────────────────────────────────────────┐    │
│ │ GitHub Actions                               │    │
│ │                                              │    │
│ │ 1. Checkout code                            │    │
│ │ 2. Run tests                                │    │
│ │ 3. Build Docker images                       │    │
│ │ 4. Push to registry                         │    │
│ │ 5. Update Helm charts                        │    │
│ │ 6. Deploy to staging                         │    │
│ │ 7. Run integration tests                     │    │
│ │ 8. Deploy to production                      │    │
│ │                                              │    │
│ └──────────────────┬───────────────────────────┘    │
│                    │                                 │
│                    ▼                                 │
│ ┌─────────────────────────────────────────────┐    │
│ │ Kubernetes Cluster                           │    │
│ │   - Rolling update                           │    │
│ │   - Health checks                            │    │
│ │   - Auto-rollback on failure                 │    │
│ └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Comparison: Before vs After

| Aspect | Phase III (Local) | Phase IV (Kubernetes) |
|--------|-------------------|----------------------|
| **Deployment** | Manual npm/python commands | Automated Helm charts |
| **Scaling** | Manual process spawn | `kubectl scale` command |
| **Updates** | Stop and restart | Rolling updates, zero downtime |
| **Health Checks** | None | Automatic liveness/readiness |
| **Load Balancing** | None | Built-in service load balancing |
| **Self-Healing** | Manual restart | Auto-restart failed pods |
| **Networking** | localhost:port | Service discovery by name |
| **Resource Mgmt** | OS-level | Fine-grained CPU/memory limits |
| **Configuration** | .env files | ConfigMaps and Secrets |
| **Monitoring** | Console logs | kubectl, metrics-server, Grafana |
| **Production Ready** | No | Yes (with enhancements) |

---

## 🚀 Deployment Workflow

### Initial Deployment
```bash
1. minikube start
   ↓
2. eval $(minikube docker-env)
   ↓
3. docker build frontend
   ↓
4. docker build backend
   ↓
5. helm install backend
   ↓
6. helm install frontend
   ↓
7. kubectl wait (pods ready)
   ↓
8. minikube service frontend
   ↓
9. ✅ Application accessible
```

### Update Deployment
```bash
1. Code changes
   ↓
2. docker build (new version)
   ↓
3. helm upgrade OR kubectl rollout restart
   ↓
4. Rolling update (zero downtime)
   ↓
5. Health checks pass
   ↓
6. ✅ Updated version live
```

### Rollback
```bash
1. Issue detected
   ↓
2. helm rollback backend [revision]
   ↓
3. Kubernetes reverts to previous version
   ↓
4. ✅ Stable version restored
```

---

## 📈 Monitoring & Observability

### Built-in Kubernetes Monitoring
```bash
# Resource usage
kubectl top nodes
kubectl top pods

# Deployment status
kubectl rollout status deployment/todo-chatbot-backend

# Events
kubectl get events --sort-by=.metadata.creationTimestamp

# Logs
kubectl logs -f deployment/todo-chatbot-backend
```

### Optional Add-ons
```bash
# Metrics Server
minikube addons enable metrics-server

# Dashboard
minikube dashboard

# Prometheus + Grafana (full stack)
helm install prometheus prometheus-community/kube-prometheus-stack
```

---

## 🏆 Learning Outcomes

After completing Phase IV, you now understand:

### Docker
- ✅ Multi-stage builds for optimization
- ✅ Container image layers and caching
- ✅ .dockerignore for faster builds
- ✅ Best practices (non-root users, health checks)

### Kubernetes
- ✅ Pods, Deployments, Services
- ✅ Service types (ClusterIP, NodePort, LoadBalancer)
- ✅ Resource requests and limits
- ✅ Liveness and readiness probes
- ✅ Service discovery and DNS
- ✅ Rolling updates and rollbacks

### Helm
- ✅ Chart structure and templating
- ✅ Values files for configuration
- ✅ Install, upgrade, rollback workflows
- ✅ Package management for K8s

### DevOps
- ✅ Infrastructure as Code
- ✅ Declarative configuration
- ✅ Automation and scripting
- ✅ Cloud-native architecture patterns

---

## 🎓 Real-World Applications

This architecture can be adapted for:

1. **Microservices**: Add more services with similar Helm charts
2. **Multi-environment**: Separate values.yaml for dev/staging/prod
3. **Cloud Platforms**: Deploy to GKE, EKS, AKS with minimal changes
4. **Continuous Deployment**: Add GitHub Actions for auto-deploy
5. **Service Mesh**: Add Istio for advanced traffic management
6. **Serverless**: Migrate to Knative for serverless Kubernetes

---

**🎉 You're now a Cloud-Native Developer!**

---

*Architecture designed for Phase IV*
*Generated: 2026-01-27*
