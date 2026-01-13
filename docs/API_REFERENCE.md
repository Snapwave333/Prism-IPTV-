# API Reference: Lumen AI Gateway

## 1. WebSocket Endpoint

`WS /ws/{client_id}`

The primary real-time communication channel for the Mascot pipeline.

### 1.1 Inbound Messages (Client -> Server)

#### `chat`

Send text input for processing.

```json
{
  "type": "chat",
  "text": "Play some action movies"
}
```

#### `voice`

Send path to captured audio file or raw base64.

```json
{
  "type": "voice",
  "audio_path": "temp_audio/user_voice_123.wav"
}
```

#### `subtitle`

Inject live subtitles for non-verbal reactions.

```json
{
  "type": "subtitle",
  "text": "That was hilarious!"
}
```

### 1.2 Outbound Messages (Server -> Client)

#### `lumen_response_complete`

Complete AI response with TTS and VRM metadata.

```json
{
  "type": "lumen_response_complete",
  "text": "Starting Interstellar for you.",
  "animation": {
    "expression": "happy",
    "gestures": ["wave"],
    "idle_tier": "engaged"
  },
  "audio_data": "base64...",
  "assets": {
    "environment_url": "/assets/cinema_lobby.jpg"
  }
}
```

## 2. REST Endpoints

### `GET /health`

Returns system status including GPU availability and MCP connectivity.

### `GET /generated_assets/{path}`

Static mount for generated backgrounds and accessories.

## 3. Security & Rate Limiting

- **Authentication**: JWT-based (Optional, managed via IdentityManager).
- **Concurrency**: Supported via `session_contexts` map.
- **Hardening**: SQL injection protection on `MediaNLU` and `SafetyGuard` filters.

## 4. Integration Examples (Python)

```python
import asyncio
import websockets
import json

async def send_command():
    uri = "ws://localhost:8000/ws/dev_client"
    async with websockets.connect(uri) as websocket:
        # Send a chat message
        await websocket.send(json.dumps({
            "type": "chat",
            "text": "What are you thinking about?"
        }))
        
        # Receive the response
        response = await websocket.recv()
        data = json.loads(response)
        print(f"Lumen says: {data['text']}")

asyncio.run(send_command())
```
