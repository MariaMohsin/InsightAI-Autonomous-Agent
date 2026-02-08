#!/bin/bash

# Phase IV: Todo Chatbot - Automated Minikube Deployment Script
# This script automates the entire deployment process

set -e  # Exit on error

echo "🚀 Starting Todo Chatbot Kubernetes Deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${YELLOW}📋 Step 1/7: Checking prerequisites...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is not installed${NC}"; exit 1; }
command -v minikube >/dev/null 2>&1 || { echo -e "${RED}❌ Minikube is not installed${NC}"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo -e "${RED}❌ kubectl is not installed${NC}"; exit 1; }
command -v helm >/dev/null 2>&1 || { echo -e "${RED}❌ Helm is not installed${NC}"; exit 1; }
echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# Step 2: Start Minikube
echo -e "${YELLOW}🔧 Step 2/7: Starting Minikube...${NC}"
if minikube status | grep -q "Running"; then
    echo -e "${GREEN}✅ Minikube already running${NC}"
else
    minikube start --driver=docker
    echo -e "${GREEN}✅ Minikube started${NC}"
fi
echo ""

# Step 3: Configure Docker environment
echo -e "${YELLOW}🐳 Step 3/7: Configuring Docker environment...${NC}"
eval $(minikube docker-env)
echo -e "${GREEN}✅ Docker environment configured for Minikube${NC}"
echo ""

# Step 4: Build Docker images
echo -e "${YELLOW}🔨 Step 4/7: Building Docker images...${NC}"

# Build frontend
echo "Building frontend image..."
cd frontend
docker build -t todo-chatbot-frontend:latest .
echo -e "${GREEN}✅ Frontend image built${NC}"

# Build backend
echo "Building backend image..."
cd ../backend
docker build -t todo-chatbot-backend:latest .
echo -e "${GREEN}✅ Backend image built${NC}"

cd ..
echo ""

# Step 5: Deploy backend
echo -e "${YELLOW}🚢 Step 5/7: Deploying backend to Kubernetes...${NC}"
if helm list | grep -q "todo-backend"; then
    echo "Upgrading existing backend deployment..."
    helm upgrade todo-backend helm/backend
else
    echo "Installing backend..."
    helm install todo-backend helm/backend
fi
echo -e "${GREEN}✅ Backend deployed${NC}"
echo ""

# Step 6: Deploy frontend
echo -e "${YELLOW}🚢 Step 6/7: Deploying frontend to Kubernetes...${NC}"
if helm list | grep -q "todo-frontend"; then
    echo "Upgrading existing frontend deployment..."
    helm upgrade todo-frontend helm/frontend
else
    echo "Installing frontend..."
    helm install todo-frontend helm/frontend
fi
echo -e "${GREEN}✅ Frontend deployed${NC}"
echo ""

# Step 7: Wait for deployments
echo -e "${YELLOW}⏳ Step 7/7: Waiting for deployments to be ready...${NC}"
kubectl wait --for=condition=available --timeout=120s deployment/todo-chatbot-backend
kubectl wait --for=condition=available --timeout=120s deployment/todo-chatbot-frontend
echo -e "${GREEN}✅ All deployments ready${NC}"
echo ""

# Display status
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Get Minikube IP
MINIKUBE_IP=$(minikube ip)
echo -e "${YELLOW}📍 Minikube IP: ${NC}${MINIKUBE_IP}"
echo -e "${YELLOW}🌐 Frontend URL: ${NC}http://${MINIKUBE_IP}:30080"
echo ""

# Display pod status
echo -e "${YELLOW}📊 Current Pod Status:${NC}"
kubectl get pods
echo ""

# Display services
echo -e "${YELLOW}🔗 Services:${NC}"
kubectl get services
echo ""

# Useful commands
echo -e "${YELLOW}📝 Useful Commands:${NC}"
echo "  • Access frontend:     minikube service todo-chatbot-frontend"
echo "  • View backend logs:   kubectl logs -f deployment/todo-chatbot-backend"
echo "  • View frontend logs:  kubectl logs -f deployment/todo-chatbot-frontend"
echo "  • Get pod status:      kubectl get pods"
echo "  • Restart backend:     kubectl rollout restart deployment/todo-chatbot-backend"
echo "  • Restart frontend:    kubectl rollout restart deployment/todo-chatbot-frontend"
echo "  • Cleanup:             helm uninstall todo-frontend todo-backend"
echo ""

# Optionally open in browser
read -p "🌐 Open frontend in browser? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    minikube service todo-chatbot-frontend
fi

echo -e "${GREEN}✨ Happy coding!${NC}"
