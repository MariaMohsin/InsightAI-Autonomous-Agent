# Phase IV: Kubernetes Deployment Guide

Complete step-by-step guide to deploy Todo Chatbot on Minikube (Local Kubernetes)

---

## Prerequisites

Before starting, ensure you have:
- Docker Desktop installed and running
- Minikube installed
- kubectl installed
- Helm installed
- Ollama running locally on port 11434

---

## 1️⃣ DOCKERIZATION

### Step 1.1: Build Docker Images

Build both frontend and backend Docker images:

```bash
# Navigate to project root
cd C:\Users\HP\Desktop\todo-chatbot-ui

# Build frontend image
cd frontend
docker build -t todo-chatbot-frontend:latest .

# Build backend image
cd ../backend
docker build -t todo-chatbot-backend:latest .

# Verify images are created
docker images | grep todo-chatbot
```

**Expected output:**
```
todo-chatbot-frontend    latest    <image-id>    <time>    <size>
todo-chatbot-backend     latest    <image-id>    <time>    <size>
```

---

## 2️⃣ LOCAL KUBERNETES SETUP

### Step 2.1: Start Minikube

```bash
# Start Minikube with Docker driver
minikube start --driver=docker

# Verify cluster is running
minikube status
```

**Expected output:**
```
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

### Step 2.2: Configure Docker Environment

Point your shell to Minikube's Docker daemon (so Minikube can use your local images):

```bash
# Windows PowerShell
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Or for CMD
@FOR /f "tokens=*" %i IN ('minikube -p minikube docker-env --shell cmd') DO @%i

# Verify you're using Minikube's Docker
docker ps
```

### Step 2.3: Rebuild Images in Minikube's Docker

Since we switched to Minikube's Docker daemon, rebuild the images:

```bash
cd C:\Users\HP\Desktop\todo-chatbot-ui

# Rebuild frontend
cd frontend
docker build -t todo-chatbot-frontend:latest .

# Rebuild backend
cd ../backend
docker build -t todo-chatbot-backend:latest .
```

### Step 2.4: Verify Minikube Cluster

```bash
# Check cluster info
kubectl cluster-info

# Check nodes
kubectl get nodes

# Check current context
kubectl config current-context
```

---

## 3️⃣ POSTGRESQL SETUP (Optional)

If you want to use PostgreSQL in Kubernetes instead of Neon:

```bash
# Add Bitnami Helm repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Install PostgreSQL
helm install postgres bitnami/postgresql \
  --set auth.postgresPassword=password \
  --set auth.username=user \
  --set auth.password=password \
  --set auth.database=tododb

# Get PostgreSQL connection details
export POSTGRES_PASSWORD=$(kubectl get secret --namespace default postgres-postgresql -o jsonpath="{.data.postgres-password}" | base64 -d)
echo "PostgreSQL Password: $POSTGRES_PASSWORD"
```

**Note:** Update `helm/backend/values.yaml` DATABASE_URL if using this PostgreSQL instance.

---

## 4️⃣ HELM DEPLOYMENT

### Step 4.1: Deploy Backend

```bash
cd C:\Users\HP\Desktop\todo-chatbot-ui

# Install backend using Helm
helm install todo-backend helm/backend

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services
```

**Expected output:**
```
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
todo-chatbot-backend  1/1     1            1           30s
```

### Step 4.2: Deploy Frontend

```bash
# Install frontend using Helm
helm install todo-frontend helm/frontend

# Check all deployments
kubectl get all
```

**Expected output:**
```
NAME                                      READY   STATUS    RESTARTS   AGE
pod/todo-chatbot-backend-xxx              1/1     Running   0          1m
pod/todo-chatbot-frontend-xxx             1/1     Running   0          30s

NAME                           TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
service/todo-chatbot-backend   ClusterIP   10.96.xxx.xxx   <none>        8000/TCP         1m
service/todo-chatbot-frontend  NodePort    10.96.xxx.xxx   <none>        3000:30080/TCP   30s
```

### Step 4.3: Verify Deployments

```bash
# Check pod logs - Backend
kubectl logs -l app=todo-chatbot-backend --tail=50

# Check pod logs - Frontend
kubectl logs -l app=todo-chatbot-frontend --tail=50

# Describe pods for detailed info
kubectl describe pod -l app=todo-chatbot-backend
kubectl describe pod -l app=todo-chatbot-frontend
```

---

## 5️⃣ ACCESS THE APPLICATION

### Step 5.1: Get Minikube IP

```bash
# Get Minikube IP address
minikube ip
```

**Example output:** `192.168.49.2`

### Step 5.2: Access Frontend

```bash
# Option 1: Direct access using NodePort
# Open browser: http://<minikube-ip>:30080
# Example: http://192.168.49.2:30080

# Option 2: Use minikube service command (recommended)
minikube service todo-chatbot-frontend
```

The second command will automatically open your browser to the correct URL.

### Step 5.3: Test Backend API

```bash
# Get backend service URL (for testing only - it's ClusterIP)
kubectl port-forward service/todo-chatbot-backend 8000:8000

# In another terminal, test the health endpoint
curl http://localhost:8000/health
```

---

## 6️⃣ AI-ASSISTED KUBERNETES OPERATIONS

### Using kubectl-ai (if installed)

```bash
# Install kubectl-ai (if not installed)
# Follow: https://github.com/sozercan/kubectl-ai

# Example commands:

# Deploy a new version
kubectl-ai "update todo-chatbot-frontend to use image version 2.0"

# Scale deployments
kubectl-ai "scale todo-chatbot-backend to 3 replicas"

# Debug pods
kubectl-ai "why is my todo-chatbot-frontend pod not starting"

# Check resource usage
kubectl-ai "show me cpu and memory usage for all pods"

# Troubleshoot
kubectl-ai "show me the logs of failed pods in default namespace"
```

### Using kagent (if installed)

```bash
# Install kagent (if not installed)
# Follow: https://github.com/kubefirst/kagent

# Example commands:

# Cluster health check
kagent "check cluster health"

# Optimize resources
kagent "optimize resource allocation for todo-chatbot deployments"

# Security scan
kagent "scan for security issues in my deployments"

# Get recommendations
kagent "recommend improvements for my todo-chatbot application"

# Performance analysis
kagent "analyze performance bottlenecks"
```

---

## 7️⃣ COMMON OPERATIONS

### Scaling

```bash
# Scale backend
kubectl scale deployment todo-chatbot-backend --replicas=3

# Scale frontend
kubectl scale deployment todo-chatbot-frontend --replicas=2

# Verify scaling
kubectl get pods
```

### Updating Deployments

```bash
# After making changes to Helm charts

# Upgrade backend
helm upgrade todo-backend helm/backend

# Upgrade frontend
helm upgrade todo-frontend helm/frontend

# Rollback if needed
helm rollback todo-backend
helm rollback todo-frontend
```

### Viewing Logs

```bash
# Stream logs from backend
kubectl logs -f deployment/todo-chatbot-backend

# Stream logs from frontend
kubectl logs -f deployment/todo-chatbot-frontend

# View logs from all pods with label
kubectl logs -l app=todo-chatbot-backend --all-containers=true
```

### Debugging Pods

```bash
# Get pod details
kubectl describe pod <pod-name>

# Execute commands in pod
kubectl exec -it <pod-name> -- /bin/sh

# Check pod events
kubectl get events --sort-by=.metadata.creationTimestamp
```

### Monitoring Resources

```bash
# Check resource usage
kubectl top nodes
kubectl top pods

# Watch pod status
kubectl get pods -w

# Check deployment status
kubectl rollout status deployment/todo-chatbot-backend
kubectl rollout status deployment/todo-chatbot-frontend
```

---

## 8️⃣ CLEANUP

### Remove Deployments

```bash
# Uninstall Helm releases
helm uninstall todo-frontend
helm uninstall todo-backend

# If you installed PostgreSQL
helm uninstall postgres

# Verify cleanup
kubectl get all
```

### Stop Minikube

```bash
# Stop Minikube cluster
minikube stop

# Delete Minikube cluster (complete cleanup)
minikube delete
```

---

## 9️⃣ TROUBLESHOOTING

### Issue: Pods stuck in "ImagePullBackOff"

**Solution:** Images must be built in Minikube's Docker daemon

```bash
# Switch to Minikube's Docker
eval $(minikube docker-env)

# Rebuild images
cd frontend && docker build -t todo-chatbot-frontend:latest .
cd ../backend && docker build -t todo-chatbot-backend:latest .

# Restart pods
kubectl delete pod -l app=todo-chatbot-frontend
kubectl delete pod -l app=todo-chatbot-backend
```

### Issue: Frontend can't connect to backend

**Check:**
1. Backend service name matches in frontend env (`NEXT_PUBLIC_API_URL`)
2. Backend is running: `kubectl get pods -l app=todo-chatbot-backend`
3. Service exists: `kubectl get svc todo-chatbot-backend`

```bash
# Test backend connectivity from frontend pod
kubectl exec -it <frontend-pod-name> -- wget -O- http://todo-chatbot-backend:8000/health
```

### Issue: Ollama connection fails

**Solution:** Backend needs to access host Ollama

```bash
# Update backend values.yaml OLLAMA_HOST to:
# http://host.minikube.internal:11434

# Verify Ollama is running on host
curl http://localhost:11434/api/tags
```

### Issue: Database connection fails

**Check DATABASE_URL in backend values.yaml:**
- For Neon: Use your Neon connection string
- For local PostgreSQL in K8s: `postgresql://user:password@postgres:5432/tododb`

```bash
# Test database connection from backend pod
kubectl exec -it <backend-pod-name> -- python -c "import psycopg2; print('OK')"
```

---

## 🎯 SUCCESS CHECKLIST

- [ ] Docker images built successfully
- [ ] Minikube cluster running
- [ ] Backend deployed and pods running
- [ ] Frontend deployed and pods running
- [ ] Can access frontend via browser
- [ ] Frontend can communicate with backend
- [ ] Backend can access Ollama
- [ ] Database connection working
- [ ] Chat functionality working
- [ ] Todo CRUD operations working

---

## 📚 USEFUL COMMANDS REFERENCE

```bash
# Quick status check
kubectl get all

# Get detailed pod info
kubectl describe pod <pod-name>

# Port forward for local testing
kubectl port-forward svc/todo-chatbot-backend 8000:8000
kubectl port-forward svc/todo-chatbot-frontend 3000:3000

# View Helm releases
helm list

# Get Helm values
helm get values todo-frontend
helm get values todo-backend

# Restart deployment
kubectl rollout restart deployment/todo-chatbot-backend
kubectl rollout restart deployment/todo-chatbot-frontend

# Delete and recreate pod
kubectl delete pod -l app=todo-chatbot-frontend

# Check logs with timestamps
kubectl logs <pod-name> --timestamps

# Follow logs
kubectl logs -f <pod-name>

# Access Minikube dashboard
minikube dashboard
```

---

## 🚀 NEXT STEPS

1. **Add Ingress** for better routing (optional)
2. **Set up monitoring** with Prometheus & Grafana
3. **Add persistent volumes** for database data
4. **Configure secrets** instead of hardcoded values
5. **Set up CI/CD** for automated deployments
6. **Add resource limits** for production readiness
7. **Implement horizontal pod autoscaling**

---

**Congratulations! Your Todo Chatbot is now running on Kubernetes! 🎉**
