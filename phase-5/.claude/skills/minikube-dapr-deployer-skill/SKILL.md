---
name: minikube-dapr-deployer-skill
description: Deploy applications to Minikube with Dapr runtime for microservices patterns (pub/sub, state management, service invocation).
---

# Minikube Dapr Deployer Skill

## Purpose
Deploy and manage applications on Minikube with Dapr (Distributed Application Runtime) for building microservices with pub/sub, state management, and service-to-service communication.

## What is Dapr?

Dapr provides building blocks for microservices:
- **Pub/Sub** - Event-driven messaging
- **State Management** - Key-value storage
- **Service Invocation** - Service-to-service calls
- **Bindings** - External system integration
- **Secrets** - Secure secret management

## Setup Dapr on Minikube

### Prerequisites
```bash
# Start Minikube
minikube start --cpus=4 --memory=8192

# Install Dapr CLI
# Windows (PowerShell)
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"

# Verify
dapr --version
```

### Initialize Dapr
```bash
# Initialize Dapr on Kubernetes
dapr init -k

# Verify installation
dapr status -k

# Expected output:
# NAME                   NAMESPACE    HEALTHY  STATUS   REPLICAS  VERSION  AGE
# dapr-sidecar-injector  dapr-system  True     Running  1         1.12.0   1m
# dapr-sentry            dapr-system  True     Running  1         1.12.0   1m
# dapr-operator          dapr-system  True     Running  1         1.12.0   1m
# dapr-placement         dapr-system  True     Running  1         1.12.0   1m
```

## Dapr Components

### 1. Pub/Sub Component (Redis)
```yaml
# pubsub.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: todo-pubsub
  namespace: default
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: redis-master.default.svc.cluster.local:6379
  - name: redisPassword
    value: ""
```

### 2. State Store Component (Redis)
```yaml
# statestore.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: todo-statestore
  namespace: default
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: redis-master.default.svc.cluster.local:6379
  - name: redisPassword
    value: ""
```

## Deploy Redis (for Dapr)

```bash
# Install Redis using Helm
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install redis bitnami/redis --set auth.enabled=false

# Verify Redis
kubectl get pods | grep redis
```

## Application Deployment

### Backend Service (FastAPI with Dapr)
```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-backend
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: todo-backend
  template:
    metadata:
      labels:
        app: todo-backend
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "todo-backend"
        dapr.io/app-port: "8000"
        dapr.io/log-level: "info"
    spec:
      containers:
      - name: backend
        image: your-registry/todo-backend:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: todo-backend
  namespace: default
spec:
  selector:
    app: todo-backend
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
```

### Frontend Service (Next.js with Dapr)
```yaml
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-frontend
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: todo-frontend
  template:
    metadata:
      labels:
        app: todo-frontend
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "todo-frontend"
        dapr.io/app-port: "3000"
    spec:
      containers:
      - name: frontend
        image: your-registry/todo-frontend:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://todo-backend"
---
apiVersion: v1
kind: Service
metadata:
  name: todo-frontend
  namespace: default
spec:
  selector:
    app: todo-frontend
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Deployment Commands

### Build & Load Images (Minikube)
```bash
# Build Docker images
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# Load images to Minikube
minikube image load todo-backend:latest
minikube image load todo-frontend:latest

# Verify images
minikube ssh docker images | grep todo
```

### Deploy Components
```bash
# Apply Dapr components
kubectl apply -f dapr/pubsub.yaml
kubectl apply -f dapr/statestore.yaml

# Verify components
dapr components -k

# Deploy applications
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Check deployments
kubectl get deployments
kubectl get pods
kubectl get services
```

## Using Dapr Features

### 1. Pub/Sub (Event Publishing)
```python
# FastAPI backend - publish event
import requests

@app.post("/todos")
async def create_todo(todo: TodoCreate):
    # Save to database
    new_todo = await save_todo(todo)

    # Publish event via Dapr
    dapr_url = "http://localhost:3500/v1.0/publish/todo-pubsub/todo-created"
    requests.post(dapr_url, json=new_todo.dict())

    return new_todo
```

### 2. State Management
```python
# Save state via Dapr
import requests

def save_user_preference(user_id: str, preferences: dict):
    dapr_url = f"http://localhost:3500/v1.0/state/todo-statestore"
    state = [
        {
            "key": f"user-{user_id}-preferences",
            "value": preferences
        }
    ]
    requests.post(dapr_url, json=state)

# Get state via Dapr
def get_user_preference(user_id: str):
    dapr_url = f"http://localhost:3500/v1.0/state/todo-statestore/user-{user_id}-preferences"
    response = requests.get(dapr_url)
    return response.json()
```

### 3. Service Invocation
```python
# Call another service via Dapr
import requests

def call_notification_service(message: str):
    dapr_url = "http://localhost:3500/v1.0/invoke/notification-service/method/send"
    payload = {"message": message}
    response = requests.post(dapr_url, json=payload)
    return response.json()
```

## Access Applications

### Get Service URLs
```bash
# Get frontend URL
minikube service todo-frontend --url

# Get backend URL
minikube service todo-backend --url

# Open in browser
minikube service todo-frontend
```

### Port Forwarding (Alternative)
```bash
# Forward frontend port
kubectl port-forward svc/todo-frontend 3000:80

# Forward backend port
kubectl port-forward svc/todo-backend 8000:80

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## Monitoring & Debugging

### Check Pods
```bash
# List all pods
kubectl get pods

# Describe pod
kubectl describe pod POD_NAME

# View logs (app container)
kubectl logs POD_NAME -c backend

# View logs (dapr sidecar)
kubectl logs POD_NAME -c daprd

# Follow logs
kubectl logs -f POD_NAME -c backend
```

### Dapr Dashboard
```bash
# Launch Dapr dashboard
dapr dashboard -k

# Access at: http://localhost:8080
# View: apps, components, configurations
```

### Debug Inside Pod
```bash
# Shell into app container
kubectl exec -it POD_NAME -c backend -- /bin/bash

# Shell into dapr sidecar
kubectl exec -it POD_NAME -c daprd -- /bin/sh
```

## Update Deployment

### Rolling Update
```bash
# Build new image
docker build -t todo-backend:v2 ./backend

# Load to Minikube
minikube image load todo-backend:v2

# Update deployment
kubectl set image deployment/todo-backend backend=todo-backend:v2

# Watch rollout
kubectl rollout status deployment/todo-backend

# Rollback if needed
kubectl rollout undo deployment/todo-backend
```

## Scaling

```bash
# Scale backend
kubectl scale deployment todo-backend --replicas=3

# Scale frontend
kubectl scale deployment todo-frontend --replicas=2

# Auto-scaling
kubectl autoscale deployment todo-backend \
  --min=2 --max=5 --cpu-percent=80

# Check HPA
kubectl get hpa
```

## Cleanup

```bash
# Delete deployments
kubectl delete -f k8s/backend-deployment.yaml
kubectl delete -f k8s/frontend-deployment.yaml

# Delete Dapr components
kubectl delete -f dapr/

# Delete Redis
helm uninstall redis

# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete
```

## Common Issues

### Issue 1: Image pull error
```bash
# Solution: Load image to Minikube
minikube image load IMAGE_NAME:TAG
```

### Issue 2: Dapr sidecar not injected
```bash
# Check annotations in deployment
# Must have:
# dapr.io/enabled: "true"
# dapr.io/app-id: "app-name"
# dapr.io/app-port: "port"
```

### Issue 3: Service not accessible
```bash
# Check service
kubectl get svc

# Use minikube service command
minikube service SERVICE_NAME --url
```

## Best Practices

✅ Use Dapr for microservices communication
✅ Enable Dapr sidecar with annotations
✅ Use LoadBalancer or NodePort service types
✅ Load images to Minikube before deploying
✅ Use kubectl logs to debug both app and Dapr sidecar
✅ Use Dapr dashboard for monitoring

## When to Use This Skill

✅ Deploying microservices to local Kubernetes
✅ Using Dapr for pub/sub or state management
✅ Testing Kubernetes deployments locally
✅ Learning Dapr and Kubernetes together

❌ Production deployments (use cloud cluster)
❌ High-scale testing (use cloud Kubernetes)
