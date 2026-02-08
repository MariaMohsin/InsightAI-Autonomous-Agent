@echo off
REM Pre-Flight Environment Checker for Phase IV Deployment

echo.
echo ========================================
echo Phase IV - Environment Check
echo ========================================
echo.

set ALL_OK=1

echo [1/5] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Docker is NOT installed or not running
    set ALL_OK=0
) else (
    docker --version
    echo [OK] Docker is installed
)
echo.

echo [2/5] Checking Minikube...
minikube version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Minikube is NOT installed
    set ALL_OK=0
) else (
    minikube version
    echo [OK] Minikube is installed
)
echo.

echo [3/5] Checking kubectl...
kubectl version --client >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] kubectl is NOT installed
    set ALL_OK=0
) else (
    kubectl version --client --short
    echo [OK] kubectl is installed
)
echo.

echo [4/5] Checking Helm...
helm version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Helm is NOT installed
    set ALL_OK=0
) else (
    helm version --short
    echo [OK] Helm is installed
)
echo.

echo [5/5] Checking Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Ollama is NOT running (optional - needed for AI chat)
    echo     Start Ollama before deploying if you want AI features
) else (
    echo [OK] Ollama is running on port 11434
)
echo.

echo ========================================
if %ALL_OK%==1 (
    echo Result: ALL CHECKS PASSED!
    echo.
    echo You are ready to deploy!
    echo.
    echo Next steps:
    echo   1. Run: deploy-to-minikube.bat
    echo   2. Or follow: START_HERE.md
) else (
    echo Result: SOME CHECKS FAILED
    echo.
    echo Please install missing tools:
    echo   - Docker Desktop: https://www.docker.com/products/docker-desktop
    echo   - Minikube: https://minikube.sigs.k8s.io/docs/start/
    echo   - kubectl: https://kubernetes.io/docs/tasks/tools/
    echo   - Helm: https://helm.sh/docs/intro/install/
)
echo ========================================
echo.

pause
