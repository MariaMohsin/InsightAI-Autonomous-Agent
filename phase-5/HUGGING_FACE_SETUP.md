# Hugging Face Deployment Guide

## Current Status
✅ Code pushed to: https://huggingface.co/spaces/MariaMohsin/todo-backnd-2

## What to Do Next

### Step 1: Check Your Space Exists

Visit: https://huggingface.co/spaces/MariaMohsin/todo-backnd-2

**If Space doesn't exist:**
1. Go to: https://huggingface.co/new-space
2. Space name: `todo-backnd-2`
3. SDK: **Docker**
4. Click **Create Space**

**If Space exists but empty:**
Run this command to push again:
```bash
cd backend
git push space master --force
```

Or double-click: `backend/push-to-hf.bat`

### Step 2: Configure Secrets (REQUIRED!)

Go to: https://huggingface.co/spaces/MariaMohsin/todo-backnd-2/settings

Scroll to **"Repository secrets"** and add:

#### 1. DATABASE_URL
```
Name: DATABASE_URL
Value: sqlite:///./todos.db
```

#### 2. JWT_SECRET_KEY
Generate with PowerShell:
```powershell
# Run this in PowerShell
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Or use this online: https://generate-secret.vercel.app/32

```
Name: JWT_SECRET_KEY
Value: [paste your generated 64-character hex string]
```

#### 3. JWT_ALGORITHM
```
Name: JWT_ALGORITHM
Value: HS256
```

#### 4. JWT_EXPIRATION_HOURS
```
Name: JWT_EXPIRATION_HOURS
Value: 24
```

#### 5. CORS_ORIGINS (temporary)
```
Name: CORS_ORIGINS
Value: ["*"]
```

### Step 3: Wait for Build

1. Go to your Space
2. Click **"Logs"** tab
3. Watch the build process (2-3 minutes)
4. Wait for "Building... ✓ Done"

### Step 4: Test Your API

Once build completes:

**Health Check:**
```
https://mariamohsin-todo-backnd-2.hf.space/health
```

**API Docs:**
```
https://mariamohsin-todo-backnd-2.hf.space/docs
```

## Troubleshooting

### Problem: Space not showing files
**Solution**: Push again using `push-to-hf.bat`

### Problem: Build failing
**Solution**: Check Logs tab for errors. Make sure all secrets are configured.

### Problem: 500 errors
**Solution**: Verify all 5 secrets are set correctly in Space settings.

## Your Backend URLs

- **Space**: https://huggingface.co/spaces/MariaMohsin/todo-backnd-2
- **API**: https://mariamohsin-todo-backnd-2.hf.space
- **Docs**: https://mariamohsin-todo-backnd-2.hf.space/docs
- **Health**: https://mariamohsin-todo-backnd-2.hf.space/health

## Need Help?

1. Check Space exists: https://huggingface.co/spaces/MariaMohsin/todo-backnd-2
2. Check secrets are configured: Settings → Repository secrets
3. Check build logs: Logs tab
4. Wait 2-3 minutes after secrets are set for build to complete

---

**Important**: After backend is live, you'll need to deploy frontend to Vercel!
