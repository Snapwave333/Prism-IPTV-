# MCP Integration Guide for Lumen AI

Complete guide for integrating the Model Context Protocol (MCP) server suite with Lumen, enabling the AI agent to control Prism IPTV and access rich media knowledge.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Start](#quick-start)
3. [Server Specifications](#server-specifications)
4. [Integration with Lumen AI](#integration-with-lumen-ai)
5. [Tool Usage Examples](#tool-usage-examples)
6. [Advanced Patterns](#advanced-patterns)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Component Diagram

```
┌────────────────────────────────────────────────────────────┐
│                    User Input                              │
│          "Play channel 5" / "What's on TV?"                │
└──────────────────────┬─────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────┐
│              Lumen AI Agent (Python)                       │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │  LLaMA 3 Model (via Ollama)                      │    │
│  │  - Conversation understanding                     │    │
│  │  - Intent classification                          │    │
│  │  - Tool selection logic                           │    │
│  └──────────────────────────────────────────────────┘    │
│                       │                                    │
│  ┌──────────────────────────────────────────────────┐    │
│  │  MCP Client Manager (mcp_client.py)              │    │
│  │  - Server lifecycle management                    │    │
│  │  - Tool call routing                              │    │
│  │  - Result aggregation                             │    │
│  └──────────────────────────────────────────────────┘    │
└────────────────────┬──────┬──────┬─────────────────────────┘
                     │      │      │
        ┌────────────┘      │      └────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼───────┐
│ Prism Control  │  │ Media Knowledge│  │ User Memory  │
│    Server      │  │     Server     │  │    Server    │
│  (TypeScript)  │  │  (TypeScript)  │  │(TypeScript)  │
└───────┬────────┘  └───────┬────────┘  └──────┬───────┘
        │                   │                   │
        │ WebSocket         │ HTTP APIs         │ SQLite
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼───────┐
│ Prism IPTV UI  │  │ EPG, Radio,    │  │ User Data    │
│   (React)      │  │ TMDB APIs      │  │  Database    │
└────────────────┘  └────────────────┘  └──────────────┘
```

### Data Flow Example: "Play channel 5"

```
1. User: "Play channel 5"
   │
   ▼
2. Lumen AI receives text via WebSocket
   │
   ▼
3. LLaMA 3 understands intent: media control
   │
   ▼
4. MCP Client calls: prism-control.control_media_player({
     command: "go_to_channel",
     value: 5
   })
   │
   ▼
5. Control Server sends WebSocket message to React frontend
   │
   ▼
6. Frontend updates player state
   │
   ▼
7. Lumen responds: "Switching to channel 5!"
```

---

## Quick Start

### 1. Build MCP Servers

```bash
cd mcp-servers
npm install
npm run build
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Test Individual Servers

```bash
# Test control server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | \
  node dist/prism-control-server/index.js

# Test media server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | \
  node dist/media-knowledge-server/index.js

# Test memory server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | \
  node dist/user-memory-server/index.js
```

### 4. Test Python Integration

```bash
cd ../lumen-mascot
python ai/mcp_client.py
```

Expected output:
```
=== MCP Client Test ===

Starting Prism Control Server...
Starting Media Knowledge Server...
Starting User Memory Server...

=== Available Tools ===

prism-control:
  - control_media_player: Controls the Prism IPTV media player...
  - navigate_ui: Navigate to different sections...
  ...

=== Testing Control Server ===
Play command result: Media control executed: play

Done!
```

---

## Server Specifications

### Server 1: Prism Control

**File**: `mcp-servers/src/prism-control-server/index.ts`

**Purpose**: Direct control over Prism IPTV UI and playback

**Tools**:

| Tool | Description | Parameters | Example |
|------|-------------|------------|---------|
| `control_media_player` | Control playback | `command`, `value` | `{"command": "play"}` |
| `navigate_ui` | Navigate routes | `route`, `viewMode` | `{"route": "/tv", "viewMode": "grid"}` |
| `set_theme_mode` | Change theme | `mode` | `{"mode": "cinema_dark"}` |
| `trigger_mascot_emotion` | Set Lumen emotion | `emotion`, `intensity` | `{"emotion": "happy", "intensity": 0.9}` |
| `get_player_state` | Get player status | - | `{}` |
| `query_available_channels` | Search channels | `filter`, `category`, `limit` | `{"filter": "news", "limit": 10}` |

**WebSocket Protocol**:
```typescript
// Messages sent to React frontend
{
  type: 'media_control',
  command: 'play' | 'pause' | 'seek_relative' | ...,
  value?: number
}

{
  type: 'navigate_ui',
  route: '/tv' | '/movies' | '/radio' | ...,
  viewMode?: 'grid' | 'list' | 'compact'
}
```

---

### Server 2: Media Knowledge

**File**: `mcp-servers/src/media-knowledge-server/index.ts`

**Purpose**: Media metadata, EPG, radio stations, movie search

**Tools**:

| Tool | Description | Data Source | Example |
|------|-------------|-------------|---------|
| `get_current_broadcasts` | Current TV programs | Pluto TV EPG | `{"genre": "sports", "limit": 5}` |
| `find_radio_station` | Search radio stations | Radio Browser | `{"country": "US", "tag": "jazz"}` |
| `search_movies` | Search movies | TMDB API | `{"query": "Inception", "year": 2010}` |
| `get_channel_schedule` | Channel schedule | EPG data | `{"channel": "CNN", "hours": 6}` |

**Data Sources**:
- **EPG**: Pluto TV XMLTV feed (cached 1 hour)
- **Radio**: Radio Browser API (70,000+ stations)
- **Movies**: TMDB API (requires free API key)

---

### Server 3: User Memory

**File**: `mcp-servers/src/user-memory-server/index.ts`

**Purpose**: Persistent user data, preferences, session context

**Tools**:

| Tool | Description | Storage | Example |
|------|-------------|---------|---------|
| `get_user_history` | View history | SQLite | `{"limit": 10, "type": "tv"}` |
| `save_user_preference` | Save preference | SQLite | `{"key": "fav_genre", "value": "action"}` |
| `get_user_preferences` | Get preferences | SQLite | `{"category": "genre"}` |
| `get_session_context` | Get session state | SQLite | `{"session_id": "user-123"}` |
| `update_session_context` | Update session | SQLite | `{"session_id": "user-123", "context_data": {...}}` |
| `add_to_history` | Add history item | SQLite | `{"type": "tv", "title": "CNN"}` |

**Database Schema**:
```sql
-- ~/.prism-iptv/user-memory.db

CREATE TABLE history (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL,  -- tv, radio, podcast, movie
  title TEXT NOT NULL,
  channel TEXT,
  url TEXT,
  timestamp TEXT NOT NULL,
  duration_seconds INTEGER
);

CREATE TABLE preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  category TEXT,  -- genre, favorite, setting, other
  updated_at TEXT
);

CREATE TABLE session_context (
  session_id TEXT PRIMARY KEY,
  start_time TEXT NOT NULL,
  last_activity TEXT NOT NULL,
  context_data TEXT  -- JSON blob
);
```

**Session Timeout**: 5 minutes of inactivity

---

## Integration with Lumen AI

### Enhanced Lumen Backend

Update `lumen-mascot/main.py` to integrate MCP:

```python
# lumen-mascot/main.py
from ai.mcp_client import MCPServerManager
from ai.ollama_client import OllamaClient
from ai.media_command_parser import MediaCommandParser
import asyncio
import logging

logger = logging.getLogger("LumenServer")

# Initialize MCP servers
mcp_manager = MCPServerManager()

async def initialize_mcp_servers():
    """Initialize all MCP servers on startup"""
    logger.info("Initializing MCP servers...")

    try:
        # Add Prism Control Server
        await mcp_manager.add_server(
            "prism-control",
            ["node", "dist/prism-control-server/index.js"]
        )

        # Add Media Knowledge Server
        await mcp_manager.add_server(
            "media-knowledge",
            ["node", "dist/media-knowledge-server/index.js"]
        )

        # Add User Memory Server
        await mcp_manager.add_server(
            "user-memory",
            ["node", "dist/user-memory-server/index.js"]
        )

        logger.info("MCP servers initialized successfully")

        # Log available tools
        tools = mcp_manager.get_available_tools()
        for server, server_tools in tools.items():
            logger.info(f"  {server}: {len(server_tools)} tools")

    except Exception as e:
        logger.error(f"Failed to initialize MCP servers: {e}")


# WebSocket handler with MCP integration
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(client_id, websocket)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            msg_type = message.get("type")
            text_content = message.get("text", "")

            if msg_type == "chat":
                # 1. Check session context via MCP
                try:
                    session_data = await mcp_manager.call_tool(
                        "user-memory",
                        "get_session_context",
                        {"session_id": client_id}
                    )
                    logger.info(f"Session context: {session_data}")
                except Exception as e:
                    logger.warning(f"Could not load session context: {e}")

                # 2. Check for media commands
                media_cmd = media_parser.parse(text_content)

                if media_cmd:
                    # Execute via MCP instead of direct WebSocket
                    try:
                        result = await mcp_manager.call_tool(
                            "prism-control",
                            "control_media_player",
                            {
                                "command": media_cmd.action.lower(),
                                "value": media_cmd.params.get("volume")
                                    or media_cmd.params.get("channel")
                                    or media_cmd.params.get("seconds")
                            }
                        )

                        acknowledgment = media_parser.get_natural_response(media_cmd)

                        # Send response
                        await manager.send_json({
                            "type": "lumen_response_complete",
                            "text": acknowledgment,
                        }, client_id)

                    except Exception as e:
                        logger.error(f"MCP control error: {e}")

                else:
                    # 3. Normal conversation with potential tool use
                    response = await process_with_mcp(text_content, client_id)

                    await manager.send_json({
                        "type": "lumen_response_complete",
                        "text": response,
                    }, client_id)

    except WebSocketDisconnect:
        manager.disconnect(client_id)


async def process_with_mcp(query: str, client_id: str) -> str:
    """
    Process query with MCP tool awareness

    This is where we integrate LLM reasoning with MCP tool calls
    """

    # Simple keyword-based tool routing for now
    # TODO: Use LLM to decide which tools to call

    query_lower = query.lower()

    # Check for media knowledge queries
    if any(kw in query_lower for kw in ["what's on", "currently playing", "on tv"]):
        try:
            broadcasts = await mcp_manager.call_tool(
                "media-knowledge",
                "get_current_broadcasts",
                {"limit": 5}
            )

            # Format response
            broadcasts_data = json.loads(broadcasts)
            response = "Here's what's on TV right now:\n\n"
            for prog in broadcasts_data[:5]:
                response += f"• {prog['channel']}: {prog['title']}\n"

            return response

        except Exception as e:
            logger.error(f"EPG query error: {e}")

    # Check for radio queries
    if "radio" in query_lower and any(kw in query_lower for kw in ["find", "search", "play"]):
        try:
            # Extract genre/country from query (simple keyword matching)
            tag = None
            if "jazz" in query_lower:
                tag = "jazz"
            elif "rock" in query_lower:
                tag = "rock"
            elif "news" in query_lower:
                tag = "news"

            stations = await mcp_manager.call_tool(
                "media-knowledge",
                "find_radio_station",
                {"tag": tag, "limit": 5}
            )

            stations_data = json.loads(stations)
            response = f"Here are some {tag or ''} radio stations:\n\n"
            for station in stations_data[:5]:
                response += f"• {station['name']} ({station['country']})\n"

            return response

        except Exception as e:
            logger.error(f"Radio query error: {e}")

    # Check for user preference queries
    if any(kw in query_lower for kw in ["my favorite", "i like", "prefer"]):
        try:
            # Extract preference (simple parsing)
            if "genre" in query_lower:
                prefs = await mcp_manager.call_tool(
                    "user-memory",
                    "get_user_preferences",
                    {"category": "genre"}
                )

                prefs_data = json.loads(prefs)
                if prefs_data:
                    genres = [p['value'] for p in prefs_data]
                    return f"I remember you like: {', '.join(genres)}"
                else:
                    return "I don't have any genre preferences saved yet."

        except Exception as e:
            logger.error(f"Preference query error: {e}")

    # Default: Use LLM for general conversation
    response = await ai_client.generate_response(query)
    return response


# Startup event
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(initialize_mcp_servers())
```

---

## Tool Usage Examples

### Example 1: Playback Control

```python
# Play media
result = await mcp_manager.call_tool(
    "prism-control",
    "control_media_player",
    {"command": "play"}
)
# Result: "Media control executed: play"

# Set volume to 80%
result = await mcp_manager.call_tool(
    "prism-control",
    "control_media_player",
    {"command": "set_volume", "value": 80}
)

# Go to channel 102
result = await mcp_manager.call_tool(
    "prism-control",
    "control_media_player",
    {"command": "go_to_channel", "value": 102}
)
```

### Example 2: EPG Queries

```python
# What's on TV now?
broadcasts = await mcp_manager.call_tool(
    "media-knowledge",
    "get_current_broadcasts",
    {"limit": 10}
)

data = json.loads(broadcasts)
for program in data:
    print(f"{program['channel']}: {program['title']}")
    print(f"  {program['start']} - {program['stop']}")
    print(f"  {program['description']}")
```

### Example 3: Radio Station Search

```python
# Find jazz stations in the US
stations = await mcp_manager.call_tool(
    "media-knowledge",
    "find_radio_station",
    {
        "country": "US",
        "tag": "jazz",
        "limit": 5
    }
)

data = json.loads(stations)
for station in data:
    print(f"{station['name']}")
    print(f"  URL: {station['url']}")
    print(f"  Bitrate: {station['bitrate']}kbps")
```

### Example 4: User Preferences

```python
# Save favorite genre
await mcp_manager.call_tool(
    "user-memory",
    "save_user_preference",
    {
        "key": "favorite_genre",
        "value": "sci-fi",
        "category": "genre"
    }
)

# Get all genre preferences
prefs = await mcp_manager.call_tool(
    "user-memory",
    "get_user_preferences",
    {"category": "genre"}
)

data = json.loads(prefs)
for pref in data:
    print(f"{pref['key']}: {pref['value']}")
```

### Example 5: Viewing History

```python
# Add to history
await mcp_manager.call_tool(
    "user-memory",
    "add_to_history",
    {
        "type": "tv",
        "title": "CNN Live",
        "channel": "CNN",
        "duration_seconds": 1800
    }
)

# Get last 10 items
history = await mcp_manager.call_tool(
    "user-memory",
    "get_user_history",
    {"limit": 10}
)

data = json.loads(history)
for item in data:
    print(f"{item['timestamp']}: {item['title']}")
```

---

## Advanced Patterns

### Pattern 1: LLM-Driven Tool Selection

Instead of keyword matching, use LLaMA to decide which tools to call:

```python
async def intelligent_tool_selection(query: str) -> List[Dict]:
    """
    Use LLM to determine which MCP tools to call

    This is a simplified example. In production, you would:
    1. Give LLM descriptions of all available tools
    2. Ask it to select appropriate tools
    3. Parse the LLM response to extract tool calls
    """

    # Get all available tools
    tools_dict = mcp_manager.get_available_tools()

    # Build tool descriptions for LLM
    tool_descriptions = []
    for server, tools in tools_dict.items():
        for tool in tools:
            tool_descriptions.append({
                "server": server,
                "name": tool["name"],
                "description": tool["description"]
            })

    # Create prompt for LLM
    prompt = f"""
You are a tool selection assistant. Given a user query, determine which tools (if any) should be called.

Available tools:
{json.dumps(tool_descriptions, indent=2)}

User query: "{query}"

Respond with JSON array of tools to call, or empty array if no tools needed.
Format:
[
  {{"server": "server-name", "tool": "tool-name", "arguments": {{...}}}},
  ...
]

Response:
"""

    # Get LLM decision
    response = await ai_client.generate_response(prompt)

    # Parse JSON response
    try:
        tools_to_call = json.loads(response)
        return tools_to_call
    except:
        return []


async def process_with_intelligent_tools(query: str) -> str:
    """Process query with LLM-driven tool selection"""

    # 1. Decide which tools to call
    tools_to_call = await intelligent_tool_selection(query)

    # 2. Execute tools
    tool_results = []
    for tool_call in tools_to_call:
        try:
            result = await mcp_manager.call_tool(
                tool_call["server"],
                tool_call["tool"],
                tool_call.get("arguments", {})
            )
            tool_results.append({
                "tool": tool_call["tool"],
                "result": result
            })
        except Exception as e:
            logger.error(f"Tool execution error: {e}")

    # 3. Generate final response with tool results
    if tool_results:
        enhanced_query = f"""
User query: {query}

Tool results:
{json.dumps(tool_results, indent=2)}

Using the tool results above, provide a helpful response to the user.
"""
        response = await ai_client.generate_response(enhanced_query)
    else:
        # No tools needed, direct conversation
        response = await ai_client.generate_response(query)

    return response
```

### Pattern 2: Session-Aware Conversations

Maintain conversation context across interactions:

```python
async def session_aware_conversation(
    query: str,
    client_id: str
) -> str:
    """
    Conversation with persistent session context

    Automatically loads and updates session state
    """

    # 1. Load session context
    session = await mcp_manager.call_tool(
        "user-memory",
        "get_session_context",
        {"session_id": client_id}
    )

    session_data = json.loads(session)
    context_data = json.loads(session_data.get("context_data", "{}"))

    # 2. Enhance query with context
    context_prompt = ""
    if context_data:
        context_prompt = f"\nPrevious context: {json.dumps(context_data)}\n"

    full_prompt = context_prompt + f"\nUser: {query}\n"

    # 3. Generate response
    response = await ai_client.generate_response(full_prompt)

    # 4. Update session context
    new_context = {
        "last_query": query,
        "last_response": response,
        "timestamp": datetime.now().isoformat(),
        **context_data  # Preserve existing context
    }

    await mcp_manager.call_tool(
        "user-memory",
        "update_session_context",
        {
            "session_id": client_id,
            "context_data": new_context
        }
    )

    return response
```

### Pattern 3: Personalized Recommendations

Use viewing history and preferences for recommendations:

```python
async def get_personalized_recommendations(
    media_type: str = "tv"
) -> List[str]:
    """
    Generate personalized recommendations based on user data

    Combines:
    - Viewing history (what they watched)
    - Saved preferences (what they like)
    - Current EPG data (what's available)
    """

    # 1. Get user preferences
    prefs = await mcp_manager.call_tool(
        "user-memory",
        "get_user_preferences",
        {"category": "genre"}
    )

    favorite_genres = [p["value"] for p in json.loads(prefs)]

    # 2. Get viewing history
    history = await mcp_manager.call_tool(
        "user-memory",
        "get_user_history",
        {"type": media_type, "limit": 20}
    )

    watched_titles = [h["title"] for h in json.loads(history)]

    # 3. Get current broadcasts matching preferences
    recommendations = []

    for genre in favorite_genres:
        broadcasts = await mcp_manager.call_tool(
            "media-knowledge",
            "get_current_broadcasts",
            {"genre": genre, "limit": 5}
        )

        for prog in json.loads(broadcasts):
            if prog["title"] not in watched_titles:
                recommendations.append(prog)

    return recommendations[:10]  # Top 10
```

---

## Troubleshooting

### Issue 1: MCP Server Won't Start

**Error**: `Failed to start MCP server`

**Solutions**:
1. Check Node.js version: `node --version` (requires 18+)
2. Rebuild TypeScript: `cd mcp-servers && npm run build`
3. Check server path in command
4. Verify no port conflicts

**Debug**:
```python
import subprocess

# Test server directly
proc = subprocess.Popen(
    ["node", "dist/prism-control-server/index.js"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

# Read stderr for error messages
errors = proc.stderr.read()
print(errors.decode())
```

### Issue 2: Tool Call Timeout

**Error**: `Timeout waiting for response`

**Causes**:
- Server hung or crashed
- Request malformed
- Network issue (for external APIs)

**Solutions**:
1. Increase timeout: `timeout=30.0` in `call_tool()`
2. Check server stderr logs
3. Verify request format
4. Test with simple tool first

### Issue 3: WebSocket Connection Failed

**Error**: `Not connected to Prism IPTV frontend`

**Solutions**:
1. Verify Prism IPTV app is running
2. Check WebSocket URL: `ws://localhost:3001`
3. Test WebSocket manually:
   ```javascript
   const ws = new WebSocket('ws://localhost:3001');
   ws.onopen = () => console.log('Connected');
   ```

### Issue 4: Database Locked

**Error**: `database is locked`

**Causes**:
- Multiple processes accessing DB
- Unclosed connections

**Solutions**:
1. Ensure `await client.close()` in cleanup
2. Use single User Memory server instance
3. Check for zombie processes: `ps aux | grep user-memory`
4. Delete lock file: `rm ~/.prism-iptv/user-memory.db-shm`

### Issue 5: External API Errors

**TMDB API Error**: `TMDB API key not configured`

**Solution**:
```bash
# Set API key
export TMDB_API_KEY=your_key_here

# Or in .env file
echo "TMDB_API_KEY=your_key_here" >> mcp-servers/.env
```

**Brave Search Error**: `BRAVE_API_KEY required`

**Solution**:
Get API key at https://brave.com/search/api/ and set in environment

---

## Performance Tips

1. **Cache Tool Lists**
   ```python
   # Don't call list_tools() on every query
   # Cache on startup
   await manager.add_server(..., auto_start=True)
   ```

2. **Batch Tool Calls**
   ```python
   # Instead of sequential calls
   # Use asyncio.gather for parallel execution
   results = await asyncio.gather(
       manager.call_tool("media-knowledge", "get_current_broadcasts", {}),
       manager.call_tool("user-memory", "get_user_preferences", {})
   )
   ```

3. **Reuse Server Connections**
   ```python
   # Keep MCPServerManager as singleton
   # Don't create new instances per request
   ```

4. **Limit Result Sizes**
   ```python
   # Always specify limit parameter
   {"limit": 10}  # Instead of fetching all
   ```

---

## Next Steps

1. **Implement LLM Tool Selection**
   - Use LLaMA to intelligently choose tools
   - See "Pattern 1" above

2. **Add More External Servers**
   - Weather data (OpenWeather MCP)
   - Calendar integration
   - Smart home control

3. **Enhanced Session Management**
   - Multi-user support
   - Longer conversation history
   - Cloud sync

4. **Analytics Dashboard**
   - Tool usage metrics
   - User behavior tracking
   - Performance monitoring

---

**For more information**, see:
- [MCP Server README](mcp-servers/README.md)
- [Implementation Guide](IMPLEMENTATION_GUIDE.md)
- [MCP Protocol Spec](https://modelcontextprotocol.io)

---

**Last Updated**: 2026-01-07
