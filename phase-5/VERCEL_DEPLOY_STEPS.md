# 🚀 Deploy Frontend to Vercel - Step by Step

## ✅ Backend Ready!
Your backend is live: https://mariamohsin-todo-backnd-2.hf.space

---

## 📋 Prerequisites

1. ✅ GitHub Account - https://github.com
2. ✅ Vercel Account - https://vercel.com/signup (Sign up with GitHub)

---

## Step 1: Push to GitHub

### A. Create New Repository on GitHub

1. Go to: https://github.com/new
2. Fill in:
   - **Repository name**: `todo-chatbot-ui`
   - **Description**: "Todo Full-Stack Application with AI Chat"
   - **Visibility**: Public or Private (your choice)
   - **DON'T** check "Initialize with README" (we already have code)
3. Click **"Create repository"**

### B. Push Your Code

Open PowerShell in project directory and run:

```powershell
# Configure git (if not done already)
git config user.name "MariaMohsin"
git config user.email "your-email@example.com"

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Todo Full-Stack App with deployed backend"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/todo-chatbot-ui.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note**: Replace `YOUR_USERNAME` with your actual GitHub username!

---

## Step 2: Deploy to Vercel

### A. Import Project

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your `todo-chatbot-ui` repository
4. Click **"Import"**

### B. Configure Project Settings

Vercel will auto-detect Next.js. Verify these settings:

**Framework Preset**: Next.js ✅ (auto-detected)

**Root Directory**:
- Click **"Edit"**
- Select: `frontend`
- Click **"Continue"**

**Build & Development Settings**:
- Build Command: `npm run build` ✅
- Output Directory: `.next` ✅
- Install Command: `npm install` ✅

### C. Add Environment Variables

In **"Environment Variables"** section, add these 2 variables:

#### Variable 1: NEXT_PUBLIC_API_URL
```
Name: NEXT_PUBLIC_API_URL
Value: https://mariamohsin-todo-backnd-2.hf.space
```

#### Variable 2: BETTER_AUTH_SECRET
```
Name: BETTER_AUTH_SECRET
Value: d8b844607dc473a62d5dbf2c44aacbbe5a874ae0919706740f2197421b198f2b
```

**Apply to**: All (Production, Preview, Development) ✅

### D. Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Watch the deployment logs
4. Once done, you'll get your frontend URL!

---

## Step 3: Update Backend CORS

After frontend deploys, you'll get a URL like:
```
https://todo-chatbot-ui.vercel.app
```
or
```
https://todo-chatbot-ui-username.vercel.app
```

### Update Backend CORS:

1. Go to: https://huggingface.co/spaces/MariaMohsin/todo-backnd-2/settings
2. Find **"Repository secrets"**
3. Find `CORS_ORIGINS` secret
4. Click **"Edit"**
5. Change value from `["*"]` to:
   ```
   ["https://your-vercel-url.vercel.app"]
   ```
   **Replace with your actual Vercel URL!**
6. Save
7. Space will auto-rebuild (wait 1-2 minutes)

---

## Step 4: Test Your App! 🎉

1. Visit your Vercel URL
2. Click **"Sign Up"**
3. Create account with email & password
4. Sign in
5. Create a todo
6. Test all CRUD operations
7. Test AI chat (if enabled)

---

## 🎯 Quick Commands Summary

```powershell
# In project root directory:
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/todo-chatbot-ui.git
git branch -M main
git push -u origin main
```

Then go to Vercel and import!

---

## ✅ Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Root directory set to `frontend`
- [ ] Environment variables added (2 variables)
- [ ] Deployment started
- [ ] Deployment successful
- [ ] Frontend URL copied
- [ ] Backend CORS updated with Vercel URL
- [ ] Full app tested (signup, signin, todos)

---

## 📞 Your URLs

**Backend (HuggingFace):**
```
https://mariamohsin-todo-backnd-2.hf.space
```

**Frontend (Vercel):**
```
https://_____________________________.vercel.app
```
(Fill in after deployment!)

**API Docs:**
```
https://mariamohsin-todo-backnd-2.hf.space/docs
```

---

## 🆘 Troubleshooting

### Build fails on Vercel
- Check Root Directory is set to `frontend`
- Check Environment Variables are set
- Check deployment logs for specific error

### Can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running at HuggingFace
- Update CORS on backend with your Vercel URL

### Sign up/Sign in not working
- Check `BETTER_AUTH_SECRET` is set
- Check browser console for errors
- Verify backend `/auth/signup` endpoint works

---

**Next Action**: Create GitHub repo and push code!

GitHub New Repo: https://github.com/new
