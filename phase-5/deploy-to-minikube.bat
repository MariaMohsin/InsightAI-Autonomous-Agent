@echo off
REM Phase IV: Todo Chatbot - Automated Minikube Deployment Script (Windows)
REM This script automates the entire deployment process

echo.
echo ========================================
echo Todo Chatbot - Minikube Deployment
echo ========================================
echo.

REM Step 1: Check prerequisites
echo [1/7] Checking prerequisites...
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed
    exit /b 1
)
where minikube >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Minikube is not installed
    exit /b 1
)
where kubectl >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: kubectl is not installed
    exit /b 1
)
where helm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Helm is not installed
    exit /b 1
)
echo All prerequisites met!
echo.

REM Step 2: Start Minikube
echo [2/7] Starting Minikube...
minikube status | findstr "Running" >nul 2>&1
if %errorlevel% equ 0 (
    echo Minikube already running
) else (
    minikube start --driver=docker
    echo Minikube started
)
echo.

REM Step 3: Configure Docker environment
echo [3/7] Configuring Docker environment...
@FOR /f "tokens=*" %%i IN ('minikube -p minikube docker-env --shell cmd') DO @%%i
echo Docker environment configured
echo.

REM Step 4: Build Docker images
echo [4/7] Building Docker images...

echo Building frontend image...
cd frontend
docker build -t todo-chatbot-frontend:latest .
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed
    exit /b 1
)
echo Frontend image built

echo Building backend image...
cd ..\backend
docker build -t todo-chatbot-backend:latest .
if %errorlevel% neq 0 (
    echo ERROR: Backend build failed
    exit /b 1
)
echo Backend image built

cd ..
echo.

REM Step 5: Deploy backend
echo [5/7] Deploying backend to Kubernetes...
helm list | findstr "todo-backend" >nul 2>&1
if %errorlevel% equ 0 (
    echo Upgrading existing backend deployment...
    helm upgrade todo-backend helm\backend
) else (
    echo Installing backend...
    helm install todo-backend helm\backend
)
echo Backend deployed
echo.

REM Step 6: Deploy frontend
echo [6/7] Deploying frontend to Kubernetes...
helm list | findstr "todo-frontend" >nul 2>&1
if %errorlevel% equ 0 (
    echo Upgrading existing frontend deployment...
    helm upgrade todo-frontend helm\frontend
) else (
    echo Installing frontend...
    helm install todo-frontend helm\frontend
)
echo Frontend deployed
echo.

REM Step 7: Wait for deployments
echo [7/7] Waiting for deployments to be ready...
kubectl wait --for=condition=available --timeout=120s deployment/todo-chatbot-backend
kubectl wait --for=condition=available --timeout=120s deployment/todo-chatbot-frontend
echo All deployments ready
echo.

REM Display status
echo ========================================
echo Deployment Complete!
echo ========================================
echo.

REM Get Minikube IP
FOR /F "tokens=*" %%g IN ('minikube ip') do (SET MINIKUBE_IP=%%g)
echo Minikube IP: %MINIKUBE_IP%
echo Frontend URL: http://%MINIKUBE_IP%:30080
echo.

REM Display pod status
echo Current Pod Status:
kubectl get pods
echo.

REM Display services
echo Services:
kubectl get services
echo.

REM Useful commands
echo Useful Commands:
echo   - Access frontend:     minikube service todo-chatbot-frontend
echo   - View backend logs:   kubectl logs -f deployment/todo-chatbot-backend
echo   - View frontend logs:  kubectl logs -f deployment/todo-chatbot-frontend
echo   - Get pod status:      kubectl get pods
echo   - Restart backend:     kubectl rollout restart deployment/todo-chatbot-backend
echo   - Restart frontend:    kubectl rollout restart deployment/todo-chatbot-frontend
echo   - Cleanup:             helm uninstall todo-frontend todo-backend
echo.

REM Optionally open in browser
set /p OPEN="Open frontend in browser? (y/n): "
if /i "%OPEN%"=="y" (
    minikube service todo-chatbot-frontend
)

echo.
echo Happy coding!
pause
