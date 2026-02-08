# 🚀 QUICK START - Deploy in 3 Steps

## ✅ Everything is Ready!

All Docker images have been built and all files are configured.

---

## 🎯 Deploy Now (3 Simple Steps)

### **Step 1: Open PowerShell**

Right-click on **Windows Start** → Select **Windows PowerShell**

### **Step 2: Navigate to Project**

```powershell
cd C:\Users\HP\Desktop\todo-chatbot-ui
```

### **Step 3: Run Deployment Script**

```powershell
.\deploy-now.ps1
```

**If you get a security error**, run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run the script again:
```powershell
.\deploy-now.ps1
```

---

## ⏱️ What Happens Next

The script will automatically:

```
[1/7] Starting Minikube cluster...          (~1 min)
[2/7] Configuring Docker environment...     (~5 sec)
[3/7] Building frontend Docker image...     (~3-5 min)
[4/7] Building backend Docker image...      (~2-3 min)
[5/7] Deploying backend to Kubernetes...    (~10 sec)
[6/7] Deploying frontend to Kubernetes...   (~10 sec)
[7/7] Waiting for pods to be ready...       (~30 sec)
```

**Total time: 5-10 minutes**

You'll see green checkmarks ✓ as each step completes.

---

## 🎉 Success!

When complete, you'll see:

```
========================================
   DEPLOYMENT COMPLETE!
========================================

Minikube IP: 192.168.49.2
Frontend URL: http://192.168.49.2:30080

Current Pod Status:
NAME                                      READY   STATUS    RESTARTS   AGE
todo-chatbot-backend-xxx                  1/1     Running   0          1m
todo-chatbot-frontend-xxx                 1/1     Running   0          1m

Open frontend in browser? (y/n):
```

Press **`y`** to open your app automatically!

---

## 🌐 Access Your App

**URL:** `http://<minikube-ip>:30080`

Or run:
```powershell
minikube service todo-chatbot-frontend
```

---

## 📊 Check Status

```powershell
# View all resources
kubectl get all

# View pods
kubectl get pods

# View logs (backend)
kubectl logs -f deployment/todo-chatbot-backend

# View logs (frontend)
kubectl logs -f deployment/todo-chatbot-frontend
```

---

## 🛠️ Common Operations

**Restart services:**
```powershell
kubectl rollout restart deployment/todo-chatbot-backend
kubectl rollout restart deployment/todo-chatbot-frontend
```

**Scale backend:**
```powershell
kubectl scale deployment todo-chatbot-backend --replicas=3
```

**Access Kubernetes dashboard:**
```powershell
minikube dashboard
```

---

## 🧹 Cleanup (When Done)

```powershell
# Uninstall deployments
helm uninstall todo-frontend todo-backend

# Stop Minikube
minikube stop

# Delete cluster (complete wipe)
minikube delete
```

---

## 🚨 Troubleshooting

**Pods not starting?**
```powershell
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

**Can't access frontend?**
```powershell
minikube service list
minikube ip
```

**Need to rebuild?**
```powershell
# Re-run the deployment script
.\deploy-now.ps1
```

---

## 📝 Notes

- **First deployment:** ~10 minutes (builds + deploys)
- **Subsequent deployments:** ~3 minutes (cached builds)
- **Minikube must be running:** Script starts it automatically
- **Docker Desktop must be running:** Check system tray

---

## 🎓 What Gets Deployed

```
Your Computer (Windows)
    │
    ├─ Minikube (Kubernetes Cluster)
    │   │
    │   ├─ Frontend Pod (Next.js)
    │   │   └─ Accessible at: http://<minikube-ip>:30080
    │   │
    │   └─ Backend Pod (FastAPI)
    │       ├─ Neon Database (PostgreSQL)
    │       └─ Ollama (AI - running on host)
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Both pods show `Running` status: `kubectl get pods`
- [ ] Frontend accessible in browser: `http://<minikube-ip>:30080`
- [ ] Can create/edit/delete todos
- [ ] Chat feature works (AI responses)
- [ ] No errors in logs

---

## 🎯 Next Steps

1. **Test all features** - Create todos, use chat
2. **Explore kubectl** - Try commands from above
3. **Scale application** - Add more replicas
4. **View logs** - Monitor application behavior
5. **Try dashboard** - `minikube dashboard`

---

**Ready?** Just run: `.\deploy-now.ps1` in PowerShell!

**Questions?** Check `DEPLOY_NOW.md` for detailed guide.

**🚀 Let's deploy!**
