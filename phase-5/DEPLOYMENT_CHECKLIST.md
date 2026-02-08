# Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment Preparation

- [ ] Ensure all code is committed to Git
- [ ] Test frontend locally (`cd frontend && npm run dev`)
- [ ] Test backend locally (`cd backend && uvicorn app.main:app --reload`)
- [ ] Generate JWT secret key: `openssl rand -hex 32`
- [ ] Generate Better Auth secret: `openssl rand -hex 32`
- [ ] Save both secrets securely (you'll need them for deployment)

---

## Backend Deployment (Hugging Face Spaces)

### Account Setup
- [ ] Create Hugging Face account at https://huggingface.co/join
- [ ] Verify email address

### Create Space
- [ ] Go to https://huggingface.co/new-space
- [ ] Space name: `todo-backend` (or your choice)
- [ ] SDK: Docker
- [ ] Hardware: CPU basic (free)
- [ ] Visibility: Public or Private
- [ ] Click "Create Space"

### Upload Files
Choose one method:

#### Git Method
- [ ] Navigate to backend: `cd backend`
- [ ] Initialize git: `git init`
- [ ] Add remote: `git remote add space https://huggingface.co/spaces/YOUR_USERNAME/todo-backend`
- [ ] Add files: `git add .`
- [ ] Commit: `git commit -m "Deploy backend"`
- [ ] Push: `git push --force space main`

#### Web Upload Method
- [ ] Click "Files" → "Add file" → "Upload files"
- [ ] Upload `Dockerfile`
- [ ] Upload `requirements.txt`
- [ ] Upload entire `app/` folder
- [ ] Upload `run_server.py`
- [ ] Commit changes

### Configure Secrets
In Space Settings → Repository secrets, add:

- [ ] `DATABASE_URL` = `sqlite:///./todos.db`
- [ ] `JWT_SECRET_KEY` = [your generated secret]
- [ ] `JWT_ALGORITHM` = `HS256`
- [ ] `JWT_EXPIRATION_HOURS` = `24`
- [ ] `CORS_ORIGINS` = `["*"]` (temporary, will update later)

### Verify Deployment
- [ ] Wait for build (2-3 minutes)
- [ ] Check "Logs" tab for any errors
- [ ] Note your backend URL: `https://YOUR_USERNAME-todo-backend.hf.space`
- [ ] Visit backend URL - should see JSON response
- [ ] Visit `/docs` endpoint - should see Swagger UI
- [ ] Test `/health` endpoint - should return `{"status":"healthy"}`

---

## Frontend Deployment (Vercel)

### Account Setup
- [ ] Create Vercel account at https://vercel.com/signup
- [ ] Connect GitHub account

### Push to GitHub
- [ ] Create new repo on GitHub
- [ ] From project root: `git init`
- [ ] Add remote: `git remote add origin https://github.com/YOUR_USERNAME/todo-chatbot-ui.git`
- [ ] Add files: `git add .`
- [ ] Commit: `git commit -m "Initial commit"`
- [ ] Push: `git push -u origin main`

### Import to Vercel
- [ ] Go to https://vercel.com/new
- [ ] Click "Import Git Repository"
- [ ] Select `todo-chatbot-ui` repository
- [ ] Framework: Next.js (should auto-detect)
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm run build` (auto-filled)
- [ ] Output Directory: `.next` (auto-filled)

### Configure Environment Variables
Add in Vercel:

- [ ] `NEXT_PUBLIC_API_URL` = `https://YOUR_USERNAME-todo-backend.hf.space`
- [ ] `BETTER_AUTH_SECRET` = [your generated secret]

### Deploy
- [ ] Click "Deploy"
- [ ] Wait for build (2-3 minutes)
- [ ] Note your Vercel URL: `https://your-project-name.vercel.app`

### Verify Deployment
- [ ] Visit Vercel URL
- [ ] Should see Todo app landing/sign-up page
- [ ] No console errors in browser DevTools

---

## Post-Deployment Configuration

### Update CORS
- [ ] Go to Hugging Face Space Settings
- [ ] Update `CORS_ORIGINS` secret
- [ ] Change from `["*"]` to `["https://your-project-name.vercel.app"]`
- [ ] Force rebuild (make small change or empty commit)
- [ ] Wait for rebuild

---

## Final Testing

### Test Authentication Flow
- [ ] Open frontend in browser
- [ ] Click "Sign Up"
- [ ] Create a new account with email and password
- [ ] Should redirect to dashboard after signup
- [ ] Sign out
- [ ] Sign in with same credentials
- [ ] Should successfully sign in

### Test Todo CRUD Operations
- [ ] Create a new todo
- [ ] Verify todo appears in list
- [ ] Edit the todo
- [ ] Verify changes saved
- [ ] Mark todo as complete
- [ ] Delete a todo
- [ ] Verify todo is removed

### Test AI Chat (if implemented)
- [ ] Click on chat icon/button
- [ ] Send a message
- [ ] Verify AI responds
- [ ] Test todo-related queries

### Test Across Devices
- [ ] Test on desktop browser
- [ ] Test on mobile browser
- [ ] Test in incognito/private mode
- [ ] Test on different browsers (Chrome, Firefox, Safari)

### Check Error Handling
- [ ] Try signing up with existing email
- [ ] Try signing in with wrong password
- [ ] Try creating todo with empty fields
- [ ] Check error messages display correctly

---

## Documentation

- [ ] Update README.md with deployment URLs
- [ ] Document environment variables
- [ ] Add troubleshooting section
- [ ] Include screenshots (optional)

---

## Optional Enhancements

- [ ] Set up custom domain on Vercel
- [ ] Configure automatic deployments on Git push
- [ ] Set up monitoring/error tracking
- [ ] Add analytics
- [ ] Configure database backups
- [ ] Set up SSL certificate (Vercel auto-handles this)

---

## Deployment URLs

Record your deployment URLs here for reference:

**Frontend (Vercel):**
```
https://______________________.vercel.app
```

**Backend (Hugging Face):**
```
https://______________________.hf.space
```

**API Documentation:**
```
https://______________________.hf.space/docs
```

---

## Common Issues and Solutions

### Issue: CORS Error
**Symptom:** "CORS policy" error in browser console
**Solution:**
- [ ] Verify CORS_ORIGINS in Hugging Face exactly matches Vercel URL
- [ ] No trailing slash in URL
- [ ] Rebuild backend after changing CORS

### Issue: 404 on API Calls
**Symptom:** Frontend can't connect to backend
**Solution:**
- [ ] Check NEXT_PUBLIC_API_URL in Vercel is correct
- [ ] Verify backend is running (visit /health endpoint)
- [ ] Check Hugging Face logs for errors

### Issue: Authentication Fails
**Symptom:** Can't sign up or sign in
**Solution:**
- [ ] Verify JWT_SECRET_KEY is set in Hugging Face
- [ ] Verify BETTER_AUTH_SECRET is set in Vercel
- [ ] Check both secrets are properly generated (32-byte hex)

### Issue: Build Fails
**Backend build fails:**
- [ ] Check Hugging Face "Logs" tab
- [ ] Verify all files uploaded correctly
- [ ] Check Dockerfile syntax
- [ ] Verify requirements.txt has all dependencies

**Frontend build fails:**
- [ ] Check Vercel deployment logs
- [ ] Verify environment variables are set
- [ ] Check for syntax errors in code
- [ ] Verify dependencies in package.json

---

## Support Resources

- Vercel Documentation: https://vercel.com/docs
- Hugging Face Spaces: https://huggingface.co/docs/hub/spaces
- Better Auth Docs: https://better-auth.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com
- Next.js Docs: https://nextjs.org/docs

---

## Completion

- [ ] All tests passing
- [ ] Both deployments successful
- [ ] CORS configured correctly
- [ ] URLs documented
- [ ] App fully functional

**Deployment Date:** _______________

**Deployed By:** _______________

---

🎉 **Congratulations! Your Todo Full-Stack Application is now live!** 🎉
