# System Architecture: Prism IPTV v2.2

```mermaid
graph TD
    User((User)) <--> Frontend[Vite/React Frontend]
    Frontend <--> API[FastAPI Backend /main_enhanced.py]
    
    subgraph "AI Pipeline (GPU)"
        API <--> VAD[Silero VAD]
        API <--> STT[Faster-Whisper v3]
        API <--> LLM[Ollama/Llama 3]
        API <--> TTS[Coqui XTTS v2]
    end
    
    subgraph "Logic & Safety"
        API <--> SG[Safety Guard]
        API <--> MM[Memory Manager]
        API <--> SM[Sports Manager]
        API <--> AC[Animation Controller]
    end
    
    subgraph "External Integration"
        API <--> MCP[MCP Bridge]
        API <--> DB[(SQLite Database)]
        API <--> Web[Public APIs /OpenLigaDB/RadioBrowser]
    end
```

## Components

- **Frontend**: Handles media playback (HLS.js), Virtualized TV Guide, Audio Dashboard, and VRM avatar rendering.
- **Backend**: Orchestrates AI and business logic.
- **GPU Cluster**: Dedicated hardware for real-time inference.
- **Memory**: Persistent vector-based retrieval.
