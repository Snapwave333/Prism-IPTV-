# Prism IPTV MCP Server Suite

A comprehensive suite of **Model Context Protocol (MCP)** servers that enable the Lumen AI agent (LLaMA 3) to control, query, and personalize the Prism IPTV application.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      Lumen AI Agent                          │
│                    (LLaMA 3 via Ollama)                      │
└───────────────────────┬──────────────────────────────────────┘
                        │ MCP Protocol (stdio)
        ┌───────────────┼──────────────────┬─────────────┐
        │               │                  │             │
┌───────▼──────┐  ┌─────▼──────┐  ┌───────▼────┐  ┌────▼──────┐
│Prism Control │  │   Media    │  │    User    │  │ External  │
│   Server     │  │ Knowledge  │  │   Memory   │  │  Servers  │
│              │  │   Server   │  │   Server   │  │           │
│ (WebSocket)  │  │            │  │            │  │  - ESPN   │
│              │  │  - EPG     │  │  - SQLite  │  │  - Brave  │
│  - UI Nav    │  │  - Radio   │  │  - History │  │  Search   │
│  - Playback  │  │  - TMDB    │  │  - Prefs   │  │           │
│  - Theme     │  │            │  │  - Context │  │           │
│  - Emotions  │  │            │  │            │  │           │
└──────┬───────┘  └────────────┘  └────────────┘  └───────────┘
       │
       │ WebSocket (ws://localhost:3001)
       │
┌──────▼──────────────────────────────────────────────┐
│           Prism IPTV React Application              │
│                 (localhost:3000)                     │
└─────────────────────────────────────────────────────┘
```

## Server Specifications

### 1. Prism Control Server (Custom)
**Purpose**: Lumen's "hands" to control the Prism IPTV application

**Tools**:
- `control_media_player` - Play, pause, seek, volume, channel navigation
- `navigate_ui` - Switch between TV, movies, radio, podcasts, settings
- `set_theme_mode` - Change visual theme (glass_neon, cinema_dark, light, high_contrast)
- `trigger_mascot_emotion` - Set Lumen's VRM avatar emotion (happy, thinking, alert, etc.)
- `get_player_state` - Query current playback state
- `query_available_channels` - Search available channels

**Technology**: TypeScript, WebSocket bridge to React frontend

**Configuration**:
```json
{
  "env": {
    "PRISM_WEBSOCKET_URL": "ws://localhost:3001"
  }
}
```

---

### 2. Media Knowledge Server (Composite)
**Purpose**: Lumen's "librarian" for media metadata and discovery

**Tools**:
- `get_current_broadcasts` - Current EPG data (what's on TV now)
- `find_radio_station` - Search 70,000+ radio stations (Radio Browser API)
- `search_movies` - Movie search via TMDB
- `get_channel_schedule` - Upcoming program schedule for channels

**Technology**: TypeScript, fast-xml-parser, Radio Browser API, TMDB API

**Configuration**:
```json
{
  "env": {
    "TMDB_API_KEY": "your_api_key_here"
  }
}
```

**API Keys Required**:
- TMDB API key (free): https://www.themoviedb.org/settings/api

---

### 3. User Memory Server (Custom)
**Purpose**: Persistent memory for personalized interactions

**Tools**:
- `get_user_history` - Last N watched/listened items
- `save_user_preference` - Store user preferences (genres, favorites, settings)
- `get_user_preferences` - Retrieve stored preferences
- `get_session_context` - Get current session state (5-minute timeout)
- `update_session_context` - Update conversation context
- `add_to_history` - Add new items to viewing history

**Technology**: TypeScript, better-sqlite3

**Database Location**: `~/.prism-iptv/user-memory.db`

**Schema**:
```sql
-- History table
CREATE TABLE history (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL,  -- tv, radio, podcast, movie
  title TEXT NOT NULL,
  channel TEXT,
  url TEXT,
  timestamp TEXT NOT NULL,
  duration_seconds INTEGER
);

-- Preferences table
CREATE TABLE preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  category TEXT,  -- genre, favorite, setting, other
  updated_at TEXT
);

-- Session context table
CREATE TABLE session_context (
  session_id TEXT PRIMARY KEY,
  start_time TEXT NOT NULL,
  last_activity TEXT NOT NULL,
  context_data TEXT  -- JSON blob
);
```

---

### 4. Live Sports Server (External)
**Purpose**: Real-time sports scores and standings

**Package**: `@modelcontextprotocol/server-espn`

**Tools**:
- `get_live_scores` - Live game scores
- `get_standings` - League/division standings
- `get_team_schedule` - Team schedules

**Installation**: Auto-installed via npx

---

### 5. Web Search Server (External)
**Purpose**: General web search for up-to-date information

**Package**: `@modelcontextprotocol/server-brave-search`

**Tools**:
- `brave_web_search` - Web search queries

**Configuration**:
```json
{
  "env": {
    "BRAVE_API_KEY": "your_brave_api_key"
  }
}
```

**API Key**: Get free API key at https://brave.com/search/api/

---

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Prism IPTV application running
- Lumen AI backend running

### Setup

1. **Install dependencies**:
```bash
cd mcp-servers
npm install
```

2. **Build TypeScript**:
```bash
npm run build
```

3. **Configure environment variables**:
Create `.env` file:
```env
TMDB_API_KEY=your_tmdb_api_key_here
BRAVE_API_KEY=your_brave_api_key_here
PRISM_WEBSOCKET_URL=ws://localhost:3001
```

4. **Initialize database**:
```bash
# Database auto-initializes on first run
node dist/user-memory-server/index.js
# Press Ctrl+C after "running on stdio" message
```

---

## Running the Servers

### Option 1: Run All Servers (Recommended)
```bash
npm run start:all
```

### Option 2: Run Individual Servers
```bash
# Prism Control Server
npm run start:control

# Media Knowledge Server
npm run start:media

# User Memory Server
npm run start:memory
```

### Option 3: Integrate with Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "prism-control": {
      "command": "node",
      "args": ["C:/path/to/Prism IPTV/mcp-servers/dist/prism-control-server/index.js"],
      "env": {
        "PRISM_WEBSOCKET_URL": "ws://localhost:3001"
      }
    },
    "media-knowledge": {
      "command": "node",
      "args": ["C:/path/to/Prism IPTV/mcp-servers/dist/media-knowledge-server/index.js"],
      "env": {
        "TMDB_API_KEY": "your_key"
      }
    },
    "user-memory": {
      "command": "node",
      "args": ["C:/path/to/Prism IPTV/mcp-servers/dist/user-memory-server/index.js"]
    },
    "espn-sports": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-espn"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your_key"
      }
    }
  }
}
```

---

## Integrating with Lumen AI

### Python Integration (via subprocess)

```python
# lumen-mascot/ai/mcp_client.py
import asyncio
import json
import subprocess
from typing import Dict, Any, List

class MCPClient:
    """Client to interact with MCP servers via stdio"""

    def __init__(self, server_command: List[str]):
        self.process = None
        self.server_command = server_command

    async def start(self):
        """Start MCP server process"""
        self.process = await asyncio.create_subprocess_exec(
            *self.server_command,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Any:
        """Call an MCP tool and return the result"""
        if not self.process:
            await self.start()

        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments
            }
        }

        # Send request
        request_json = json.dumps(request) + "\n"
        self.process.stdin.write(request_json.encode())
        await self.process.stdin.drain()

        # Read response
        response_line = await self.process.stdout.readline()
        response = json.loads(response_line.decode())

        if "error" in response:
            raise Exception(f"MCP Error: {response['error']}")

        return response["result"]["content"][0]["text"]

    async def list_tools(self) -> List[Dict]:
        """List available tools"""
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/list",
            "params": {}
        }

        request_json = json.dumps(request) + "\n"
        self.process.stdin.write(request_json.encode())
        await self.process.stdin.drain()

        response_line = await self.process.stdout.readline()
        response = json.loads(response_line.decode())

        return response["result"]["tools"]

    async def close(self):
        """Close MCP server process"""
        if self.process:
            self.process.terminate()
            await self.process.wait()

# Usage example
async def main():
    # Control Prism IPTV
    control_client = MCPClient(["node", "dist/prism-control-server/index.js"])

    # Play media
    result = await control_client.call_tool("control_media_player", {
        "command": "play"
    })
    print(result)

    # Navigate to TV section
    result = await control_client.call_tool("navigate_ui", {
        "route": "/tv",
        "viewMode": "grid"
    })
    print(result)

    await control_client.close()

if __name__ == "__main__":
    asyncio.run(main())
```

### Enhanced Lumen AI with MCP Tools

```python
# lumen-mascot/ai/lumen_mcp_enhanced.py
import asyncio
from typing import Dict, Any
from ai.ollama_client import OllamaClient
from ai.mcp_client import MCPClient

class LumenMCPEnhanced:
    """Lumen AI with MCP tool integration"""

    def __init__(self):
        self.llm = OllamaClient(model="llama3:8b")
        self.mcp_servers = {
            "control": MCPClient(["node", "dist/prism-control-server/index.js"]),
            "media": MCPClient(["node", "dist/media-knowledge-server/index.js"]),
            "memory": MCPClient(["node", "dist/user-memory-server/index.js"])
        }
        self.tools_cache = {}

    async def initialize(self):
        """Start all MCP servers and cache available tools"""
        for name, client in self.mcp_servers.items():
            await client.start()
            tools = await client.list_tools()
            self.tools_cache[name] = tools
            print(f"Loaded {len(tools)} tools from {name} server")

    async def process_user_query(self, query: str) -> str:
        """
        Process user query with MCP tool awareness

        Flow:
        1. Check user memory for context
        2. Determine if tools are needed
        3. Call appropriate MCP tools
        4. Generate response with LLM
        """

        # 1. Get session context
        session_id = "default-session"
        context = await self.mcp_servers["memory"].call_tool(
            "get_session_context",
            {"session_id": session_id}
        )

        # 2. Check if query requires tool use
        tool_decision = await self.decide_tool_usage(query)

        # 3. Execute tools if needed
        tool_results = []
        if tool_decision["use_tools"]:
            for tool_call in tool_decision["tools"]:
                server = tool_call["server"]
                tool_name = tool_call["tool"]
                args = tool_call["arguments"]

                result = await self.mcp_servers[server].call_tool(tool_name, args)
                tool_results.append({
                    "tool": tool_name,
                    "result": result
                })

        # 4. Generate response with context
        enhanced_query = self.build_enhanced_query(query, context, tool_results)
        response = await self.llm.generate_response(enhanced_query)

        # 5. Update session context
        await self.mcp_servers["memory"].call_tool(
            "update_session_context",
            {
                "session_id": session_id,
                "context_data": {
                    "last_query": query,
                    "last_response": response,
                    "tools_used": [t["tool"] for t in tool_results]
                }
            }
        )

        return response

    async def decide_tool_usage(self, query: str) -> Dict[str, Any]:
        """
        Use LLM to decide which MCP tools to call

        TODO: Implement tool use decision logic with LLM
        For now, simple keyword matching
        """

        query_lower = query.lower()
        tools_to_call = []

        # Media control keywords
        if any(kw in query_lower for kw in ["play", "pause", "volume", "channel"]):
            if "channel" in query_lower and any(char.isdigit() for char in query):
                # Extract channel number
                import re
                match = re.search(r'\d+', query)
                if match:
                    tools_to_call.append({
                        "server": "control",
                        "tool": "control_media_player",
                        "arguments": {
                            "command": "go_to_channel",
                            "value": int(match.group())
                        }
                    })

        # Navigation keywords
        if any(kw in query_lower for kw in ["show me", "go to", "open"]):
            if "tv" in query_lower:
                tools_to_call.append({
                    "server": "control",
                    "tool": "navigate_ui",
                    "arguments": {"route": "/tv", "viewMode": "grid"}
                })

        # Media search keywords
        if any(kw in query_lower for kw in ["what's on", "currently playing", "on tv"]):
            tools_to_call.append({
                "server": "media",
                "tool": "get_current_broadcasts",
                "arguments": {"limit": 10}
            })

        return {
            "use_tools": len(tools_to_call) > 0,
            "tools": tools_to_call
        }

    def build_enhanced_query(self, original_query: str, context: Any, tool_results: list) -> str:
        """Build enhanced query with context and tool results"""

        enhanced = original_query

        if tool_results:
            enhanced += "\n\n[Tool Results]\n"
            for result in tool_results:
                enhanced += f"{result['tool']}: {result['result']}\n"

        return enhanced

    async def cleanup(self):
        """Close all MCP server connections"""
        for client in self.mcp_servers.values():
            await client.close()

# Usage
async def main():
    lumen = LumenMCPEnhanced()
    await lumen.initialize()

    # User query
    response = await lumen.process_user_query("Play channel 5")
    print(response)

    await lumen.cleanup()

if __name__ == "__main__":
    asyncio.run(main())
```

---

## Usage Examples

### Example 1: Media Control
```python
# Control playback
await control_client.call_tool("control_media_player", {
    "command": "play"
})

# Set volume to 75%
await control_client.call_tool("control_media_player", {
    "command": "set_volume",
    "value": 75
})

# Skip forward 30 seconds
await control_client.call_tool("control_media_player", {
    "command": "seek_relative",
    "value": 30
})

# Go to channel 102
await control_client.call_tool("control_media_player", {
    "command": "go_to_channel",
    "value": 102
})
```

### Example 2: Media Discovery
```python
# Get what's on TV now
broadcasts = await media_client.call_tool("get_current_broadcasts", {
    "genre": "news",
    "limit": 5
})

# Find jazz radio stations in the US
stations = await media_client.call_tool("find_radio_station", {
    "country": "US",
    "tag": "jazz",
    "limit": 10
})

# Search for movies
movies = await media_client.call_tool("search_movies", {
    "query": "Inception",
    "year": 2010
})
```

### Example 3: User Personalization
```python
# Get viewing history
history = await memory_client.call_tool("get_user_history", {
    "limit": 10,
    "type": "tv"
})

# Save preference
await memory_client.call_tool("save_user_preference", {
    "key": "favorite_genre",
    "value": "sci-fi",
    "category": "genre"
})

# Get session context
session = await memory_client.call_tool("get_session_context", {
    "session_id": "user-123"
})
```

---

## Frontend Integration

Update the Prism IPTV React app to handle MCP control messages:

```typescript
// src/services/mcpBridge.ts
import { usePlayerStore } from '../stores/usePlayerStore';
import { useNavigate } from 'react-router-dom';

interface MCPMessage {
  type: 'media_control' | 'navigate_ui' | 'set_theme' | 'mascot_emotion';
  [key: string]: any;
}

export class MCPBridge {
  private ws: WebSocket | null = null;

  connect() {
    this.ws = new WebSocket('ws://localhost:3001');

    this.ws.onmessage = (event) => {
      const message: MCPMessage = JSON.parse(event.data);
      this.handleMessage(message);
    };
  }

  private handleMessage(message: MCPMessage) {
    const playerStore = usePlayerStore.getState();

    switch (message.type) {
      case 'media_control':
        this.handleMediaControl(message.command, message.value);
        break;

      case 'navigate_ui':
        // Use React Router
        window.location.hash = message.route;
        break;

      case 'set_theme':
        document.documentElement.setAttribute('data-theme', message.mode);
        break;

      case 'mascot_emotion':
        // Trigger Lumen emotion via existing hook
        // useLumen().setEmotion(message.emotion, message.intensity);
        break;
    }
  }

  private handleMediaControl(command: string, value?: number) {
    const store = usePlayerStore.getState();

    switch (command) {
      case 'play':
        store.play();
        break;
      case 'pause':
        store.pause();
        break;
      case 'seek_relative':
        store.seekTo(store.currentTime + (value || 0));
        break;
      case 'set_volume':
        store.setVolume(value || 50);
        break;
      // ... handle other commands
    }
  }
}

// Initialize on app startup
export const mcpBridge = new MCPBridge();
```

---

## Testing

### Test Individual Tools

```bash
# Test control server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"control_media_player","arguments":{"command":"play"}}}' | node dist/prism-control-server/index.js

# Test media server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_current_broadcasts","arguments":{"limit":5}}}' | node dist/media-knowledge-server/index.js

# Test memory server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_user_history","arguments":{"limit":10}}}' | node dist/user-memory-server/index.js
```

### Integration Test

```bash
npm test
```

---

## Troubleshooting

### Server won't start
- Check Node.js version: `node --version` (requires 18+)
- Rebuild TypeScript: `npm run build`
- Check logs in terminal

### WebSocket connection failed
- Ensure Prism IPTV app is running on port 3000
- Ensure Node server is running on port 3001
- Check `PRISM_WEBSOCKET_URL` environment variable

### Database errors
- Check database location: `~/.prism-iptv/user-memory.db`
- Ensure directory has write permissions
- Delete database to reset: `rm ~/.prism-iptv/user-memory.db`

### TMDB/Brave API errors
- Verify API keys are set in environment
- Check API rate limits
- Test API keys: https://www.themoviedb.org/settings/api

---

## Performance Considerations

### Memory Usage
- Each server: ~50-100 MB RAM
- SQLite database: < 10 MB typically
- Total suite: ~300 MB RAM

### Latency
- Local MCP calls: < 10ms
- WebSocket commands: < 50ms
- External API calls: 200-1000ms (cached where possible)

### Optimization Tips
1. Enable EPG caching (1-hour default)
2. Use session context to avoid redundant queries
3. Batch tool calls when possible
4. Implement result caching in Lumen AI layer

---

## Security Notes

- MCP servers run locally on stdio (no network exposure)
- WebSocket bridge uses localhost only (no remote access)
- API keys stored in environment variables (not in code)
- User data stored locally in SQLite
- No telemetry or external data transmission

---

## License

MIT License - see project root LICENSE file

---

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the IMPLEMENTATION_GUIDE.md in project root
- Submit issues to project repository

---

**Built with the Model Context Protocol SDK**
https://modelcontextprotocol.io
