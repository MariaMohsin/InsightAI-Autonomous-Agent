# Phase IV: Deployment Script using kubectl (no Helm required)
# This script deploys Todo Chatbot to Minikube using kubectl directly

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Todo Chatbot - Minikube Deployment" -ForegroundColor Cyan
Write-Host "   (Using kubectl - no Helm required)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify Minikube is running
Write-Host "[1/6] Checking Minikube status..." -ForegroundColor Yellow
try {
    $status = minikube status 2>&1 | Out-String
    if ($status -match "host: Running" -and $status -match "kubelet: Running") {
        Write-Host "  [OK] Minikube is running" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Minikube is not running. Please run: minikube start --driver=docker" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  [ERROR] Minikube not found or not running" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Configure Docker environment for Minikube
Write-Host "[2/6] Configuring Docker environment..." -ForegroundColor Yellow
try {
    & minikube -p minikube docker-env --shell powershell | Invoke-Expression
    Write-Host "  [OK] Docker configured to use Minikube" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Failed to configure Docker: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Build Frontend Image
Write-Host "[3/6] Building frontend Docker image..." -ForegroundColor Yellow
Write-Host "  (Using cached layers - should be fast)" -ForegroundColor Gray
try {
    Set-Location frontend
    docker build -t todo-chatbot-frontend:latest . 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Frontend image built" -ForegroundColor Green
    } else {
        throw "Docker build failed"
    }
    Set-Location ..
} catch {
    Write-Host "  [ERROR] Failed to build frontend: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host ""

# Step 4: Build Backend Image
Write-Host "[4/6] Building backend Docker image..." -ForegroundColor Yellow
Write-Host "  (Using cached layers - should be fast)" -ForegroundColor Gray
try {
    Set-Location backend
    docker build -t todo-chatbot-backend:latest . 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Backend image built" -ForegroundColor Green
    } else {
        throw "Docker build failed"
    }
    Set-Location ..
} catch {
    Write-Host "  [ERROR] Failed to build backend: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host ""

# Step 5: Create Kubernetes manifests from Helm templates
Write-Host "[5/6] Deploying to Kubernetes..." -ForegroundColor Yellow

# Deploy Backend
Write-Host "  Deploying backend..." -ForegroundColor Gray
$backendDeployment = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-chatbot-backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: todo-chatbot-backend
  template:
    metadata:
      labels:
        app: todo-chatbot-backend
    spec:
      containers:
      - name: todo-chatbot-backend
        image: todo-chatbot-backend:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          value: "postgresql://neondb_owner:npg_VxM7hFWf4Lka@ep-ancient-block-ahh0jisw-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
        - name: OLLAMA_HOST
          value: "http://host.minikube.internal:11434"
        - name: JWT_SECRET_KEY
          value: "your-secret-key-change-in-production"
        - name: JWT_ALGORITHM
          value: "HS256"
        - name: ACCESS_TOKEN_EXPIRE_MINUTES
          value: "30"
        - name: BETTER_AUTH_SECRET
          value: "d8b844607dc473a62d5dbf2c44aacbbe5a874ae0919706740f2197421b198f2b"
        resources:
          limits:
            cpu: 1000m
            memory: 1Gi
          requests:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: todo-chatbot-backend
spec:
  type: ClusterIP
  ports:
  - port: 8000
    targetPort: 8000
    protocol: TCP
  selector:
    app: todo-chatbot-backend
"@

$backendDeployment | kubectl apply -f - 2>&1 | Out-Null
Write-Host "    [OK] Backend deployed" -ForegroundColor Green

# Deploy Frontend
Write-Host "  Deploying frontend..." -ForegroundColor Gray
$frontendDeployment = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-chatbot-frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: todo-chatbot-frontend
  template:
    metadata:
      labels:
        app: todo-chatbot-frontend
    spec:
      containers:
      - name: todo-chatbot-frontend
        image: todo-chatbot-frontend:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://todo-chatbot-backend:8000"
        - name: NEXT_PUBLIC_CHAT_ENABLED
          value: "true"
        - name: BETTER_AUTH_SECRET
          value: "d8b844607dc473a62d5dbf2c44aacbbe5a874ae0919706740f2197421b198f2b"
        - name: NODE_ENV
          value: "production"
        resources:
          limits:
            cpu: 500m
            memory: 512Mi
          requests:
            cpu: 250m
            memory: 256Mi
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: todo-chatbot-frontend
spec:
  type: NodePort
  ports:
  - port: 3000
    targetPort: 3000
    nodePort: 30080
    protocol: TCP
  selector:
    app: todo-chatbot-frontend
"@

$frontendDeployment | kubectl apply -f - 2>&1 | Out-Null
Write-Host "    [OK] Frontend deployed" -ForegroundColor Green
Write-Host ""

# Step 6: Wait for pods to be ready
Write-Host "[6/6] Waiting for pods to be ready..." -ForegroundColor Yellow
Write-Host "  (This may take 30-90 seconds)" -ForegroundColor Gray

Start-Sleep -Seconds 5

try {
    kubectl wait --for=condition=available --timeout=120s deployment/todo-chatbot-backend 2>&1 | Out-Null
    Write-Host "  [OK] Backend pod ready" -ForegroundColor Green
} catch {
    Write-Host "  [WARNING] Backend pod may still be starting" -ForegroundColor Yellow
}

try {
    kubectl wait --for=condition=available --timeout=120s deployment/todo-chatbot-frontend 2>&1 | Out-Null
    Write-Host "  [OK] Frontend pod ready" -ForegroundColor Green
} catch {
    Write-Host "  [WARNING] Frontend pod may still be starting" -ForegroundColor Yellow
}

Write-Host ""

# Display deployment status
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get Minikube IP
try {
    $minikubeIP = minikube ip
    Write-Host "Minikube IP: $minikubeIP" -ForegroundColor Cyan
    Write-Host "Frontend URL: http://${minikubeIP}:30080" -ForegroundColor Cyan
} catch {
    Write-Host "Could not get Minikube IP" -ForegroundColor Yellow
}
Write-Host ""

# Display pod status
Write-Host "Current Pod Status:" -ForegroundColor Yellow
kubectl get pods
Write-Host ""

# Display services
Write-Host "Services:" -ForegroundColor Yellow
kubectl get services
Write-Host ""

# Useful commands
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Useful Commands:" -ForegroundColor Yellow
Write-Host "  Access frontend:     minikube service todo-chatbot-frontend" -ForegroundColor White
Write-Host "  View backend logs:   kubectl logs -f deployment/todo-chatbot-backend" -ForegroundColor White
Write-Host "  View frontend logs:  kubectl logs -f deployment/todo-chatbot-frontend" -ForegroundColor White
Write-Host "  Get pod status:      kubectl get pods" -ForegroundColor White
Write-Host "  Scale backend:       kubectl scale deployment todo-chatbot-backend --replicas=3" -ForegroundColor White
Write-Host "  Cleanup:             kubectl delete deployment,service -l app=todo-chatbot-backend" -ForegroundColor White
Write-Host "                       kubectl delete deployment,service -l app=todo-chatbot-frontend" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ask to open in browser
$response = Read-Host "Open frontend in browser? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "Opening browser..." -ForegroundColor Green
    minikube service todo-chatbot-frontend
}

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
