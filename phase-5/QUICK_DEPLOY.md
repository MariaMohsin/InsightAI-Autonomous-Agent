# Quick Deployment Instructions

## 🚀 Deploy in 15 Minutes

This guide provides step-by-step instructions to deploy your Todo Full-Stack Application.

---

## Part 1: Deploy Backend to Hugging Face (5 minutes)

### Step 1: Create Hugging Face Account
- Go to https://huggingface.co/join if you don't have an account

### Step 2: Create a New Space
1. Go to https://huggingface.co/new-space
2. Fill in:
   - **Owner**: Your username
   - **Space name**: `todo-backend`
   - **License**: Apache 2.0
   - **Select the Space SDK**: Choose **Docker**
   - **Space hardware**: CPU basic (free)
   - **Visibility**: Public
3. Click **Create Space**

### Step 3: Upload Backend Files

**Option A: Using Git CLI**
```bash
# Navigate to backend directory
cd backend

# Initialize git and push to Hugging Face
git init
git lfs install
git remote add space https://huggingface.co/spaces/YOUR_USERNAME/todo-backend
git add .
git commit -m "Deploy backend to Hugging Face"
git push --force space main
```

**Option B: Using Web Interface**
1. In your Space, click **"Files"** tab
2. Click **"Add file"** → **"Upload files"**
3. Drag and drop these files from `backend/` folder:
   - `Dockerfile`
   - `requirements.txt`
   - Entire `app/` folder
   - `run_server.py`
4. Commit changes

### Step 4: Configure Secrets
1. Go to **Settings** tab in your Space
2. Scroll to **"Repository secrets"**
3. Add these secrets one by one:

```
Name: DATABASE_URL
Value: sqlite:///./todos.db

Name: JWT_SECRET_KEY
Value: [Run this command to generate: openssl rand -hex 32]

Name: JWT_ALGORITHM
Value: HS256

Name: JWT_EXPIRATION_HOURS
Value: 24

Name: CORS_ORIGINS
Value: ["*"]
```

Note: We'll update CORS_ORIGINS after deploying frontend.

### Step 5: Wait for Build
- Building takes 2-3 minutes
- Monitor in the **"Logs"** tab
- Your backend URL will be: `https://YOUR_USERNAME-todo-backend.hf.space`

### ✅ Test Backend
Visit: `https://YOUR_USERNAME-todo-backend.hf.space/docs`
You should see the Swagger API documentation.

---

## Part 2: Deploy Frontend to Vercel (5 minutes)

### Step 1: Create Vercel Account
- Go to https://vercel.com/signup
- Sign up with GitHub

### Step 2: Push to GitHub (if not already)
```bash
# From project root
git init
git add .
git commit -m "Prepare deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/todo-chatbot-ui.git
git push -u origin main
```

### Step 3: Import to Vercel
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your `todo-chatbot-ui` repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

### Step 4: Add Environment Variables
In the **"Environment Variables"** section:

```
Name: NEXT_PUBLIC_API_URL
Value: https://YOUR_USERNAME-todo-backend.hf.space

Name: BETTER_AUTH_SECRET
Value: [Run this command: openssl rand -hex 32]
```

Replace `YOUR_USERNAME` with your Hugging Face username.

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Your app will be live at: `https://your-project-name.vercel.app`

### ✅ Test Frontend
Visit your Vercel URL and try:
1. Sign up for an account
2. Sign in
3. Create a todo
4. Test CRUD operations

---

## Part 3: Update CORS (2 minutes)

Now that you have the Vercel URL, update backend CORS:

### Step 1: Update Hugging Face Secret
1. Go to your Hugging Face Space settings
2. Find **"Repository secrets"**
3. Edit `CORS_ORIGINS`:
```
Old: ["*"]
New: ["https://your-project-name.vercel.app"]
```

### Step 2: Force Rebuild
1. Go to **"Files"** tab
2. Make a small edit to trigger rebuild (e.g., add a comment to README)
3. Or use Git:
```bash
cd backend
git commit --allow-empty -m "Update CORS"
git push space main
```

---

## 🎉 Done!

Your application is now fully deployed!

- **Frontend**: `https://your-project-name.vercel.app`
- **Backend**: `https://YOUR_USERNAME-todo-backend.hf.space`
- **API Docs**: `https://YOUR_USERNAME-todo-backend.hf.space/docs`

---

## Troubleshooting

### Issue: "CORS policy error"
**Fix**: Make sure CORS_ORIGINS in Hugging Face matches your exact Vercel URL (no trailing slash)

### Issue: "Failed to fetch"
**Fix**: Check that NEXT_PUBLIC_API_URL in Vercel points to your Hugging Face Space URL

### Issue: "Authentication failed"
**Fix**: Verify BETTER_AUTH_SECRET and JWT_SECRET_KEY are set correctly

### Issue: Backend build fails
**Fix**: Check Hugging Face logs tab for error details. Ensure all files are uploaded correctly.

### Issue: Frontend build fails
**Fix**: Check Vercel deployment logs. Ensure environment variables are set.

---

## Monitoring

### Vercel
- View deployments: https://vercel.com/dashboard
- Check logs: Project → Deployments → Select deployment → Logs

### Hugging Face
- View logs: Space → Logs tab
- Restart: Settings → Factory reboot

---

## Next Steps

- [ ] Set up custom domain on Vercel
- [ ] Add monitoring and analytics
- [ ] Set up database backups (if using PostgreSQL)
- [ ] Configure CI/CD pipelines
- [ ] Add error tracking (Sentry, etc.)

---

## Useful Commands

Generate secrets:
```bash
openssl rand -hex 32
```

Check backend health:
```bash
curl https://YOUR_USERNAME-todo-backend.hf.space/health
```

Check frontend build:
```bash
cd frontend
npm run build
```

---

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Hugging Face Spaces: https://huggingface.co/docs/hub/spaces
- Better Auth: https://better-auth.com/docs
- FastAPI: https://fastapi.tiangolo.com

---

**Need help? Check the detailed DEPLOYMENT_GUIDE.md for more information.**
