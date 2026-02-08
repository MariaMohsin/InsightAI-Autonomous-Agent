# 🚀 DEPLOY NOW - Step-by-Step Execution Guide

**Phase IV: Kubernetes Deployment on Windows**

Follow these steps IN ORDER. Copy and paste each command into PowerShell or CMD.

---

## ⚠️ BEFORE YOU START

Open **PowerShell as Administrator** or **CMD**

Navigate to your project:
```powershell
cd C:\Users\HP\Desktop\todo-chatbot-ui
```

---

## STEP 1: Verify Prerequisites ✅

Run each command and verify output:

```powershell
# Check Docker
docker --version
# Expected: Docker version X.X.X

# Check Minikube
minikube version
# Expected: minikube version: vX.X.X

# Check kubectl
kubectl version --client
# Expected: Client Version: vX.X.X

# Check Helm
helm version
# Expected: version.BuildInfo{Version:"vX.X.X"...}
```

**✅ All commands should work without errors**

---

## STEP 2: Start Minikube 🔧

```powershell
# Start Minikube with Docker driver
minikube start --driver=docker
```

**Wait for:** "Done! kubectl is now configured to use "minikube" cluster"

Verify:
```powershell
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

---

## STEP 3: Configure Docker Environment 🐳

**IMPORTANT:** This tells Docker to use Minikube's Docker daemon

### For PowerShell:
```powershell
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

### For CMD:
```cmd
@FOR /f "tokens=*" %i IN ('minikube -p minikube docker-env --shell cmd') DO @%i
```

**✅ No output means success**

Verify:
```powershell
docker ps
# Should now show Minikube containers
```

---

## STEP 4: Build Docker Images 🔨

### Build Frontend Image:
```powershell
cd frontend
docker build -t todo-chatbot-frontend:latest .
cd ..
```

**Watch for:** "Successfully tagged todo-chatbot-frontend:latest"

### Build Backend Image:
```powershell
cd backend
docker build -t todo-chatbot-backend:latest .
cd ..
```

**Watch for:** "Successfully tagged todo-chatbot-backend:latest"

### Verify Images:
```powershell
docker images | findstr todo-chatbot
```

**Expected output:**
```
todo-chatbot-frontend    latest    <image-id>    <time>    <size>
todo-chatbot-backend     latest    <image-id>    <time>    <size>
```

---

## STEP 5: Deploy Backend to Kubernetes 🚢

```powershell
# Install backend using Helm
helm install todo-backend helm\backend
```

**Expected output:**
```
NAME: todo-backend
LAST DEPLOYED: ...
NAMESPACE: default
STATUS: deployed
REVISION: 1
```

### Verify Backend Deployment:
```powershell
kubectl get pods
```

**Watch for:** `todo-chatbot-backend-xxx` with status `Running` or `ContainerCreating`

Wait until status is `Running`:
```powershell
kubectl wait --for=condition=available --timeout=120s deployment/todo-chatbot-backend
```

---

## STEP 6: Deploy Frontend to Kubernetes 🚢

```powershell
# Install frontend using Helm
helm install todo-frontend helm\frontend
```

**Expected output:**
```
NAME: todo-frontend
LAST DEPLOYED: ...
NAMESPACE: default
STATUS: deployed
REVISION: 1
```

### Verify Frontend Deployment:
```powershell
kubectl get pods
```

**Watch for:** Both pods showing `Running` status

Wait until ready:
```powershell
kubectl wait --for=condition=available --timeout=120s deployment/todo-chatbot-frontend
```

---

## STEP 7: Verify Everything is Running ✅

```powershell
# Check all resources
kubectl get all
```

**Expected output:**
```
NAME                                      READY   STATUS    RESTARTS   AGE
pod/todo-chatbot-backend-xxx              1/1     Running   0          2m
pod/todo-chatbot-frontend-xxx             1/1     Running   0          1m

NAME                           TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
service/kubernetes             ClusterIP   10.96.0.1       <none>        443/TCP          10m
service/todo-chatbot-backend   ClusterIP   10.96.xxx.xxx   <none>        8000/TCP         2m
service/todo-chatbot-frontend  NodePort    10.96.xxx.xxx   <none>        3000:30080/TCP   1m

NAME                                    READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/todo-chatbot-backend    1/1     1            1           2m
deployment.apps/todo-chatbot-frontend   1/1     1            1           1m
```

---

## STEP 8: Access Your Application 🌐

### Get Minikube IP:
```powershell
minikube ip
```

**Example output:** `192.168.49.2`

### Open in Browser:

**Option 1 (Automatic - Recommended):**
```powershell
minikube service todo-chatbot-frontend
```

This will automatically open your browser to the correct URL.

**Option 2 (Manual):**
```
http://<minikube-ip>:30080
# Example: http://192.168.49.2:30080
```

---

## STEP 9: Test Your Application 🧪

### Check Backend Health:
```powershell
kubectl port-forward service/todo-chatbot-backend 8000:8000
```

In another PowerShell window:
```powershell
curl http://localhost:8000/health
```

Press `Ctrl+C` to stop port-forward.

### Check Frontend Logs:
```powershell
kubectl logs -l app=todo-chatbot-frontend --tail=50
```

### Check Backend Logs:
```powershell
kubectl logs -l app=todo-chatbot-backend --tail=50
```

---

## ✅ SUCCESS CHECKLIST

Verify all these are working:

- [ ] Minikube is running: `minikube status`
- [ ] Both pods are running: `kubectl get pods`
- [ ] Services are exposed: `kubectl get services`
- [ ] Frontend is accessible in browser
- [ ] Can create a todo (tests backend connection)
- [ ] Can use chat feature (tests AI connection)
- [ ] No errors in logs

---

## 🎉 CONGRATULATIONS!

Your Todo Chatbot is now running on Kubernetes!

**Access URL:** Check `minikube service todo-chatbot-frontend` output

---

## 🛠️ USEFUL COMMANDS

### View Logs (Live):
```powershell
# Frontend logs
kubectl logs -f deployment/todo-chatbot-frontend

# Backend logs
kubectl logs -f deployment/todo-chatbot-backend
```

### Restart Services:
```powershell
# Restart backend
kubectl rollout restart deployment/todo-chatbot-backend

# Restart frontend
kubectl rollout restart deployment/todo-chatbot-frontend
```

### Scale Services:
```powershell
# Scale backend to 3 replicas
kubectl scale deployment todo-chatbot-backend --replicas=3

# Check status
kubectl get pods
```

### Check Pod Details:
```powershell
# Get pod name
kubectl get pods

# Describe specific pod
kubectl describe pod <pod-name>

# Execute command inside pod
kubectl exec -it <pod-name> -- /bin/sh
```

---

## 🚨 TROUBLESHOOTING

### Issue: Pods stuck in "ImagePullBackOff"

**Cause:** Docker images not built in Minikube's Docker daemon

**Solution:**
```powershell
# Re-configure Docker environment
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Rebuild images
cd frontend
docker build -t todo-chatbot-frontend:latest .
cd ..\backend
docker build -t todo-chatbot-backend:latest .
cd ..

# Delete pods to force recreation
kubectl delete pod -l app=todo-chatbot-frontend
kubectl delete pod -l app=todo-chatbot-backend
```

### Issue: Frontend can't connect to backend

**Check:**
```powershell
# Verify backend is running
kubectl get pods -l app=todo-chatbot-backend

# Check backend logs for errors
kubectl logs -l app=todo-chatbot-backend

# Test backend connectivity
kubectl exec -it <frontend-pod-name> -- wget -O- http://todo-chatbot-backend:8000/health
```

### Issue: "Error: connection refused"

**Cause:** Minikube might not be running

**Solution:**
```powershell
minikube status
# If stopped:
minikube start --driver=docker
```

### Issue: Ollama connection fails in backend

**Check backend logs:**
```powershell
kubectl logs -l app=todo-chatbot-backend | findstr ollama
```

**Fix:** Update `helm\backend\values.yaml`:
```yaml
env:
  - name: OLLAMA_HOST
    value: "http://host.minikube.internal:11434"
```

Then upgrade:
```powershell
helm upgrade todo-backend helm\backend
```

---

## 🧹 CLEANUP (When Done Testing)

### Remove Deployments:
```powershell
# Uninstall Helm releases
helm uninstall todo-frontend
helm uninstall todo-backend

# Verify cleanup
kubectl get all
```

### Stop Minikube:
```powershell
minikube stop
```

### Delete Minikube Cluster (Complete Wipe):
```powershell
minikube delete
```

---

## 🔄 RESTART FROM SCRATCH

If something goes wrong and you want to start fresh:

```powershell
# Delete everything
helm uninstall todo-frontend todo-backend
minikube delete

# Start over from STEP 2
minikube start --driver=docker
# ... continue from STEP 3
```

---

## 📊 MONITORING

### Watch Pods in Real-Time:
```powershell
kubectl get pods -w
```

### Check Resource Usage:
```powershell
# Enable metrics server first
minikube addons enable metrics-server

# Wait 1 minute, then:
kubectl top pods
kubectl top nodes
```

### Open Kubernetes Dashboard:
```powershell
minikube dashboard
```

---

## 🎯 NEXT STEPS

After successful deployment:

1. **Test all features** - Create todos, use chat, verify database
2. **Explore scaling** - Try scaling to multiple replicas
3. **Check monitoring** - View logs and resource usage
4. **Learn kubectl** - Try commands from KUBERNETES_QUICK_REFERENCE.md
5. **Modify configuration** - Edit helm values and upgrade

---

**📝 NOTES:**

- Keep PowerShell window open during deployment
- First build may take 5-10 minutes
- Pod startup may take 1-2 minutes
- If anything fails, check TROUBLESHOOTING section

---

**🚀 You're ready! Start with STEP 1 above.**
