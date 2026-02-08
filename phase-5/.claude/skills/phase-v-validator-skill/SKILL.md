---
name: phase-v-validator-skill
description: Validate Phase V requirements including microservices architecture, event-driven patterns, Kubernetes deployment, and production readiness.
---

# Phase V Validator Skill

## Purpose
Validate that Phase V requirements are properly implemented including microservices architecture, event-driven communication, Kubernetes deployment, Dapr integration, and production readiness standards.

## Phase V Requirements Checklist

### 1. Microservices Architecture ✅

#### Service Separation
- [ ] Frontend service (Next.js) deployed independently
- [ ] Backend service (FastAPI) deployed independently
- [ ] Database service (PostgreSQL/Neon) separated
- [ ] Each service has its own repository/folder
- [ ] Services communicate via APIs or events (not direct DB access)

#### Service Boundaries
- [ ] Clear service responsibilities defined
- [ ] No shared databases between services
- [ ] Each service can be deployed independently
- [ ] Services are loosely coupled

**Validation Commands:**
```bash
# Check deployments
kubectl get deployments
# Should show separate frontend and backend deployments

# Check services
kubectl get services
# Should show separate service endpoints
```

---

### 2. Event-Driven Communication ✅

#### Kafka/Event System Setup
- [ ] Kafka cluster running (local Docker or cloud)
- [ ] Event topics defined (todo-events, user-events, etc.)
- [ ] Event producers implemented in backend
- [ ] Event consumers implemented for notifications/analytics
- [ ] Events follow standard schema (eventId, eventType, timestamp, data)

#### Event Types Implemented
- [ ] todo.created
- [ ] todo.updated
- [ ] todo.completed
- [ ] todo.deleted
- [ ] user.registered (bonus)

**Validation Commands:**
```bash
# Check Kafka topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

# Consume events to verify
docker exec -it kafka kafka-console-consumer \
  --topic todo-events \
  --from-beginning \
  --bootstrap-server localhost:9092
```

**Code Validation:**
```python
# Verify event publishing in backend
# Should see code like:
kafka_publisher.publish_event(
    topic="todo-events",
    event_type="todo.created",
    data={...}
)
```

---

### 3. Kubernetes Deployment ✅

#### Cluster Setup
- [ ] Kubernetes cluster running (Minikube or cloud)
- [ ] kubectl configured and connected
- [ ] Namespaces created (default, staging, prod)

#### Kubernetes Resources
- [ ] Deployment manifests for frontend and backend
- [ ] Service manifests (LoadBalancer or NodePort)
- [ ] ConfigMaps for configuration
- [ ] Secrets for sensitive data (DB passwords, JWT secrets)
- [ ] Persistent volumes (if using local DB)

**Validation Commands:**
```bash
# Check cluster
kubectl cluster-info
kubectl get nodes

# Check deployments
kubectl get deployments -n default

# Check pods (should be Running)
kubectl get pods -n default

# Check services
kubectl get services -n default

# Check secrets
kubectl get secrets -n default
```

**Deployment Validation:**
```bash
# Pods should be running
kubectl get pods
# STATUS should be "Running"

# Check pod logs
kubectl logs -f POD_NAME

# Access application
minikube service frontend --url
# Should return accessible URL
```

---

### 4. Dapr Integration ✅

#### Dapr Setup
- [ ] Dapr initialized on Kubernetes (dapr init -k)
- [ ] Dapr control plane running (operator, sentry, sidecar-injector)
- [ ] Dapr components defined (pub/sub, state store)

#### Dapr Components
- [ ] Pub/Sub component configured
- [ ] State store component configured
- [ ] Dapr sidecars injected in pods (annotations)

**Validation Commands:**
```bash
# Check Dapr status
dapr status -k

# Check Dapr components
dapr components -k

# Check pod has Dapr sidecar
kubectl describe pod POD_NAME
# Should see 2 containers: app + daprd
```

**Pod Annotation Validation:**
```yaml
# Deployment should have:
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "todo-backend"
  dapr.io/app-port: "8000"
```

---

### 5. Container Images ✅

#### Docker Images
- [ ] Dockerfile for frontend
- [ ] Dockerfile for backend
- [ ] Images built successfully
- [ ] Images optimized (multi-stage builds)
- [ ] Images scanned for vulnerabilities

**Validation Commands:**
```bash
# Check images exist
docker images | grep todo

# Check image size (should be reasonable)
# Frontend: < 500MB
# Backend: < 300MB

# Load to Minikube
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Verify in Minikube
minikube ssh docker images | grep todo
```

---

### 6. Configuration Management ✅

#### Environment Variables
- [ ] Separate configs for dev/staging/prod
- [ ] Secrets stored in Kubernetes Secrets (not hardcoded)
- [ ] ConfigMaps for non-sensitive config
- [ ] Environment-specific values (DB URLs, API endpoints)

**Validation:**
```bash
# Check secrets exist
kubectl get secrets

# Check configmaps
kubectl get configmaps

# Verify secret contents (base64 encoded)
kubectl get secret todo-secrets -o yaml
```

---

### 7. Service Communication ✅

#### API Communication
- [ ] Frontend calls Backend via Service name (http://backend-service)
- [ ] Services use Kubernetes DNS for discovery
- [ ] CORS configured properly
- [ ] Authentication headers passed correctly

**Validation:**
```bash
# Test service-to-service communication
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://backend-service/health

# Should return 200 OK
```

---

### 8. Scalability ✅

#### Horizontal Scaling
- [ ] Multiple replicas configured (replicas: 2+)
- [ ] Load balancing works across replicas
- [ ] Auto-scaling configured (optional but recommended)

**Validation Commands:**
```bash
# Check replicas
kubectl get deployments
# READY should show 2/2 or 3/3

# Scale manually
kubectl scale deployment backend --replicas=3

# Check HPA (if configured)
kubectl get hpa
```

---

### 9. Monitoring & Logging ✅

#### Health Checks
- [ ] Liveness probes configured
- [ ] Readiness probes configured
- [ ] /health endpoint implemented in backend

#### Logging
- [ ] Application logs visible via kubectl logs
- [ ] Structured logging (JSON format recommended)
- [ ] Log levels configured (INFO, ERROR, DEBUG)

**Validation Commands:**
```bash
# Check logs
kubectl logs -f POD_NAME -c CONTAINER_NAME

# Check Dapr logs
kubectl logs -f POD_NAME -c daprd

# View all logs
kubectl logs --all-containers POD_NAME
```

---

### 10. Production Readiness ✅

#### Zero-Downtime Deployment
- [ ] Rolling update strategy configured
- [ ] maxUnavailable and maxSurge set properly
- [ ] Health checks prevent broken deployments

#### Rollback Capability
- [ ] Can rollback to previous version
- [ ] Deployment history maintained

**Validation:**
```bash
# Check rollout status
kubectl rollout status deployment/backend

# View rollout history
kubectl rollout history deployment/backend

# Rollback if needed
kubectl rollout undo deployment/backend
```

#### Resource Limits
- [ ] CPU and memory requests defined
- [ ] CPU and memory limits defined
- [ ] Prevents resource exhaustion

**Validation:**
```yaml
# Deployment should have:
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

---

## Validation Script

### Automated Validation
```bash
#!/bin/bash
# validate-phase-v.sh

echo "🔍 Phase V Validation Starting..."

# 1. Check Kubernetes
echo "📋 Checking Kubernetes cluster..."
kubectl cluster-info > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Kubernetes cluster: Connected"
else
  echo "❌ Kubernetes cluster: Not connected"
  exit 1
fi

# 2. Check Deployments
echo "📋 Checking deployments..."
DEPLOYMENTS=$(kubectl get deployments -o json | jq '.items | length')
if [ $DEPLOYMENTS -ge 2 ]; then
  echo "✅ Deployments: $DEPLOYMENTS services deployed"
else
  echo "❌ Deployments: Need at least 2 services (frontend + backend)"
fi

# 3. Check Pods
echo "📋 Checking pods..."
RUNNING_PODS=$(kubectl get pods --field-selector=status.phase=Running -o json | jq '.items | length')
if [ $RUNNING_PODS -ge 2 ]; then
  echo "✅ Pods: $RUNNING_PODS pods running"
else
  echo "❌ Pods: Not enough pods running"
fi

# 4. Check Dapr
echo "📋 Checking Dapr..."
dapr status -k > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Dapr: Installed and running"
else
  echo "⚠️  Dapr: Not installed or not running"
fi

# 5. Check Kafka
echo "📋 Checking Kafka..."
docker ps | grep kafka > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Kafka: Running"
else
  echo "⚠️  Kafka: Not running (optional for Phase V)"
fi

# 6. Check Services
echo "📋 Checking services..."
SERVICES=$(kubectl get services -o json | jq '.items | length')
if [ $SERVICES -ge 2 ]; then
  echo "✅ Services: $SERVICES services exposed"
else
  echo "❌ Services: Need at least 2 services"
fi

echo ""
echo "📊 Validation Complete!"
```

---

## Manual Testing Checklist

### End-to-End Testing
- [ ] Can access frontend via browser
- [ ] Can signup and login
- [ ] Can create todo (check if appears)
- [ ] Can update todo (check if updates)
- [ ] Can delete todo (check if removes)
- [ ] Can filter/search todos
- [ ] Events published to Kafka (check logs)

### Access Testing
```bash
# Get frontend URL
minikube service frontend --url

# Test in browser
# 1. Open URL
# 2. Signup with test account
# 3. Create a todo
# 4. Update the todo
# 5. Delete the todo

# Check Kafka events
docker exec -it kafka kafka-console-consumer \
  --topic todo-events \
  --from-beginning \
  --bootstrap-server localhost:9092
# Should see events for create, update, delete
```

---

## Common Validation Issues

### Issue 1: Pods not running
```bash
# Check pod status
kubectl get pods

# Describe pod for errors
kubectl describe pod POD_NAME

# Check logs
kubectl logs POD_NAME

# Common fixes:
# - Image not loaded to Minikube
# - Wrong image name in deployment
# - Missing secrets/configmaps
```

### Issue 2: Service not accessible
```bash
# Check service
kubectl get svc

# Use minikube service
minikube service SERVICE_NAME --url

# Check pod is running
kubectl get pods
```

### Issue 3: Dapr sidecar not injected
```bash
# Check pod has 2 containers
kubectl get pods
# READY should be 2/2

# Check deployment annotations
kubectl get deployment DEPLOYMENT_NAME -o yaml | grep dapr
```

---

## Phase V Success Criteria

### Minimum Requirements
✅ Frontend and Backend deployed to Kubernetes
✅ Services running with multiple replicas
✅ Dapr sidecars injected
✅ Health checks configured
✅ Application accessible via browser
✅ Basic CRUD operations working

### Recommended Requirements
✅ Event-driven communication via Kafka/Dapr pub/sub
✅ Auto-scaling configured
✅ Monitoring and logging setup
✅ Secrets management via Kubernetes Secrets
✅ Rolling updates working
✅ Rollback capability tested

### Advanced Requirements (Bonus)
✅ Multiple environments (dev, staging, prod)
✅ CI/CD pipeline for automated deployment
✅ Service mesh (Istio/Linkerd)
✅ Distributed tracing
✅ Metrics and dashboards

---

## Validation Report Template

```markdown
# Phase V Validation Report

**Date:** 2024-02-07
**Project:** Todo Full-Stack Application
**Validator:** [Your Name]

## Summary
✅ PASSED / ⚠️ PARTIAL / ❌ FAILED

## Detailed Results

### 1. Microservices Architecture
- [✅] Services separated
- [✅] Independent deployment
- [✅] Loose coupling
**Status:** PASSED

### 2. Event-Driven Communication
- [✅] Kafka running
- [✅] Events published
- [⚠️] Event consumers (partial)
**Status:** PARTIAL

### 3. Kubernetes Deployment
- [✅] Cluster running
- [✅] Deployments created
- [✅] Pods running
- [✅] Services exposed
**Status:** PASSED

### 4. Dapr Integration
- [✅] Dapr installed
- [✅] Sidecars injected
- [✅] Components configured
**Status:** PASSED

### 5. Production Readiness
- [✅] Health checks
- [✅] Resource limits
- [✅] Rolling updates
**Status:** PASSED

## Issues Found
1. Event consumer not fully implemented
2. Auto-scaling not configured

## Recommendations
1. Implement event consumer for analytics
2. Add HPA for auto-scaling
3. Set up monitoring dashboard

## Overall Assessment
✅ Phase V requirements MET
Application is ready for demonstration.
```

---

## When to Use This Skill

✅ Before submitting Phase V assignment
✅ After completing Kubernetes deployment
✅ To verify production readiness
✅ To identify missing requirements
✅ For quality assurance

This skill ensures your Phase V implementation meets all requirements! 🚀
