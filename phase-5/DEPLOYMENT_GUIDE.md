# Deployment Guide

## Overview
This guide will walk you through deploying your Todo Full-Stack Application:
- **Frontend**: Next.js app on Vercel
- **Backend**: FastAPI app on Hugging Face Spaces

---

## Part 1: Deploy Backend to Hugging Face Spaces

### Prerequisites
- Hugging Face account (create at https://huggingface.co/join)
- Backend code in the `backend/` directory

### Step 1: Create a Hugging Face Space

1. Go to https://huggingface.co/spaces
2. Click **"Create new Space"**
3. Fill in the details:
   - **Space name**: `todo-backend` (or your preferred name)
   - **License**: Apache 2.0 (or your choice)
   - **Space SDK**: Select **"Docker"**
   - **Visibility**: Public or Private
4. Click **"Create Space"**

### Step 2: Prepare Backend for Deployment

The backend already has a Dockerfile configured. Update the backend requirements if needed:

**Check `backend/requirements.txt`** - Make sure all dependencies are listed.

### Step 3: Upload Backend Code to Hugging Face

You have two options:

#### Option A: Using Git (Recommended)

```bash
cd backend
git init
git remote add space https://huggingface.co/spaces/YOUR_USERNAME/todo-backend
git add .
git commit -m "Initial backend deployment"
git push space main
```

#### Option B: Using Web Interface

1. Go to your Space on Hugging Face
2. Click **"Files and versions"** tab
3. Click **"Add file"** → **"Upload files"**
4. Upload all files from the `backend/` directory:
   - `Dockerfile`
   - `requirements.txt`
   - `app/` folder (all files)
   - `run_server.py`
   - Any other necessary files

### Step 4: Configure Environment Variables (Secrets)

1. In your Hugging Face Space, go to **"Settings"** tab
2. Scroll to **"Repository secrets"**
3. Add the following secrets:

```
DATABASE_URL=sqlite:///./todos.db
JWT_SECRET_KEY=<generate-with-openssl-rand-hex-32>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=["https://your-vercel-app.vercel.app"]
```

**Important**:
- Generate a secure JWT secret: `openssl rand -hex 32`
- You'll update `CORS_ORIGINS` after deploying the frontend

### Step 5: Wait for Build

- Hugging Face will automatically build and deploy your Docker container
- Monitor the build logs in the **"Logs"** tab
- Once deployed, your backend will be available at: `https://huggingface.co/spaces/YOUR_USERNAME/todo-backend`

### Step 6: Test Backend

Visit your backend URL and you should see:
```json
{
  "message": "Todo API is running",
  "status": "ok",
  "version": "1.0.0",
  "docs": "/docs"
}
```

Test the API docs at: `https://YOUR-SPACE-URL/docs`

---

## Part 2: Deploy Frontend to Vercel

### Prerequisites
- Vercel account (create at https://vercel.com/signup)
- GitHub account
- Frontend code in the `frontend/` directory

### Step 1: Push Code to GitHub (if not already done)

```bash
# From project root
git init
git add .
git commit -m "Prepare for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/todo-chatbot-ui.git
git push -u origin main
```

### Step 2: Import Project to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `todo-chatbot-ui`
4. Vercel will auto-detect Next.js

### Step 3: Configure Build Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: Leave default (`.next`)
- **Install Command**: `npm install`

### Step 4: Configure Environment Variables

In the **"Environment Variables"** section, add:

```
NEXT_PUBLIC_API_URL=https://YOUR-HF-SPACE-URL
BETTER_AUTH_SECRET=<your-better-auth-secret>
```

**Replace** `YOUR-HF-SPACE-URL` with your Hugging Face Space URL from Part 1.

Example:
```
NEXT_PUBLIC_API_URL=https://huggingface.co/spaces/username/todo-backend
```

**Generate BETTER_AUTH_SECRET**:
```bash
openssl rand -hex 32
```

### Step 5: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your frontend
3. Monitor the deployment logs
4. Once complete, Vercel will provide a URL like: `https://todo-chatbot-ui.vercel.app`

### Step 6: Update Backend CORS

Now that you have the Vercel URL, update the backend CORS settings:

1. Go back to your Hugging Face Space
2. Go to **"Settings"** → **"Repository secrets"**
3. Update `CORS_ORIGINS` to include your Vercel URL:

```
CORS_ORIGINS=["https://todo-chatbot-ui.vercel.app"]
```

4. Redeploy the backend (push an empty commit if using Git, or make a small change)

---

## Part 3: Verification

### Test the Complete Flow

1. Visit your Vercel frontend URL
2. Try to sign up for a new account
3. Sign in with your credentials
4. Create a todo item
5. Test all CRUD operations (Create, Read, Update, Delete)
6. Test the AI chat feature

### Common Issues

#### CORS Errors
- Make sure `CORS_ORIGINS` in the backend includes your exact Vercel URL
- Check that there are no trailing slashes
- Redeploy backend after changing CORS settings

#### Authentication Errors
- Verify `BETTER_AUTH_SECRET` is set correctly on Vercel
- Verify `JWT_SECRET_KEY` is set correctly on Hugging Face
- Check that both secrets are properly generated

#### API Connection Errors
- Verify `NEXT_PUBLIC_API_URL` points to the correct Hugging Face Space URL
- Make sure the backend is running (check Hugging Face Space status)
- Test the backend `/health` endpoint directly

---

## Deployment URLs Summary

After successful deployment, you'll have:

- **Frontend**: `https://todo-chatbot-ui.vercel.app` (or your custom domain)
- **Backend**: `https://huggingface.co/spaces/USERNAME/todo-backend`
- **API Docs**: `https://huggingface.co/spaces/USERNAME/todo-backend/docs`

---

## Environment Variables Reference

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://huggingface.co/spaces/username/todo-backend
BETTER_AUTH_SECRET=<generated-secret>
```

### Backend (Hugging Face)
```env
DATABASE_URL=sqlite:///./todos.db
JWT_SECRET_KEY=<generated-secret>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=["https://todo-chatbot-ui.vercel.app"]
```

---

## Monitoring and Logs

### Vercel
- Deployments: https://vercel.com/dashboard
- Runtime Logs: Click on your project → "Deployments" → Select deployment → "View Function Logs"

### Hugging Face
- Build Logs: Your Space → "Logs" tab
- Runtime Logs: Available in the same "Logs" tab

---

## Custom Domains (Optional)

### Vercel Custom Domain
1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `CORS_ORIGINS` in backend after domain is active

### Hugging Face Custom Domain
Hugging Face Spaces doesn't support custom domains directly. Use the provided Space URL.

---

## Next Steps

1. Set up monitoring and error tracking
2. Configure database backups (if using PostgreSQL/Neon instead of SQLite)
3. Set up CI/CD for automatic deployments
4. Add analytics
5. Configure custom domain for Vercel

---

## Support

If you encounter issues:
- Vercel: https://vercel.com/docs
- Hugging Face: https://huggingface.co/docs/hub/spaces
- Better Auth: https://better-auth.com/docs
- FastAPI: https://fastapi.tiangolo.com

---

**Congratulations! Your Todo Full-Stack Application is now deployed! 🎉**
