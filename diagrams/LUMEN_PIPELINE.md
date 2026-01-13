# Lumen AI Pipeline: Ear-to-Voice Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant A as AI Models (GPU)
    participant S as Safety Guard

    U->>F: Speech Input
    F->>B: Audio Bytes (WebSocket)
    B->>A: VAD (Silence Detection)
    A-->>B: Speech Start
    B->>A: Transcribe (Whisper v3)
    A-->>B: "Play Interstellar"
    B->>S: Validate Action
    S-->>B: Safe=True
    B->>A: Intent (Llama 3)
    A-->>B: Playback Intent + Response Text
    B->>A: Synthesize (XTTS v2)
    A-->>B: Audio Stream + Visemes
    B->>F: Response JSON (Audio + Animation)
    F->>U: Audio Playback + Avatar Motion
```

## Latency Optimization

- **Execution**: All heavy AI calls run in non-blocking executors.
- **Streaming**: Audio is chunked and streamed for immediate playback start.
- **Safety**: Parallel validation of user intent against safety policies.
