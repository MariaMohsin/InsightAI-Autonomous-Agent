# Ollama Setup Guide - Free Local AI Chat

## ✅ What Changed

Your app now uses **Ollama** (free, local LLM) instead of OpenAI:
- ❌ No API key required
- ✅ Runs 100% locally on your machine
- ✅ Free forever
- ✅ Privacy-focused (no data sent to cloud)

## 📥 Step 1: Install Ollama

### Windows:
1. Download from: https://ollama.com/download
2. Run the installer
3. Ollama will run in the background

### macOS:
```bash
brew install ollama
```

### Linux:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

## 🚀 Step 2: Download AI Model

After installing Ollama, download a model (one-time):

```bash
# Recommended: llama2 (7GB)
ollama pull llama2

# OR smaller/faster options:
ollama pull mistral      # 4GB, faster
ollama pull phi          # 1.6GB, very fast but less capable
```

**First time will take a few minutes to download.**

## ✅ Step 3: Verify Ollama is Running

```bash
ollama --version
# Should show: ollama version 0.x.x

# Test it:
ollama run llama2
# Type: "Hello, how are you?"
# Press Ctrl+D to exit
```

## 🎯 Step 4: Start Your App

```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt  # Installs ollama package
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🧪 Step 5: Test AI Chat

1. Open http://localhost:3000
2. Login
3. Click **"AI Chat"** in sidebar
4. Try: "Add a task to buy groceries"

The AI will:
- Understand your natural language
- Call the backend API
- Save to database
- Respond with confirmation

## 🔧 Configuration

**Backend `.env` file**:
```bash
# Choose which model to use
OLLAMA_MODEL=llama2      # Default

# Or use other models:
# OLLAMA_MODEL=mistral
# OLLAMA_MODEL=phi
# OLLAMA_MODEL=codellama
```

## 📊 Model Comparison

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **llama2** | 7GB | Medium | High | Recommended |
| **mistral** | 4GB | Fast | High | Good balance |
| **phi** | 1.6GB | Very Fast | Medium | Quick responses |
| **codellama** | 7GB | Medium | High (code) | Technical tasks |

## 🐛 Troubleshooting

### "Ollama not found"
- Make sure Ollama is installed and running
- On Windows, check system tray for Ollama icon
- Try: `ollama serve` to start manually

### "Model not found"
- Run: `ollama pull llama2` first
- Check available models: `ollama list`

### "Connection refused"
- Ollama runs on `http://localhost:11434` by default
- Check if it's running: `curl http://localhost:11434`

### "Slow responses"
- First response is slow (model loading)
- Subsequent responses are faster
- Use smaller model like `phi` for speed

## 🎉 Benefits of Ollama

✅ **Free**: No API costs
✅ **Private**: Data stays on your machine
✅ **Offline**: Works without internet
✅ **Fast**: After initial load
✅ **No limits**: Use as much as you want

## 🔄 Switching Models

```bash
# List installed models
ollama list

# Pull a new model
ollama pull mistral

# Update .env
OLLAMA_MODEL=mistral

# Restart backend
```

## 💡 Tips

1. **First request is slow** - Ollama loads the model into memory (10-30 seconds)
2. **Keep Ollama running** - Subsequent requests are instant
3. **Use smaller models** for faster responses
4. **Upgrade to larger models** for better quality when needed

Enjoy your free, local AI-powered todo chatbot! 🎉
