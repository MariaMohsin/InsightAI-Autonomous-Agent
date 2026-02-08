# Phase IV: Automatic Deployment Script for PowerShell
# This script deploys Todo Chatbot to Minikube

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Todo Chatbot - Minikube Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Start Minikube
Write-Host "[1/7] Starting Minikube cluster..." -ForegroundColor Yellow
$minikubeRunning = $false

# Check if Minikube is running
try {
    $status = minikube status 2>&1 | Out-String
    if ($status -match "host: Running" -and $status -match "kubelet: Running") {
        Write-Host "  [OK] Minikube already running" -ForegroundColor Green
        $minikubeRunning = $true
    }
} catch {
    # Minikube not running
}

# If not running or in bad state, restart it
if (-not $minikubeRunning) {
    Write-Host "  Starting Minikube (this may take 1-2 minutes)..." -ForegroundColor Gray
    try {
        # Try to stop any existing instance
        minikube stop 2>&1 | Out-Null
        # Delete if needed
        minikube delete 2>&1 | Out-Null
        # Start fresh
        minikube start --driver=docker
        Write-Host "  [OK] Minikube started successfully" -ForegroundColor Green
    } catch {
        Write-Host "  [ERROR] Failed to start Minikube: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please try manually:" -ForegroundColor Yellow
        Write-Host "  minikube delete" -ForegroundColor White
        Write-Host "  minikube start --driver=docker" -ForegroundColor White
        exit 1
    }
}
Write-Host ""

# Step 2: Configure Docker environment for Minikube
Write-Host "[2/7] Configuring Docker environment..." -ForegroundColor Yellow
try {
    & minikube -p minikube docker-env --shell powershell | Invoke-Expression
    Write-Host "  [OK] Docker configured to use Minikube" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Failed to configure Docker: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Build Frontend Image
Write-Host "[3/7] Building frontend Docker image..." -ForegroundColor Yellow
Write-Host "  (This may take 3-5 minutes, or be instant if cached)" -ForegroundColor Gray
try {
    Set-Location frontend
    $buildOutput = docker build -t todo-chatbot-frontend:latest . 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Frontend image built successfully" -ForegroundColor Green
    } else {
        Write-Host $buildOutput
        throw "Docker build failed with exit code $LASTEXITCODE"
    }
    Set-Location ..
} catch {
    Write-Host "  [ERROR] Failed to build frontend: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host ""

# Step 4: Build Backend Image
Write-Host "[4/7] Building backend Docker image..." -ForegroundColor Yellow
Write-Host "  (This may take 2-3 minutes, or be instant if cached)" -ForegroundColor Gray
try {
    Set-Location backend
    $buildOutput = docker build -t todo-chatbot-backend:latest . 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Backend image built successfully" -ForegroundColor Green
    } else {
        Write-Host $buildOutput
        throw "Docker build failed with exit code $LASTEXITCODE"
    }
    Set-Location ..
} catch {
    Write-Host "  [ERROR] Failed to build backend: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host ""

# Step 5: Deploy Backend with Helm
Write-Host "[5/7] Deploying backend to Kubernetes..." -ForegroundColor Yellow
try {
    $helmList = helm list -q 2>&1 | Out-String
    if ($helmList -match "todo-backend") {
        Write-Host "  Upgrading existing backend deployment..." -ForegroundColor Gray
        helm upgrade todo-backend helm\backend 2>&1 | Out-Null
    } else {
        helm install todo-backend helm\backend 2>&1 | Out-Null
    }
    Write-Host "  [OK] Backend deployed" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Failed to deploy backend: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 6: Deploy Frontend with Helm
Write-Host "[6/7] Deploying frontend to Kubernetes..." -ForegroundColor Yellow
try {
    $helmList = helm list -q 2>&1 | Out-String
    if ($helmList -match "todo-frontend") {
        Write-Host "  Upgrading existing frontend deployment..." -ForegroundColor Gray
        helm upgrade todo-frontend helm\frontend 2>&1 | Out-Null
    } else {
        helm install todo-frontend helm\frontend 2>&1 | Out-Null
    }
    Write-Host "  [OK] Frontend deployed" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Failed to deploy frontend: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 7: Wait for deployments to be ready
Write-Host "[7/7] Waiting for pods to be ready..." -ForegroundColor Yellow
Write-Host "  (This may take 30-90 seconds)" -ForegroundColor Gray

# Give pods a moment to start
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
Write-Host "  Cleanup:             helm uninstall todo-frontend todo-backend" -ForegroundColor White
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
