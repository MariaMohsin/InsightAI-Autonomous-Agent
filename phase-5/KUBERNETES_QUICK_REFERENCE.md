# Kubernetes Quick Reference - Todo Chatbot

## 🚀 Quick Start (One Command)

### Windows:
```bash
.\deploy-to-minikube.bat
```

### Linux/Mac:
```bash
chmod +x deploy-to-minikube.sh
./deploy-to-minikube.sh
```

---

## 📝 Essential Commands

### Access Application
```bash
# Get Minikube IP
minikube ip

# Open frontend in browser (auto-detects URL)
minikube service todo-chatbot-frontend

# Manual access: http://<minikube-ip>:30080
```

### View Logs
```bash
# Backend logs
kubectl logs -f deployment/todo-chatbot-backend

# Frontend logs
kubectl logs -f deployment/todo-chatbot-frontend

# Last 50 lines
kubectl logs deployment/todo-chatbot-backend --tail=50
```

### Check Status
```bash
# All resources
kubectl get all

# Pods only
kubectl get pods

# Services
kubectl get services

# Deployments
kubectl get deployments

# Helm releases
helm list
```

### Restart Services
```bash
# Restart backend
kubectl rollout restart deployment/todo-chatbot-backend

# Restart frontend
kubectl rollout restart deployment/todo-chatbot-frontend

# Delete and recreate pod (force restart)
kubectl delete pod -l app=todo-chatbot-backend
```

### Scale Services
```bash
# Scale backend to 3 replicas
kubectl scale deployment todo-chatbot-backend --replicas=3

# Scale frontend to 2 replicas
kubectl scale deployment todo-chatbot-frontend --replicas=2
```

### Debug Pods
```bash
# Describe pod (detailed info)
kubectl describe pod <pod-name>

# Get pod events
kubectl get events --sort-by=.metadata.creationTimestamp

# Execute shell in pod
kubectl exec -it <pod-name> -- /bin/sh

# Test connectivity to backend from frontend pod
kubectl exec -it <frontend-pod-name> -- wget -O- http://todo-chatbot-backend:8000/health
```

### Update Deployments
```bash
# After changing Helm charts

# Upgrade backend
helm upgrade todo-backend helm/backend

# Upgrade frontend
helm upgrade todo-frontend helm/frontend

# Rollback if something breaks
helm rollback todo-backend
helm rollback todo-frontend
```

### Cleanup
```bash
# Remove deployments
helm uninstall todo-frontend
helm uninstall todo-backend

# Stop Minikube
minikube stop

# Delete Minikube cluster (complete wipe)
minikube delete
```

---

## 🛠️ Troubleshooting

### Pods not starting (ImagePullBackOff)
```bash
# Switch to Minikube's Docker
eval $(minikube docker-env)  # Linux/Mac
# OR
@FOR /f "tokens=*" %i IN ('minikube -p minikube docker-env --shell cmd') DO @%i  # Windows

# Rebuild images
cd frontend && docker build -t todo-chatbot-frontend:latest .
cd ../backend && docker build -t todo-chatbot-backend:latest .

# Delete pods to recreate
kubectl delete pod -l app=todo-chatbot-frontend
kubectl delete pod -l app=todo-chatbot-backend
```

### Frontend can't reach backend
```bash
# Check backend is running
kubectl get pods -l app=todo-chatbot-backend

# Check service exists
kubectl get svc todo-chatbot-backend

# Test from frontend pod
kubectl exec -it <frontend-pod-name> -- wget -O- http://todo-chatbot-backend:8000/health
```

### View pod errors
```bash
# Get pod name
kubectl get pods

# Describe pod
kubectl describe pod <pod-name>

# View logs
kubectl logs <pod-name>
```

---

## 🎯 AI-Assisted Commands

### kubectl-ai Examples
```bash
# Natural language Kubernetes operations
kubectl-ai "scale todo-chatbot-backend to 3 replicas"
kubectl-ai "show me logs of failed pods"
kubectl-ai "why is my frontend pod crashing"
kubectl-ai "show cpu and memory usage"
```

### kagent Examples
```bash
# Cluster analysis and recommendations
kagent "check cluster health"
kagent "optimize resource allocation"
kagent "scan for security issues"
kagent "recommend improvements"
```

---

## 📊 Monitoring

### Resource Usage
```bash
# Node resources
kubectl top nodes

# Pod resources
kubectl top pods

# Watch pods (live updates)
kubectl get pods -w
```

### Deployment Status
```bash
# Check rollout status
kubectl rollout status deployment/todo-chatbot-backend
kubectl rollout status deployment/todo-chatbot-frontend

# View rollout history
kubectl rollout history deployment/todo-chatbot-backend
```

### Port Forwarding (for local testing)
```bash
# Forward backend to localhost:8000
kubectl port-forward service/todo-chatbot-backend 8000:8000

# Forward frontend to localhost:3000
kubectl port-forward service/todo-chatbot-frontend 3000:3000

# Test: curl http://localhost:8000/health
```

---

## 🔐 Secrets & ConfigMaps

### Create Secret (for sensitive data)
```bash
# Create secret for database credentials
kubectl create secret generic db-secret \
  --from-literal=username=user \
  --from-literal=password=password

# View secrets
kubectl get secrets

# Use in deployment: add to values.yaml
```

### Create ConfigMap (for non-sensitive config)
```bash
# Create configmap
kubectl create configmap app-config \
  --from-literal=api-url=http://backend:8000

# View configmaps
kubectl get configmaps
```

---

## 📦 Helm Operations

### Chart Management
```bash
# List installed charts
helm list

# Get chart values
helm get values todo-frontend
helm get values todo-backend

# See what would be deployed (dry run)
helm install todo-frontend helm/frontend --dry-run --debug

# Uninstall chart
helm uninstall todo-frontend
```

### Update Chart Values
```bash
# Edit helm/frontend/values.yaml or helm/backend/values.yaml
# Then upgrade:
helm upgrade todo-frontend helm/frontend
helm upgrade todo-backend helm/backend
```

---

## 🌐 Networking

### Service Discovery
```bash
# List services
kubectl get services

# Describe service
kubectl describe service todo-chatbot-backend

# Test DNS resolution from pod
kubectl exec -it <pod-name> -- nslookup todo-chatbot-backend
```

### Expose Service (different ways)
```bash
# Already using NodePort for frontend (30080)
# To change service type, edit helm/frontend/values.yaml

# service:
#   type: LoadBalancer  # or ClusterIP, NodePort
```

---

## 🎓 Learning Resources

### Kubernetes Basics
- `kubectl explain pods` - Documentation for pods
- `kubectl explain deployment` - Documentation for deployments
- `kubectl api-resources` - List all resource types

### Minikube
```bash
# Minikube dashboard (web UI)
minikube dashboard

# SSH into Minikube VM
minikube ssh

# Check Minikube addons
minikube addons list

# Enable addons (example: metrics-server)
minikube addons enable metrics-server
```

---

## ⚡ Power User Tips

```bash
# Aliases (add to .bashrc or .zshrc)
alias k='kubectl'
alias kgp='kubectl get pods'
alias kgs='kubectl get services'
alias kgd='kubectl get deployments'
alias klog='kubectl logs -f'
alias kdesc='kubectl describe'
alias kexec='kubectl exec -it'

# Watch resources (auto-refresh)
watch kubectl get pods

# Get pod names into variable
BACKEND_POD=$(kubectl get pod -l app=todo-chatbot-backend -o jsonpath='{.items[0].metadata.name}')
kubectl logs $BACKEND_POD

# Follow logs from multiple pods
kubectl logs -l app=todo-chatbot-backend --all-containers=true -f
```

---

## 📋 Pre-flight Checklist

Before deploying:
- [ ] Docker Desktop running
- [ ] Minikube installed
- [ ] kubectl installed
- [ ] Helm installed
- [ ] Ollama running (port 11434)
- [ ] Images built
- [ ] Helm charts configured

---

## 🚨 Emergency Commands

```bash
# Delete everything and start fresh
helm uninstall todo-frontend todo-backend
minikube delete
minikube start --driver=docker

# Force delete stuck pod
kubectl delete pod <pod-name> --force --grace-period=0

# Get cluster logs
minikube logs

# Reset Docker environment
eval $(minikube docker-env -u)  # Unset Minikube Docker env
```

---

**🎉 You're ready to deploy! Good luck!**
