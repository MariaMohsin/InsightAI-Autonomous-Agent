---
name: cloud-cluster-connector-skill
description: Configure and connect to Kubernetes clusters (GKE, EKS, AKS, Minikube). Setup kubectl, manage contexts, and establish secure connections.
---

# Cloud Cluster Connector Skill

## Purpose
Configure connections to Kubernetes clusters across different cloud providers and local environments. Manage kubectl contexts, configure authentication, and establish secure cluster access.

## Supported Platforms

### Local Development
- **Minikube** - Local Kubernetes cluster
- **Kind** - Kubernetes in Docker
- **Docker Desktop** - Built-in Kubernetes

### Cloud Providers
- **GKE** - Google Kubernetes Engine
- **EKS** - Amazon Elastic Kubernetes Service
- **AKS** - Azure Kubernetes Service

## Connection Workflow

```
1. Install kubectl CLI
2. Configure cloud provider credentials
3. Get cluster credentials
4. Set kubectl context
5. Verify connection
6. Configure namespace access
```

## Minikube Setup

### Installation & Start
```bash
# Install Minikube (Windows)
choco install minikube

# Start cluster
minikube start --driver=docker
minikube start --cpus=2 --memory=4096

# Check status
minikube status
```

### Connection
```bash
# Kubectl auto-configured by minikube
kubectl cluster-info
kubectl get nodes

# Access dashboard
minikube dashboard
```

## GKE Connection

### Setup
```bash
# Install gcloud CLI
# Authenticate
gcloud auth login

# Get credentials
gcloud container clusters get-credentials CLUSTER_NAME \
  --region=us-central1 \
  --project=PROJECT_ID

# Verify
kubectl cluster-info
kubectl get nodes
```

### Context Management
```bash
# List contexts
kubectl config get-contexts

# Switch context
kubectl config use-context gke_project_region_cluster

# Set namespace
kubectl config set-context --current --namespace=todo-app
```

## EKS Connection

### Setup
```bash
# Install AWS CLI and eksctl
# Configure credentials
aws configure

# Get credentials
aws eks update-kubeconfig \
  --region us-east-1 \
  --name cluster-name

# Verify
kubectl cluster-info
kubectl get nodes
```

## AKS Connection

### Setup
```bash
# Install Azure CLI
# Login
az login

# Get credentials
az aks get-credentials \
  --resource-group myResourceGroup \
  --name myAKSCluster

# Verify
kubectl cluster-info
kubectl get nodes
```

## Context Management

### Multiple Clusters
```bash
# View all contexts
kubectl config get-contexts

# Current context
kubectl config current-context

# Switch between clusters
kubectl config use-context minikube
kubectl config use-context gke_prod_cluster
kubectl config use-context eks_staging_cluster

# Rename context
kubectl config rename-context old-name new-name

# Delete context
kubectl config delete-context context-name
```

## Namespace Management

### Create & Use Namespaces
```bash
# Create namespace
kubectl create namespace todo-app
kubectl create namespace todo-staging
kubectl create namespace todo-prod

# List namespaces
kubectl get namespaces

# Set default namespace for context
kubectl config set-context --current --namespace=todo-app

# Use namespace in commands
kubectl get pods -n todo-app
kubectl get services -n todo-staging
```

## Access Control (RBAC)

### Service Account Setup
```yaml
# serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: todo-app-sa
  namespace: todo-app
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: todo-app-role
  namespace: todo-app
rules:
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list", "create", "update", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: todo-app-binding
  namespace: todo-app
subjects:
- kind: ServiceAccount
  name: todo-app-sa
roleRef:
  kind: Role
  name: todo-app-role
  apiGroup: rbac.authorization.k8s.io
```

## Connection Verification

### Health Checks
```bash
# Cluster info
kubectl cluster-info

# Node status
kubectl get nodes

# Component status
kubectl get componentstatuses

# API versions
kubectl api-versions

# Cluster resources
kubectl get all --all-namespaces
```

## Common Issues & Solutions

### Issue 1: Unable to connect to cluster
```bash
# Check kubeconfig
cat ~/.kube/config

# Verify credentials
kubectl cluster-info

# Re-authenticate
# GKE: gcloud auth login
# EKS: aws configure
# AKS: az login
```

### Issue 2: Context not found
```bash
# List available contexts
kubectl config get-contexts

# Get credentials again
# (run platform-specific get-credentials command)
```

### Issue 3: Permission denied
```bash
# Check current user
kubectl auth whoami

# Check permissions
kubectl auth can-i create pods -n todo-app

# Contact cluster admin for RBAC setup
```

## Security Best Practices

✅ Use service accounts instead of user credentials
✅ Implement RBAC with least privilege
✅ Rotate credentials regularly
✅ Use separate contexts for dev/staging/prod
✅ Never commit kubeconfig files to git
✅ Use encrypted secrets for sensitive data

## Quick Reference

### Essential Commands
```bash
# Connection
kubectl cluster-info
kubectl config current-context
kubectl config use-context CONTEXT_NAME

# Resources
kubectl get nodes
kubectl get pods -n NAMESPACE
kubectl get services -n NAMESPACE
kubectl get all -n NAMESPACE

# Namespaces
kubectl create namespace NAME
kubectl config set-context --current --namespace=NAME

# Debugging
kubectl describe node NODE_NAME
kubectl logs POD_NAME -n NAMESPACE
kubectl exec -it POD_NAME -n NAMESPACE -- /bin/bash
```

## When to Use This Skill

✅ Setting up new Kubernetes cluster connections
✅ Configuring kubectl for multiple environments
✅ Managing cluster access and contexts
✅ Troubleshooting connection issues
✅ Setting up RBAC and service accounts

❌ Don't use for deploying applications (use deployer skills)
❌ Don't use for cluster creation (use cloud provider tools)
