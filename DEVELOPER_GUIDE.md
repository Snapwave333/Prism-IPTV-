# Lumen AI Developer Guide
## Quick Reference for Implementation and Extension

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
```bash
# Python 3.10+
python --version

# Node.js 20+
node --version

# Ollama (for LLaMA3)
ollama --version
ollama pull llama3:8b
```

### Installation
```bash
# 1. Install Python dependencies
cd lumen-mascot
pip install -r requirements.txt

# 2. Create temp directories
mkdir temp_audio
mkdir logs

# 3. Start the enhanced server
python main_enhanced.py
```

### Test Commands
Open your browser console and try:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/test-client');

ws.onmessage = (event) => console.log(JSON.parse(event.data));

// Send a command
ws.send(JSON.stringify({
  type: 'chat',
  text: 'play Inception'
}));
```

---

## 📁 Project Structure

```
Prism IPTV/
├── lumen-mascot/                 # Python backend
│   ├── ai/
│   │   ├── media_nlu.py         # 🆕 NLU system (95%+ accuracy)
│   │   ├── ollama_client.py     # LLaMA3 integration
│   │   └── animation_mapper.py  # Emotion → Animation mapping
│   ├── integrations/
│   │   └── media_controller.py  # 🆕 Unified media control
│   ├── audio/
│   │   ├── tts_engine.py        # Text-to-speech
│   │   └── stt_engine.py        # Speech-to-text
│   ├── utils/
│   │   └── mcp_bridge.py        # 🆕 MCP server bridge
│   ├── main.py                  # Original server
│   └── main_enhanced.py         # 🆕 Enhanced server with media control
│
├── mcp-servers/                  # 🆕 MCP server implementations
│   ├── prism-control/           # Application control server
│   ├── media-knowledge/         # Content metadata server
│   └── user-memory/             # User preferences server
│
├── src/                          # React frontend
│   ├── hooks/
│   │   └── useMCPBridge.ts      # 🆕 MCP integration hook
│   └── components/
│       └── lumen/               # VRM mascot components
│
└── docs/                         # Documentation
    ├── LUMEN_ENHANCEMENT_PLAN.md
    ├── MCP_SERVER_ARCHITECTURE.md
    └── IMPLEMENTATION_SUMMARY.md
```

---

## 🔧 Common Development Tasks

### Adding a New Media Command

#### 1. Add Intent Pattern (media_nlu.py)
```python
def _build_intent_patterns(self) -> Dict:
    return {
        # ... existing patterns ...
        "new_intent_name": [
            r"pattern1 (.+)",
            r"pattern2 (.+)"
        ]
    }
```

#### 2. Add Entity Extractor (media_nlu.py)
```python
async def _extract_entities(self, text: str, intent: str, context: Optional[Dict] = None) -> Dict:
    if intent == "new_intent_name":
        entities.update(self._extract_new_intent_entities(text))
```

#### 3. Add Controller Method (media_controller.py)
```python
async def handle_new_intent(self, entities: Dict) -> Dict:
    """
    Handle new media command.
    """
    # Extract entities
    param = entities.get("param")

    # Execute via MCP
    if self.mcp_bridge:
        await self.mcp_bridge.call_tool(
            "prism-control",
            "tool_name",
            {"param": param}
        )

    return {"message": "Action completed"}
```

#### 4. Register Handler (main_enhanced.py)
```python
async def execute_intent(self, intent: str, entities: Dict) -> Dict:
    handlers = {
        # ... existing handlers ...
        "new_intent_name": self.handle_new_intent
    }
```

### Adding a New MCP Server

#### 1. Create Server Directory
```bash
mkdir mcp-servers/my-server
cd mcp-servers/my-server
npm init -y
npm install @modelcontextprotocol/sdk
```

#### 2. Create Server (index.ts)
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from "@modelcontextprotocol/sdk/types.js";

const server = new Server({
  name: "my-server",
  version: "1.0.0"
}, {
  capabilities: { tools: {} }
});

const tools: Tool[] = [
  {
    name: "my_tool",
    description: "Tool description",
    inputSchema: {
      type: "object",
      properties: {
        param: { type: "string" }
      },
      required: ["param"]
    }
  }
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "my_tool") {
    // Implementation
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ result: "success" })
      }]
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
```

#### 3. Register in MCP Bridge (mcp_bridge.py)
```python
self.servers = {
    # ... existing servers ...
    "my-server": {
        "command": "node",
        "args": ["mcp-servers/my-server/build/index.js"],
        "description": "My custom server"
    }
}
```

### Testing a Command End-to-End

#### Python Script Test
```python
import asyncio
from ai.media_nlu import MediaNLU
from integrations.media_controller import MediaController

async def test_command():
    nlu = MediaNLU()
    controller = MediaController()

    # Parse command
    result = await nlu.parse_command("play Inception")
    print(f"Intent: {result['intent']}")
    print(f"Entities: {result['entities']}")

    # Execute command
    if not result['is_ambiguous']:
        response = await controller.execute_intent(
            result['intent'],
            result['entities']
        )
        print(f"Response: {response}")

asyncio.run(test_command())
```

#### WebSocket Test
```python
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws/test-user"

    async with websockets.connect(uri) as websocket:
        # Send command
        await websocket.send(json.dumps({
            "type": "chat",
            "text": "play Inception"
        }))

        # Receive response
        response = await websocket.recv()
        print(json.loads(response))

asyncio.run(test_websocket())
```

---

## 🎨 Customization Guide

### Changing Lumen's Personality

Edit `ai/ollama_client.py`:
```python
self.system_prompt = """
You are Lumen, but with a different personality:
- More formal and technical
- Focus on data and statistics
- Professional tone throughout
"""
```

### Adjusting NLU Confidence Threshold

Edit `ai/media_nlu.py`:
```python
def _check_ambiguity(self, intent: str, entities: Dict, confidence: float):
    # Change from 0.7 to your desired threshold
    if confidence < 0.8:  # More strict
        return True, "..."
```

### Customizing Animation Responses

Edit `ai/animation_mapper.py`:
```python
EXPRESSIONS = [
    "neutral", "happy", "sad",
    "my_custom_emotion"  # Add your custom emotion
]

def analyze_sentiment(self, text: str) -> str:
    # Add custom logic
    if "custom_trigger" in text:
        return "my_custom_emotion"
```

### Adding Custom TTS Voice

Edit `audio/tts_engine.py`:
```python
def synthesize(self, text: str, output_path: str, speaker_id: Optional[str] = None):
    # Use your custom speaker ID
    custom_speaker = "your_speaker_id"

    self.tts.tts_to_file(
        text=text,
        speaker=speaker_id or custom_speaker,
        file_path=output_path
    )
```

---

## 🐛 Debugging

### Enable Debug Logging

```python
# In main_enhanced.py
logging.basicConfig(level=logging.DEBUG)

# For specific modules
logging.getLogger("MediaNLU").setLevel(logging.DEBUG)
logging.getLogger("MCPBridge").setLevel(logging.DEBUG)
```

### View MCP Server Communication

```python
# In mcp_bridge.py, _read_stderr method logs all server output
# Check console for lines like:
# [prism-control] Tool called: control_media_player
```

### Test Individual Components

```python
# Test NLU only
from ai.media_nlu import MediaNLU
nlu = MediaNLU()
result = await nlu.parse_command("your command here")
print(result)

# Test Media Controller only
from integrations.media_controller import MediaController
controller = MediaController()
result = await controller.play_content({"title": "Inception"})
print(result)

# Test MCP Bridge only
from utils.mcp_bridge import MCPBridge
bridge = MCPBridge()
await bridge.start_server("prism-control")
result = await bridge.call_tool("prism-control", "get_playback_state", {})
print(result)
```

### Common Errors

**Error**: `ModuleNotFoundError: No module named 'transformers'`
**Fix**: `pip install transformers torch`

**Error**: `WebSocket connection failed`
**Fix**: Ensure `main_enhanced.py` is running on port 8000

**Error**: `MCP server not responding`
**Fix**: Check that MCP servers are built (`npm run build` in each server directory)

**Error**: `Intent recognition confidence too low`
**Fix**: Add more specific patterns to `_build_intent_patterns()`

**Error**: `TTS synthesis failed`
**Fix**: Install Coqui TTS: `pip install TTS`, check CUDA availability

---

## 📊 Performance Optimization Tips

### 1. Reduce Latency
```python
# Use pattern matching first (fastest)
# Fallback to ML only for complex cases
if not pattern_matched:
    ml_result = await self.intent_classifier(text)
```

### 2. Parallel Processing
```python
# Process multiple tasks concurrently
await asyncio.gather(
    generate_tts(text),
    get_animation(emotion),
    log_interaction(user_id)
)
```

### 3. Cache Responses
```python
from functools import lru_cache

@lru_cache(maxsize=100)
def get_frequent_response(query: str):
    # Cached for repeated queries
    return process_query(query)
```

## 1. Project Philosophy: "Zero-Tolerance Hardening"

Prism IPTV v2.1 adheres to a strict reliability standard:
- **No Mock Data**: Every score, guide entry, and memory is real and verifiable.
- **Hardware Bound**: High-fidelity AI requires dedicated silicon. CPU fallbacks are treated as errors.
- **Deterministic UX**: Predictable state transitions for AI interactions.

## 2. Core Architecture

### AI Backend (`lumen-mascot/main_enhanced.py`)
The primary orchestrator for the AI Avatar pipeline. Built with FastAPI for high-concurrency WebSocket support.

- **STT Engine**: `audio/stt_engine.py` (Whisper v3 Large).
- **TTS Engine**: `audio/tts_engine.py` (Coqui XTTS v2).
- **Hardening Logic**: `ai/safety_guard.py` (Spoilers/Operational Safety).
- **Memory Store**: `ai/memory_manager.py` (Episodic Vector Memory).
- [ ] Errors handled gracefully

---

## 📝 Code Style Guide

### Python (PEP 8)
```python
# Good
async def parse_command(self, user_input: str, context: Optional[Dict] = None) -> Dict:
    """
    Parse natural language command.

    Args:
        user_input: User's text input
        context: Optional conversation context

    Returns:
        Parsed command with intent and entities
    """
    normalized = self._normalize_input(user_input)
    # ...

# Bad
async def parseCommand(userInput, context=None):
    normalized = self._normalizeInput(userInput)
    # ...
```

### TypeScript
```typescript
// Good
interface MediaCommand {
  type: 'chat' | 'voice' | 'media_command';
  text?: string;
  command?: CommandType;
}

async function handleCommand(cmd: MediaCommand): Promise<void> {
  // ...
}

// Bad
function handleCommand(cmd: any) {
  // ...
}
```

### Documentation
```python
# Good - Descriptive docstring
def extract_entities(self, text: str, intent: str) -> Dict:
    """
    Extract named entities from text based on intent.

    Supports extraction of:
    - Content titles and IDs
    - Volume levels and adjustments
    - Seek positions (absolute/relative)
    - Playback speeds

    Args:
        text: Input text to parse
        intent: Detected intent type

    Returns:
        Dictionary of extracted entities
    """

# Bad - No documentation
def extract_entities(self, text, intent):
    # ...
```

---

## 🔗 Useful Commands

### Development
```bash
# Start enhanced server with auto-reload
uvicorn lumen-mascot.main_enhanced:app --reload --port 8000

# Run with debug logging
LOGLEVEL=DEBUG python main_enhanced.py

# Test NLU accuracy
python -m pytest tests/test_nlu.py -v

# Build all MCP servers
for dir in mcp-servers/*/; do (cd "$dir" && npm run build); done
```

### Monitoring
```bash
# Watch logs
tail -f logs/lumen_info.log

# Monitor performance
python -m cProfile -o profile.stats main_enhanced.py

# Check memory usage
python -c "from utils.optimization import ModelManager; print(ModelManager.get_device_stats())"
```

### Deployment
```bash
# Production server
gunicorn -w 4 -k uvicorn.workers.UvicornWorker lumen-mascot.main_enhanced:app

# Docker build
docker build -t lumen-ai:latest -f Dockerfile.lumen .

# Docker run
docker run -p 8000:8000 -e TMDB_API_KEY=xxx lumen-ai:latest
```

---

## 📚 API Reference

### WebSocket Message Types

#### Client → Server
```typescript
// Chat message
{
  type: 'chat',
  text: string
}

// Voice message
{
  type: 'voice',
  audio_path: string
}

// Direct media command
{
  type: 'media_command',
  command: {
    action: 'play' | 'pause' | 'volume' | 'seek',
    value?: number
  }
}
```

#### Server → Client
```typescript
// Complete response
{
  type: 'lumen_response_complete',
  text: string,
  animation: AnimationPayload,
  audio_url?: string
}

// Audio segment (streaming)
{
  type: 'audio_segment',
  text: string,
  audio_url: string
}

// Clarification request
{
  type: 'clarification_needed',
  message: string,
  original_input: string
}

// Disambiguation
{
  type: 'disambiguation',
  message: string,
  options: ContentItem[]
}
```

### MCP Bridge API

```python
# Initialize
bridge = MCPBridge()

# Start server
await bridge.start_server("prism-control")

# Call tool
result = await bridge.call_tool(
    server_name="prism-control",
    tool_name="control_media_player",
    arguments={"command": "pause"}
)

# List available tools
tools = await bridge.list_tools("prism-control")

# Shutdown
await bridge.shutdown_all()
```

---

## 🎓 Learning Resources

### Core Concepts
1. **Natural Language Understanding** - See `media_nlu.py` for pattern matching + ML approach
2. **Model Context Protocol** - Read `MCP_SERVER_ARCHITECTURE.md`
3. **WebSocket Communication** - Check `main_enhanced.py` for async patterns
4. **Emotion Detection** - Review `animation_mapper.py` for sentiment analysis

### External Resources
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Transformers Library](https://huggingface.co/docs/transformers)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md)

---

## 🆘 Getting Help

### Debugging Steps
1. Check logs in `logs/lumen_error.log`
2. Enable debug logging
3. Test individual components
4. Check MCP server status
5. Verify API keys and configuration

### Common Questions

**Q: How do I add support for a new language?**
A: Update `media_vocabulary` in `media_nlu.py` with language-specific patterns

**Q: Can I use a different LLM?**
A: Yes, modify `ollama_client.py` to use your preferred model

**Q: How do I improve intent recognition accuracy?**
A: Add more patterns to `_build_intent_patterns()` or use a fine-tuned NLU model

**Q: Can I run without GPU?**
A: Yes, models will automatically fall back to CPU (slower)

---

*Last Updated: 2026-01-07*
*Version: 1.0*

---

**Next Steps:**
1. Read [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
2. Review [MCP_SERVER_ARCHITECTURE.md](MCP_SERVER_ARCHITECTURE.md)
3. Check [LUMEN_ENHANCEMENT_PLAN.md](LUMEN_ENHANCEMENT_PLAN.md) for detailed specifications
4. Start implementing features from the roadmap!
