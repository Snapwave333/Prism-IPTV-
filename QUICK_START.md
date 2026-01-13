# Prism IPTV Quick Start Guide (Hardened v2.1)

Get Prism IPTV running with full AI orchestration.

---

## Prerequisites ✅

- **GPU**: NVIDIA GPU with CUDA 11.8+ (**MANDATORY**)
- **VRAM**: 8GB Minimum (12GB+ Recommended)
- **RAM**: 8GB Minimum (16GB+ Recommended)
- **Software**: Node.js 18+, Python 3.10+, Ollama installed.
- **Disk**: 15GB+ free space for models.

---

## Installation (3 Commands)

```bash
# 1. Run automated deployment
chmod +x deploy.sh
./deploy.sh

# Answer prompts:
# - Continue? y
# - Deploy with Docker? y (or n for manual)
# - Run tests? n (optional)
# - Start services? y

# 2. Configure API keys (optional, for full features)
nano lumen-mascot/.env
# Add: TMDB_API_KEY=...
# Add: BRAVE_API_KEY=...

# 3. Pull AI Models
ollama pull llama3:8b
```

Done! Access at [http://localhost:3000](http://localhost:3000)

---

## Manual Installation (Step-by-Step)

### 1. Install Dependencies

```bash
# Python dependencies
cd lumen-mascot
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Node dependencies (frontend)
npm install

# Node dependencies (server)
cd server && npm install && cd ..
```

### 2. Pull AI Models

```bash
# LLaMA 3 8B (Recommended)
ollama pull llama3:8b

# Whisper v3 auto-downloads on first use via faster-whisper
```

### 3. Configure Environment

```bash
# Copy templates
cp lumen-mascot/.env.example lumen-mascot/.env

# Edit with your configuration
nano lumen-mascot/.env
```

### 4. Start Services

**Terminal 1 - AI Backend (Enhanced):**
```bash
cd lumen-mascot
source venv/bin/activate
python3 main_enhanced.py
```

**Terminal 2 - Node Server:**
```bash
cd server
npm run dev
```

**Terminal 3 - Frontend:**
```bash
npm run dev
```

**Terminal 4 - MCP Servers (Optional):**

```bash
cd mcp-servers
npm run start:all
```

### 5. Access Application

- Frontend: http://localhost:3000
- API: http://localhost:3001/api/status
- AI Backend: http://localhost:8000/health

---

## Docker Deployment (Recommended)

```bash
# Build and start all services
cd docker
docker-compose build
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access at http://localhost:3000

---

## Verify Installation

### Test AI Backend
```bash
curl http://localhost:8000/health
# Should return: {"status": "Lumen is fully operational"}
```

### Test Node Server
```bash
curl http://localhost:3001/api/status
# Should return server status and IP
```

### Test Frontend
Open http://localhost:3000 in browser

### Test Lumen Chat
1. Click Lumen mascot in UI
2. Type: "Hello Lumen!"
3. Should get AI response

### Test Media Control
1. Say to Lumen: "Play channel 5"
2. Player should switch channels

### Test MCP Servers (if running)
```bash
cd lumen-mascot
python3 ai/mcp_client.py
# Should show "MCP servers initialized successfully"
```

---

## Configuration

### Environment Variables

**lumen-mascot/.env:**
```env
# AI Models
WHISPER_MODEL=large-v3
LLAMA_MODEL=llama3.2:3b-instruct-q4_K_M
TTS_MODEL=tts_models/multilingual/multi-dataset/xtts_v2

# Performance
GPU_ENABLED=true
BATCH_SIZE=8
MAX_WORKERS=4

# Optional: API Keys
TMDB_API_KEY=your_tmdb_key
BRAVE_API_KEY=your_brave_key
```

**mcp-servers/.env:**
```env
TMDB_API_KEY=your_tmdb_key
BRAVE_API_KEY=your_brave_key
PRISM_WEBSOCKET_URL=ws://localhost:3001
```

### Get API Keys (Free)

- **TMDB:** https://www.themoviedb.org/settings/api
- **Brave Search:** https://brave.com/search/api/

---

## Feature Test Checklist

- [ ] AI Backend responds (http://localhost:8000/health)
- [ ] Frontend loads (http://localhost:3000)
- [ ] Video playback works
- [ ] Lumen mascot appears
- [ ] Chat with Lumen works
- [ ] Voice commands work ("Play", "Pause")
- [ ] Sentiment detected (try "I'm so happy!")
- [ ] Channel switching works
- [ ] EPG data loads
- [ ] Settings accessible

---

## Performance Tuning

### For Low-End Systems

```bash
# Use smaller models
ollama pull llama3.2:1b  # Smaller LLaMA

# In lumen-mascot/.env:
WHISPER_MODEL=medium  # Instead of large-v3
GPU_ENABLED=false
BATCH_SIZE=4
```

### For High-End Systems

```bash
# Use larger models
ollama pull llama3.2:latest  # 11B model

# In lumen-mascot/.env:
WHISPER_MODEL=large-v3
GPU_ENABLED=true
BATCH_SIZE=16
```

---

## Troubleshooting

### Services Won't Start

**Check ports:**
```bash
# Linux/Mac
lsof -i :3000
lsof -i :3001
lsof -i :8000

# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :8000
```

**Kill processes if needed:**
```bash
# Linux/Mac
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

### Ollama Not Running

```bash
# Start Ollama
ollama serve

# Verify
ollama list
```

### GPU Not Detected

```bash
# Check NVIDIA GPU
nvidia-smi

# Install CUDA if needed
# https://developer.nvidia.com/cuda-downloads

# Verify PyTorch GPU
python3 -c "import torch; print(torch.cuda.is_available())"
```

### Import Errors

```bash
# Reinstall Python packages
cd lumen-mascot
source venv/bin/activate
pip install -r requirements.txt --force-reinstall
```

### Port Already in Use

```bash
# Change ports in .env or config files
# Frontend: VITE_PORT=3001
# Server: PORT=3002
# AI: PORT=8001
```

---

## Command Reference

### Start/Stop Services

```bash
# Docker
docker-compose up -d      # Start
docker-compose down       # Stop
docker-compose restart    # Restart
docker-compose logs -f    # View logs

# Manual
./deploy.sh               # Interactive deployment
pkill -f "python3 main.py"  # Stop Python
pkill -f "npm run dev"      # Stop Node
```

### Update Code

```bash
# Pull latest changes (if using git)
git pull

# Rebuild
npm install
npm run build
cd lumen-mascot && pip install -r requirements.txt && cd ..
cd mcp-servers && npm run build && cd ..

# Restart services
docker-compose restart  # Docker
# Or restart manually
```

### View Logs

```bash
# Docker
docker-compose logs ai-backend
docker-compose logs node-server
docker-compose logs frontend

# Manual
# Check terminal outputs
```

---

## Next Steps

1. **Explore Features** - Try voice commands, companion mode
2. **Configure Preferences** - Set favorite channels, themes
3. **Add Content** - Import your M3U playlists
4. **Customize Lumen** - Change voice, personality
5. **Read Docs** - See IMPLEMENTATION_GUIDE.md for advanced features

---

## Resources

- **IMPLEMENTATION_GUIDE.md** - Detailed feature documentation
- **UPGRADE_GUIDE.md** - Advanced configuration
- **MCP_INTEGRATION_GUIDE.md** - MCP server details
- **FINAL_IMPLEMENTATION_SUMMARY.md** - Complete summary

---

## Support

For issues:
1. Check UPGRADE_GUIDE.md troubleshooting section
2. Verify all prerequisites installed
3. Check logs for error messages
4. Ensure API keys configured (if using those features)

---

**Last Updated:** January 7, 2026
**Version:** 2.0.0

**🚀 Enjoy Prism IPTV! 🚀**
