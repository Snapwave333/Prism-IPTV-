# Technical Specifications: Prism IPTV v2.1 (Hardened)

## 1. System Architecture

Prism IPTV v2.1 is built on a high-performance, real-time AI backbone designed for sub-second responses and immersive avatar interaction.

### 1.1 Core Components

- **Frontend**: Vite + React + TypeScript (Tailwind + Framer Motion).
- **AI Backend**: FastAPI (Python 3.10+) - `main_enhanced.py`.
- **Database**: SQLite (WASM on Frontend, Local on Backend for Memory).
- **AI Models (GPU-Bound)**:
  - **LLM**: Ollama (Llama 3-8B / 3.2-3B).
  - **STT**: Faster-Whisper (v3-large).
  - **TTS**: Coqui XTTS v2.
  - **VAD**: Silero VAD.
- **MCP Bridge**: Multi-process communication layer for IPTV control.

### 1.2 Hardware Enforcement

> [!IMPORTANT]
> System requires a dedicated NVIDIA GPU with CUDA 11.8+. 
> Minimal VRAM: 8GB (Experimental) / 12GB+ (Recommended).
> Application will fail-fast at startup if `torch.cuda.is_available()` returns `False`.

## 2. Data Models & Intelligence

### 2.1 Episodic Memory (Vector Store)

- **Engine**: In-memory JSON vector storage.
- **Embeddings**: Generated via Ollama.
- **Schema**:

  ```json
  {
    "id": "uuid",
    "text": "User liked Interstellar",
    "embedding": [...],
    "timestamp": "ISO-8601",
    "metadata": {"type": "preference"}
  }
  ```

### 2.2 Safety Guard Logic

- **Spoiler Guard**: NLU parsing of EPG metadata and real-time subtitles.
- **Operational Safety**: Confirm-before-write logic for destructive MQTT/DB actions.

## 3. Performance Characteristics

- **Barge-In Latency**: < 200ms (Hush Mode).
- **First Token Latency**: < 800ms.
- **Total Roundtrip**: ~1.5s (Ear-to-Voice).
- **Memory Overhead**: ~4GB System RAM, ~10GB VRAM.

## 4. Constraints & Known Limitations

- **Single User Focus**: Multi-user diarization is in beta.
- **Network Dependency**: EPG and Sports API require active internet connection.
- **GPU Exclusivity**: CPU fallback is disabled to ensure UX quality.
