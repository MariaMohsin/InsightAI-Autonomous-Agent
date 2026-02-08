# Quickstart Guide: AI Todo Chatbot

**Feature**: 004-ai-todo-chatbot
**Date**: 2026-01-22
**Prerequisite**: Phase II Todo App (backend, frontend, database, authentication) must be fully functional

This guide walks you through running the AI Todo Chatbot feature locally for development and testing.

---

## Prerequisites

### System Requirements
- Python 3.11+ (for backend)
- Node.js 18+ and npm/pnpm (for frontend)
- PostgreSQL 14+ (local) OR Neon PostgreSQL account
- Git (for version control)

### Phase II Dependencies
Before starting Phase III, ensure Phase II is complete:
- ✅ Backend FastAPI server running (`backend/src/main.py`)
- ✅ Frontend Next.js app running (`frontend/`)
- ✅ PostgreSQL database with `users` and `todos` tables
- ✅ Better Auth configured with JWT authentication
- ✅ Users can sign up, sign in, and manage todos via REST API

### Required Accounts/Keys
- **OpenAI API Key**: Get from https://platform.openai.com/api-keys
  - Required for AI agent (GPT-4)
  - Cost: ~$0.01 per conversation (GPT-4 pricing)
- **Neon Database URL**: From Phase II setup
- **Better Auth Secret**: Shared between frontend and backend (from Phase II)

---

## Step 1: Environment Setup

### 1.1 Backend Environment Variables

Create or update `backend/.env`:

```bash
# Database (from Phase II)
DATABASE_URL=postgresql://user:password@localhost:5432/todoapp
# OR for Neon:
# DATABASE_URL=postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech/todoapp?sslmode=require

# Authentication (from Phase II)
BETTER_AUTH_SECRET=your-shared-secret-key-from-phase-2

# AI Agent (NEW - Phase III)
OPENAI_API_KEY=sk-proj-...your-openai-api-key...

# MCP Server (NEW - Phase III)
MCP_SERVER_PORT=3001

# App Config
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### 1.2 Frontend Environment Variables

Update `frontend/.env.local`:

```bash
# Authentication (from Phase II)
NEXT_PUBLIC_BETTER_AUTH_SECRET=your-shared-secret-key-from-phase-2
NEXT_PUBLIC_API_URL=http://localhost:8000

# Chat Feature (NEW - Phase III)
NEXT_PUBLIC_CHAT_ENABLED=true
```

---

## Step 2: Database Migration

### 2.1 Apply Phase III Schema

Run the migration to add `conversations` and `messages` tables:

```bash
cd backend

# Apply migration
python src/database/migrations/004_add_conversations_messages.py

# OR using Alembic (if configured):
# alembic upgrade head
```

### 2.2 Verify Schema

Connect to your database and verify tables exist:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should include:
-- - users
-- - todos
-- - conversations (NEW)
-- - messages (NEW)

-- Verify foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

---

## Step 3: Install Dependencies

### 3.1 Backend Dependencies

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# New dependencies for Phase III:
# - openai-swarm (AI agent framework)
# - mcp (Model Context Protocol SDK)
# - python-jose[cryptography] (JWT validation)
```

**backend/requirements.txt** (Phase III additions):

```txt
# Existing Phase II dependencies
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlmodel==0.0.14
asyncpg==0.29.0
python-multipart==0.0.6
pydantic[email]==2.5.0

# Phase III additions
openai-swarm==1.0.0
mcp==0.1.0
python-jose[cryptography]==3.3.0
```

### 3.2 Frontend Dependencies

```bash
cd frontend

# Install Node dependencies
npm install
# OR
pnpm install

# New dependencies for Phase III:
# - @chatscope/chat-ui-kit-react (chat UI components)
# - @chatscope/chat-ui-kit-styles (chat UI styles)
```

**frontend/package.json** (Phase III additions):

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@chatscope/chat-ui-kit-react": "^2.0.3",
    "@chatscope/chat-ui-kit-styles": "^1.4.0"
  }
}
```

---

## Step 4: Start Backend Services

### 4.1 Start FastAPI Server

```bash
cd backend

# Start backend server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process
# INFO:     Started server process
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
```

### 4.2 Verify Backend Health

Open browser or use curl:

```bash
# Health check
curl http://localhost:8000/health

# Expected response:
# {"status": "healthy", "database": "connected", "mcp_server": "running"}

# OpenAPI docs
open http://localhost:8000/docs
```

---

## Step 5: Start Frontend Application

```bash
cd frontend

# Start Next.js dev server
npm run dev
# OR
pnpm dev

# Expected output:
# > frontend@1.0.0 dev
# > next dev
#
# - ready started server on 0.0.0.0:3000, url: http://localhost:3000
# - event compiled client and server successfully
```

Open browser:
```bash
open http://localhost:3000
```

---

## Step 6: Test the Chat Feature

### 6.1 Sign Up / Sign In

1. Navigate to http://localhost:3000
2. Click "Sign Up" or "Sign In"
3. Use test credentials:
   - Email: `test@example.com`
   - Password: `password123`

### 6.2 Access Chat Interface

1. After signing in, navigate to http://localhost:3000/chat
2. You should see the chat interface with:
   - Message history (empty for new conversations)
   - Message input field at bottom
   - Send button

### 6.3 Test Natural Language Commands

Try these example commands in the chat interface:

**Create a todo:**
```
You: add a task to call mom tomorrow
Bot: I've added "call mom" to your todos for tomorrow!
```

**List todos:**
```
You: what are my tasks for today?
Bot: You have 2 tasks for today:
     1. Finish report (high priority)
     2. Buy groceries
```

**Update a todo:**
```
You: change the priority of the report task to high
Bot: I've updated "Finish report" to high priority.
```

**Complete a todo:**
```
You: I finished the report
Bot: Great job! I've marked "Finish report" as completed. 🎉
```

**Delete a todo:**
```
You: delete the grocery task
Bot: I've removed "Buy groceries" from your todos.
```

### 6.4 Verify Database Changes

After chatting, verify data persistence:

```sql
-- Check conversations
SELECT * FROM conversations;

-- Check messages
SELECT * FROM messages ORDER BY created_at;

-- Check todos (should reflect chat operations)
SELECT * FROM todos WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
```

---

## Step 7: Debugging & Troubleshooting

### 7.1 Backend Logs

Check backend terminal for errors:

```bash
# Look for these log lines:
# INFO: Chat request received for user_id=...
# INFO: MCP tool called: add_task
# INFO: Agent response generated
# ERROR: [any errors]
```

### 7.2 Common Issues

**Issue: "Invalid or expired token"**
- Solution: Sign out and sign in again. JWT token may have expired.
- Check: `BETTER_AUTH_SECRET` is identical in frontend and backend `.env` files

**Issue: "OpenAI API error: Invalid API key"**
- Solution: Verify `OPENAI_API_KEY` in `backend/.env` is correct
- Check: API key has sufficient credits on OpenAI platform

**Issue: "Database connection error"**
- Solution: Verify `DATABASE_URL` is correct and database is running
- Check: Migrations have been applied (`conversations` and `messages` tables exist)

**Issue: "MCP server not running"**
- Solution: Restart backend server
- Check: Port 3001 is not already in use (`lsof -i :3001`)

**Issue: Chat UI not loading**
- Solution: Clear browser cache and reload
- Check: `@chatscope/chat-ui-kit-react` is installed in `frontend/node_modules`

### 7.3 Reset Conversation Data

To start fresh during testing:

```sql
-- Delete all conversations and messages (CASCADE deletes messages)
DELETE FROM conversations WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- Verify deletion
SELECT COUNT(*) FROM conversations;
SELECT COUNT(*) FROM messages;
```

---

## Step 8: Production Deployment

### 8.1 Environment Variables

Set production environment variables:

**Backend:**
```bash
DATABASE_URL=<neon-production-url>
BETTER_AUTH_SECRET=<strong-secret-key>
OPENAI_API_KEY=<production-api-key>
ENVIRONMENT=production
LOG_LEVEL=WARNING
```

**Frontend:**
```bash
NEXT_PUBLIC_API_URL=https://api.todoapp.example.com
NEXT_PUBLIC_BETTER_AUTH_SECRET=<same-as-backend-secret>
NEXT_PUBLIC_CHAT_ENABLED=true
```

### 8.2 Build Applications

**Backend:**
```bash
cd backend
pip install --no-cache-dir -r requirements.txt
# Deploy to your hosting platform (AWS, GCP, Render, etc.)
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
# OR deploy to Vercel/Netlify
```

### 8.3 Database Migration (Production)

```bash
# Connect to production database
psql <production-database-url>

# Run migration script
\i backend/src/database/migrations/004_add_conversations_messages.sql
```

### 8.4 Monitoring

Monitor production:
- OpenAI API usage and costs (https://platform.openai.com/usage)
- Database storage growth (conversations/messages)
- API latency and error rates
- User chat engagement metrics

---

## Next Steps

1. ✅ Local development setup complete
2. ⏳ Implement additional MCP tools (search, bulk operations)
3. ⏳ Add conversation search and filtering
4. ⏳ Implement conversation archival for long histories
5. ⏳ Add E2E tests for chat flows
6. ⏳ Optimize AI agent prompts for better accuracy
7. ⏳ Deploy to production

---

## Helpful Commands

### Backend

```bash
# Start backend
cd backend && uvicorn src.main:app --reload

# Run backend tests
cd backend && pytest

# Check MCP tool schemas
cd backend && python -m src.mcp.server --list-tools

# View logs
tail -f backend/logs/app.log
```

### Frontend

```bash
# Start frontend
cd frontend && npm run dev

# Build frontend
cd frontend && npm run build

# Run frontend tests
cd frontend && npm test

# Type check
cd frontend && npm run type-check
```

### Database

```bash
# Connect to local database
psql -U user -d todoapp

# Connect to Neon database
psql <neon-connection-string>

# Export conversation data
pg_dump -U user -d todoapp -t conversations -t messages > conversations_backup.sql
```

---

## 9. Deployment Configuration (Production)

### 9.1 Complete Environment Variables Reference

#### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string (with SSL for production) |
| `BETTER_AUTH_SECRET` | Yes | - | Shared secret for JWT token validation (min 32 chars) |
| `OPENAI_API_KEY` | Yes | - | OpenAI API key (sk-proj-...) |
| `MCP_SERVER_PORT` | No | 3001 | Port for MCP server (internal) |
| `ENVIRONMENT` | No | development | Environment name (development/staging/production) |
| `LOG_LEVEL` | No | INFO | Logging level (DEBUG/INFO/WARNING/ERROR) |
| `CORS_ORIGINS` | No | * | Allowed CORS origins (comma-separated) |
| `JWT_EXPIRATION_HOURS` | No | 24 | JWT token expiration in hours |
| `MAX_CONTEXT_MESSAGES` | No | 50 | Max messages to load for agent context |
| `RATE_LIMIT_REQUESTS` | No | 20 | Max chat requests per minute per user |

#### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | http://localhost:8000 | Backend API base URL |
| `NEXT_PUBLIC_BETTER_AUTH_SECRET` | Yes | - | Must match backend secret |
| `NEXT_PUBLIC_CHAT_ENABLED` | No | false | Enable/disable chat feature |

### 9.2 Security Best Practices

**Environment Secrets:**
- Never commit `.env` files to version control
- Use different secrets for development/staging/production
- Rotate secrets regularly (quarterly minimum)
- Use environment variable management services (AWS Secrets Manager, Vault, etc.)

**OpenAI API Key:**
- Set usage limits in OpenAI dashboard
- Monitor costs daily in production
- Use separate API keys for dev/staging/prod
- Enable rate limiting in OpenAI account

**Database:**
- Always use SSL in production (`?sslmode=require`)
- Use read-only database users for analytics/reporting
- Enable connection pooling (pgbouncer recommended)
- Set up automated backups (daily minimum)

### 9.3 Deployment Platforms

#### Option 1: Vercel (Frontend) + Render (Backend)

**Frontend (Vercel):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
```

**Backend (Render):**
- Create new Web Service
- Connect GitHub repository
- Set build command: `pip install -r requirements.txt`
- Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add environment variables in Render dashboard

#### Option 2: Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## 10. Troubleshooting Guide

### 10.1 Chat Not Working / No Response

**Symptoms:** User sends message but gets no response or error message.

**Common Causes:**
1. **OpenAI API Key Invalid**
   - Check: `OPENAI_API_KEY` set in `backend/.env`
   - Verify: Key starts with `sk-proj-` and is valid
   - Test: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`
   - Fix: Generate new key at https://platform.openai.com/api-keys

2. **Database Connection Failed**
   - Check: Backend logs for "connection refused" or "authentication failed"
   - Verify: `DATABASE_URL` is correct and database is running
   - Test: `psql $DATABASE_URL -c "SELECT 1"`
   - Fix: Update connection string or start database

3. **Migration Not Applied**
   - Check: Run `SELECT * FROM conversations LIMIT 1;` in database
   - Error: "relation does not exist" means migration not applied
   - Fix: Run migration script (see Step 2)

4. **Agent Runner Error**
   - Check: Backend logs for "OpenAI API error" or "Agent execution failed"
   - Common: Rate limits exceeded, insufficient credits
   - Fix: Check OpenAI usage limits and add credits

### 10.2 Authentication Errors

**Symptoms:** "Could not validate credentials" or 401 errors

**Causes & Fixes:**
1. **Token Expired**
   - User needs to log out and log back in
   - Check: JWT expiration time in backend config

2. **Secret Mismatch**
   - Frontend and backend `BETTER_AUTH_SECRET` must match exactly
   - Check: Both `.env` files have same secret
   - Fix: Copy secret from backend to frontend `.env.local`

3. **Missing Authorization Header**
   - Check: Browser DevTools → Network → Request Headers
   - Should see: `Authorization: Bearer <token>`
   - Fix: Re-login to get fresh token

### 10.3 Rate Limiting / 429 Errors

**Symptoms:** "Too many requests" error after several messages

**Causes:**
- Default limit: 20 requests per minute per user
- User sending messages too quickly

**Fixes:**
1. Wait 60 seconds and try again
2. Increase limit in `backend/app/routers/chat.py`:
   ```python
   RATE_LIMIT_REQUESTS = 50  # Increase limit
   RATE_LIMIT_WINDOW = 60
   ```

### 10.4 Slow Response Times

**Symptoms:** Chat takes >10 seconds to respond

**Common Causes:**
1. **Large Conversation History**
   - Limit automatically applied (50 messages)
   - Consider starting new conversation for very long chats

2. **OpenAI API Latency**
   - Check: OpenAI status at https://status.openai.com
   - Peak hours may have slower response

3. **Database Query Slow**
   - Check: Verify indexes exist (see migration SQL)
   - Run: `EXPLAIN ANALYZE SELECT * FROM messages WHERE conversation_id = 1;`
   - Should use index: `idx_messages_conversation_id_created_at`

4. **Cold Start (Serverless)**
   - First request after inactivity is slower
   - Keep-alive pings can reduce cold starts

### 10.5 Messages Not Persisting

**Symptoms:** Messages disappear after page refresh

**Causes:**
1. **Database Write Failed**
   - Check: Backend logs for "commit failed" or SQLAlchemy errors
   - Common: Database connection lost, insufficient permissions
   - Fix: Check database user has INSERT permission

2. **Frontend Not Saving conversation_id**
   - Check: Browser DevTools → Application → Local Storage
   - Should see conversation state maintained
   - Fix: Clear cache and start new conversation

### 10.6 Tool Calls Not Working

**Symptoms:** Agent responds but doesn't create/update todos

**Debugging:**
1. Check backend logs for tool execution:
   ```
   INFO: Agent made 1 tool calls: ['add_task']
   ```

2. Verify MCP tools are registered:
   ```bash
   cd backend
   python -c "from app.mcp.server import server; print(server.list_tools())"
   ```

3. Check tool function errors:
   - Look for "DATABASE_ERROR" or "VALIDATION_ERROR" in logs
   - Verify user_id is valid integer

4. Test tool directly:
   ```python
   from app.mcp.tools import add_task
   result = await add_task(user_id="1", title="Test task")
   print(result)
   ```

### 10.7 Memory/Performance Issues

**Symptoms:** Backend crashes or becomes unresponsive

**Solutions:**
1. **Limit Conversation Size**
   - Already limited to 50 messages
   - Archive old conversations (see `app/services/archival.py`)

2. **Database Connection Pool**
   - Use pgbouncer for connection pooling
   - Limit max connections in SQLAlchemy

3. **Monitor Metrics**
   - Access `/api/metrics` endpoint (authenticated)
   - Monitor latency, error rates, token usage

### 10.8 Deployment Issues

**Symptoms:** Works locally but fails in production

**Checklist:**
- [ ] All environment variables set in production
- [ ] Database migration applied to production database
- [ ] Database URL uses SSL (`?sslmode=require`)
- [ ] CORS configured for production frontend URL
- [ ] OpenAI API key is production key (not dev key)
- [ ] Firewall allows outbound HTTPS to api.openai.com
- [ ] Frontend `NEXT_PUBLIC_API_URL` points to production backend

**Testing Production:**
```bash
# Test backend health
curl https://api.todoapp.com/health

# Test chat endpoint (with auth token)
curl -X POST https://api.todoapp.com/api/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'
```

---

## Support

For issues or questions:
- **Check Logs:**
  - Backend: `backend/logs/app.log` or container logs
  - Frontend: Browser DevTools → Console
- **Review Documentation:**
  - API docs: http://localhost:8000/docs (or production URL)
  - Troubleshooting guide above
- **Database Inspection:**
  - Connect: `psql $DATABASE_URL`
  - Check tables: `\dt`
  - Query messages: `SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;`
- **Monitor Metrics:**
  - OpenAI usage: https://platform.openai.com/usage
  - Chat metrics: `/api/metrics` endpoint

**Common Quick Fixes:**
1. Clear browser cache and localStorage
2. Restart backend server
3. Verify all environment variables are set
4. Check OpenAI API key is valid and has credits
5. Ensure database migration is applied

Happy chatting! 🤖✅
