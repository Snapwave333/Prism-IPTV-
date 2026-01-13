# Prism IPTV Enhancement Implementation Guide

## Project Overview
This document tracks the implementation of 9 major feature enhancements for Prism IPTV, a sophisticated IPTV platform with an AI-powered mascot (Lumen) using LLaMA3, Whisper, Coqui TTS, and VRM avatar technology.

---

## Implementation Status

### ✅ COMPLETED FEATURES

#### 1. Conversational Media Control System
**Status**: IMPLEMENTED ✅
**Files Modified/Created**:
- `lumen-mascot/ai/media_command_parser.py` (NEW)
- `lumen-mascot/main.py` (UPDATED)
- `src/hooks/useLumen.ts` (UPDATED)

**Features**:
- Natural language media command parsing (play, pause, volume, channel switching, seeking)
- Regex-based pattern matching for 14+ command types
- Integration with Lumen AI for voice-activated control
- WebSocket-based command transmission to frontend
- Natural language acknowledgments from Lumen
- Support for commands like:
  - "Play" / "Pause"
  - "Volume up" / "Set volume to 75"
  - "Go to channel 5" / "Watch ESPN"
  - "Skip forward 30 seconds" / "Rewind 2 minutes"
  - "Show me the guide" / "Mute"

**How It Works**:
1. User speaks/types command to Lumen
2. MediaCommandParser extracts action and parameters
3. Backend sends `media_control` message to frontend via WebSocket
4. Frontend useLumen hook executes command via playerStore
5. Lumen responds with natural acknowledgment via TTS

**Testing**:
```bash
cd lumen-mascot
python ai/media_command_parser.py
```

---

#### 2. Companion Viewing/Listening Mode (Real-time Commentary)
**Status**: CORE MODULE IMPLEMENTED ✅ (Integration pending)
**Files Created**:
- `lumen-mascot/ai/companion_mode.py` (NEW)

**Features**:
- Contextual awareness of current media (type, title, genre, description)
- Auto-commentary generation with configurable cooldown (30s default)
- Reaction trigger system for exciting moments (goals, breaking news, etc.)
- Genre-specific reaction triggers (sports, news, music)
- Proactive commentary topic generation
- Animation payloads for reactive moments
- EPG-aware context injection for LLM prompts

**Capabilities**:
- `activate(media_info)` - Start companion mode with media context
- `generate_context_prompt(user_query)` - Enhance LLM prompts with viewing context
- `should_interrupt_for_reaction(detected_text)` - Detect exciting moments
- `create_reaction_animation(trigger)` - Generate VRM animations for events
- `get_companion_greeting()` - Welcome message when mode starts

**Testing**:
```bash
cd lumen-mascot
python ai/companion_mode.py
```

**Next Steps for Full Integration**:
1. Add CompanionMode instance to `main.py`
2. Integrate with EPG service to fetch media metadata
3. Create WebSocket message type for mode activation/deactivation
4. Add frontend UI toggle for companion mode
5. Implement periodic commentary generation in background task
6. Connect to STT/caption feed for reaction triggers

---

### 🚧 IN PROGRESS

#### 3. Companion Mode - Synchronized VRM Reactions
**Status**: 40% Complete
**Requirements**:
- Real-time audio analysis for music beat detection
- Caption/STT feed integration for content awareness
- Enhanced animation mapper with music-specific animations
- Emotion detection from audio tone

**Remaining Work**:
- Implement audio beat detection using librosa
- Create music-reactive animation profiles (sway, head bob, excitement)
- Add caption parsing integration
- Enhance VRM controller with music synchronization

---

### 📋 PLANNED FEATURES

#### 4. AI Model Upgrades

##### Whisper v3 Large Upgrade
**Current**: Faster-Whisper (optimized Whisper v2)
**Target**: Whisper v3 Large (Turbo)
**Implementation**:

```python
# Update lumen-mascot/audio/stt_engine.py
from faster_whisper import WhisperModel

class STTEngine:
    def __init__(self, model_size: str = "large-v3"):
        # Use large-v3 or large-v3-turbo
        self.model = WhisperModel(
            model_size,
            device="cuda",  # or "cpu"
            compute_type="float16"  # or "int8" for CPU
        )
```

**Steps**:
1. Update `requirements.txt`: `faster-whisper>=1.0.0`
2. Modify `STTEngine.__init__()` to use "large-v3"
3. Test transcription accuracy and latency
4. Update model download documentation

**Benefits**:
- Improved accuracy for accented speech
- Better multilingual support (98 languages)
- Lower word error rate (WER)

---

##### LLaMA 3.1/3.2 Upgrade
**Current**: LLaMA 3 8B
**Target**: LLaMA 3.2 11B Vision (for future image understanding) or LLaMA 3.1 8B (latest stable)
**Implementation**:

```python
# Update lumen-mascot/ai/ollama_client.py
class OllamaClient:
    def __init__(self, model: str = "llama3.2:latest"):
        self.model = model
        # ... rest of implementation
```

**Steps**:
1. Pull new model: `ollama pull llama3.2`
2. Update default model in `main.py` initialization
3. Test conversation quality and context handling
4. Adjust context window if needed (3.2 supports up to 128k tokens)

**Benefits**:
- Improved reasoning capabilities
- Better instruction following
- Enhanced context retention
- Vision capabilities (3.2 11B variant)

---

#### 5. Performance Optimizations

##### AI Inference Speed
**Techniques**:
1. **Model Quantization**
   ```python
   # Use 4-bit quantization for LLaMA
   # Ollama handles this automatically with Q4_K_M models
   ollama pull llama3.2:latest-q4_k_m
   ```

2. **Context Window Optimization**
   ```python
   # Reduce context from 20 to 10 exchanges for faster inference
   messages.extend(self.conversation_history[-10:])
   ```

3. **Response Streaming**
   - Already implemented via `stream_response()`
   - Reduces perceived latency

4. **GPU Memory Management**
   ```python
   # In utils/optimization.py
   import torch
   torch.cuda.empty_cache()  # Clear cache after each response
   ```

**Expected Gains**: 30-50% faster response times

---

##### TTS Latency Reduction
**Current**: Coqui TTS (VITS)
**Optimization Strategies**:

1. **Sentence-Level Streaming** (Already Implemented ✅)
2. **Audio Chunk Buffering**
   ```python
   # Stream audio in chunks rather than full sentences
   def synthesize_streaming(self, text: str):
       for chunk in split_into_chunks(text, chunk_size=50):
           yield self.synthesize(chunk)
   ```

3. **Model Warm-up**
   ```python
   # Pre-load TTS model on startup
   tts_engine.synthesize("warmup", "temp_warmup.wav")
   ```

4. **Parallel TTS Processing**
   ```python
   # Process multiple sentences simultaneously
   with ThreadPoolExecutor(max_workers=3) as executor:
       futures = [executor.submit(tts_engine.synthesize, s) for s in sentences]
   ```

**Expected Gains**: 40-60% reduction in audio delivery latency

---

##### VRM Rendering Performance
**Optimizations**:

1. **LOD (Level of Detail)**
   ```typescript
   // src/components/lumen/vrm/VrmController.ts
   // Reduce polygon count when mascot is minimized
   if (windowSize === 'small') {
       vrm.scene.traverse((obj) => {
           if (obj.isMesh) obj.visible = false;  // Hide details
       });
   }
   ```

2. **Animation Frame Rate Control**
   ```typescript
   // Limit to 30fps instead of 60fps
   let lastFrame = 0;
   const frameInterval = 1000 / 30;

   function animate(time: number) {
       if (time - lastFrame < frameInterval) return;
       lastFrame = time;
       // ... animation logic
   }
   ```

3. **Expression Batching**
   ```typescript
   // Update expressions every 100ms instead of every frame
   setInterval(() => {
       vrmController.updateExpression(currentExpression);
   }, 100);
   ```

**Expected Gains**: 50% reduction in GPU usage

---

##### HLS Video Buffering
**Optimizations**:

```typescript
// src/components/player/VideoPlayer.tsx
const hlsConfig = {
    maxBufferLength: 30,      // Increase from default 30s
    maxMaxBufferLength: 600,  // Max buffer: 10 minutes
    maxBufferSize: 60 * 1000 * 1000,  // 60 MB
    enableWorker: true,       // Use web worker for demuxing
    lowLatencyMode: false,    // Disable for better buffering
    backBufferLength: 90      // Keep 90s of back buffer
};
```

**Expected Gains**: Fewer rebuffering events, smoother playback

---

#### 6. Emotional Intelligence System

**Architecture**:
```
lumen-mascot/ai/sentiment_analyzer.py (NEW)
```

**Implementation**:

```python
from textblob import TextBlob  # or transformers for better accuracy

class SentimentAnalyzer:
    def analyze(self, text: str) -> dict:
        """
        Analyze user sentiment from text

        Returns:
            {
                "sentiment": "positive|negative|neutral",
                "polarity": -1.0 to 1.0,
                "emotions": ["joy", "sadness", "anger", ...],
                "intensity": 0.0 to 1.0
            }
        """
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity

        # Map polarity to sentiment
        if polarity > 0.1:
            sentiment = "positive"
        elif polarity < -0.1:
            sentiment = "negative"
        else:
            sentiment = "neutral"

        # Emotion detection (keyword-based)
        emotions = self._detect_emotions(text)

        return {
            "sentiment": sentiment,
            "polarity": polarity,
            "emotions": emotions,
            "intensity": abs(polarity)
        }

    def _detect_emotions(self, text: str) -> list:
        emotion_keywords = {
            "joy": ["happy", "excited", "great", "love", "awesome"],
            "sadness": ["sad", "disappointed", "unhappy", "miss"],
            "anger": ["angry", "frustrated", "annoyed", "hate"],
            "fear": ["scared", "worried", "afraid", "nervous"],
            "surprise": ["wow", "amazing", "incredible", "shocked"]
        }

        detected = []
        text_lower = text.lower()
        for emotion, keywords in emotion_keywords.items():
            if any(kw in text_lower for kw in keywords):
                detected.append(emotion)

        return detected or ["neutral"]
```

**Integration**:
```python
# In main.py websocket handler
sentiment = sentiment_analyzer.analyze(text_content)

# Enhance system prompt based on sentiment
if sentiment["sentiment"] == "negative":
    enhanced_prompt = "The user seems frustrated. Be extra helpful and empathetic."
elif sentiment["emotions"] and "joy" in sentiment["emotions"]:
    enhanced_prompt = "The user is happy! Match their enthusiasm!"
```

**Dependencies**:
```txt
textblob==0.17.1
# Or for better accuracy:
transformers==4.36.0
torch==2.1.2
```

---

#### 7. TTS Pipeline Upgrade - XTTS v2

**Current**: Coqui TTS (VITS with VCTK)
**Target**: XTTS v2 (Extreme Text-to-Speech)

**Benefits**:
- Voice cloning from 6-second samples
- 17 supported languages
- More natural prosody and emotion
- Better voice consistency

**Implementation**:

```python
# lumen-mascot/audio/tts_engine.py
from TTS.api import TTS

class TTSEngine:
    def __init__(self, use_xtts: bool = True):
        if use_xtts:
            # XTTS v2 multi-lingual
            self.tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
        else:
            # Legacy VITS
            self.tts = TTS("tts_models/en/vctk/vits")

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.tts.to(self.device)

    def synthesize(
        self,
        text: str,
        output_path: str,
        speaker_wav: str = "default_voice.wav",  # Reference voice
        language: str = "en"
    ) -> bool:
        try:
            self.tts.tts_to_file(
                text=text,
                file_path=output_path,
                speaker_wav=speaker_wav,  # Voice cloning source
                language=language
            )
            return True
        except Exception as e:
            logger.error(f"TTS synthesis failed: {e}")
            return False
```

**Steps**:
1. Update `requirements.txt`: `TTS>=0.22.0`
2. Download XTTS v2 model: ~1.8GB
3. Record/obtain Lumen's reference voice (6+ seconds of clean audio)
4. Test synthesis quality and latency
5. Implement emotional tone control via prosody

**Emotional Control**:
```python
# XTTS supports style control via reference audio
emotion_voices = {
    "happy": "voices/lumen_happy.wav",
    "sad": "voices/lumen_sad.wav",
    "excited": "voices/lumen_excited.wav",
    "neutral": "voices/lumen_neutral.wav"
}

def synthesize_with_emotion(self, text: str, emotion: str = "neutral"):
    voice_ref = emotion_voices.get(emotion, emotion_voices["neutral"])
    return self.synthesize(text, output_path, speaker_wav=voice_ref)
```

---

#### 8. VRM Animation Improvements

##### Enhanced Lip-Sync Accuracy

**Current**: Basic vowel mapping (A, I, U, E, O)
**Upgrade**: Phoneme-to-viseme mapping with timing

**Implementation**:

```python
# lumen-mascot/visual/animation_controller.py
from phonemizer import phonemize

class AnimationController:
    # Expanded viseme map (ARKit-compatible)
    PHONEME_TO_VISEME = {
        # Vowels
        'AA': 'aa', 'AE': 'aa', 'AH': 'aa',
        'IY': 'ih', 'IH': 'ih',
        'UW': 'ou', 'UH': 'ou',
        'EH': 'eh', 'EY': 'eh',
        'OW': 'oh', 'AO': 'oh',

        # Consonants
        'M': 'pp', 'P': 'pp', 'B': 'pp',
        'F': 'ff', 'V': 'ff',
        'TH': 'th', 'DH': 'th',
        'S': 'ss', 'Z': 'ss',
        'CH': 'ch', 'SH': 'ch',
        'R': 'rr', 'W': 'rr',
        'L': 'nn', 'N': 'nn'
    }

    def generate_lipsync_from_audio(self, audio_path: str, text: str):
        """
        Generate precise lip-sync data from audio file

        Returns:
            List of (timestamp, viseme) tuples
        """
        # 1. Get phonemes with timing using forced alignment
        phonemes = self._phonemize_with_timing(text, audio_path)

        # 2. Map phonemes to visemes
        lipsync_frames = []
        for phoneme, start_time, end_time in phonemes:
            viseme = self.PHONEME_TO_VISEME.get(phoneme, 'neutral')
            lipsync_frames.append({
                "time": start_time,
                "duration": end_time - start_time,
                "viseme": viseme,
                "intensity": 0.8
            })

        return lipsync_frames

    def _phonemize_with_timing(self, text: str, audio_path: str):
        # Use Montreal Forced Aligner or Gentle for timing
        # For simplicity, estimate timing from text length
        phonemes = phonemize(text, language='en-us', backend='espeak')

        # Rough timing estimation (improve with MFA)
        avg_phoneme_duration = 0.08  # 80ms per phoneme
        timed_phonemes = []
        current_time = 0

        for phoneme in phonemes.split():
            timed_phonemes.append((phoneme, current_time, current_time + avg_phoneme_duration))
            current_time += avg_phoneme_duration

        return timed_phonemes
```

**Dependencies**:
```txt
phonemizer==3.2.1
montreal-forced-aligner==2.2.17  # For precise timing
```

---

##### Gesture Variety

**New Gestures**:
```typescript
// src/components/lumen/vrm/VrmController.ts
const GESTURE_ANIMATIONS = {
    // Existing
    'wave': 'animations/wave.fbx',
    'nod': 'animations/nod.fbx',
    'shake_head': 'animations/shake_head.fbx',

    // NEW Gestures
    'thumbs_up': 'animations/thumbs_up.fbx',
    'shrug': 'animations/shrug.fbx',
    'think': 'animations/hand_on_chin.fbx',
    'clap': 'animations/clap.fbx',
    'cheer': 'animations/cheer.fbx',
    'point_left': 'animations/point_left.fbx',
    'point_right': 'animations/point_right.fbx',
    'excited_jump': 'animations/jump.fbx',
    'dance': 'animations/dance_loop.fbx',
    'lean_in': 'animations/lean_forward.fbx',
    'surprised_step_back': 'animations/step_back.fbx'
};
```

**Animation Blending**:
```typescript
playGesture(gestureName: string, blendDuration: number = 0.3) {
    const gesture = GESTURE_ANIMATIONS[gestureName];
    if (!gesture) return;

    const action = this.mixer.clipAction(gesture);
    action.reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(blendDuration)
        .play();

    // Fade out after gesture completes
    action.clampWhenFinished = true;
    action.setLoop(THREE.LoopOnce, 1);
}
```

---

##### Facial Expression Blending

**Smooth Transitions**:
```typescript
// src/components/lumen/vrm/VrmController.ts
transitionExpression(
    from: string,
    to: string,
    duration: number = 0.5
) {
    const startTime = performance.now();
    const startValues = this.getCurrentExpressionValues(from);
    const endValues = this.getExpressionPreset(to);

    const animate = (currentTime: number) => {
        const elapsed = (currentTime - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);

        // Eased interpolation (ease-in-out)
        const easedProgress = this.easeInOutCubic(progress);

        // Blend expression values
        for (const [key, startValue] of Object.entries(startValues)) {
            const endValue = endValues[key] || 0;
            const blendedValue = startValue + (endValue - startValue) * easedProgress;
            this.vrm.expressionManager.setValue(key, blendedValue);
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };

    requestAnimationFrame(animate);
}

easeInOutCubic(t: number): number {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
```

**Micro-Expressions**:
```typescript
// Add subtle micro-expressions for realism
playMicroExpression() {
    const microExpressions = ['blink', 'slight_smile', 'eyebrow_raise'];
    const expr = microExpressions[Math.floor(Math.random() * microExpressions.length)];

    this.vrm.expressionManager.setValue(expr, 0.3);
    setTimeout(() => {
        this.vrm.expressionManager.setValue(expr, 0);
    }, 200);  // 200ms micro-expression
}
```

---

##### Physics-Based Animations

**Hair & Clothing Physics**:
```typescript
// src/components/lumen/vrm/VrmPhysics.ts
import { VRMSpringBoneManager } from '@pixiv/three-vrm';

class VrmPhysics {
    private springBoneManager: VRMSpringBoneManager;

    constructor(vrm: VRM) {
        this.springBoneManager = vrm.springBoneManager;
    }

    update(deltaTime: number, headMovement: Vector3) {
        // Update spring bones (hair, ears, clothes)
        this.springBoneManager.update(deltaTime);

        // Add external forces (head shake, body movement)
        this.applyExternalForce(headMovement);
    }

    applyExternalForce(movement: Vector3) {
        this.springBoneManager.joints.forEach(joint => {
            // Apply movement as force
            joint.center.add(movement.multiplyScalar(0.1));
        });
    }

    setStiffness(value: number) {
        // Adjust hair stiffness (0 = floppy, 1 = stiff)
        this.springBoneManager.joints.forEach(joint => {
            joint.settings.stiffness = value;
        });
    }

    setGravity(gravity: Vector3) {
        this.springBoneManager.gravityDir = gravity;
    }
}
```

**Integration**:
```typescript
// In VrmMascot.tsx animation loop
const physics = new VrmPhysics(vrm);

function animate() {
    const delta = clock.getDelta();
    const headMovement = calculateHeadMovement();

    physics.update(delta, headMovement);
    mixer.update(delta);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
```

---

#### 9. Unified API Gateway

**Architecture**:
```
                 ┌──────────────────────┐
                 │   API Gateway        │
                 │   (Port 4000)        │
                 └──────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐      ┌────▼────┐      ┌─────▼─────┐
   │ Frontend│      │  Node   │      │  Python   │
   │  React  │      │ Server  │      │ AI Server │
   │ (3000)  │      │ (3001)  │      │  (8000)   │
   └─────────┘      └─────────┘      └───────────┘
```

**Implementation**:

```javascript
// api-gateway/server.js (NEW)
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        services: {
            frontend: 'http://localhost:3000',
            remote: 'http://localhost:3001',
            ai: 'http://localhost:8000'
        },
        timestamp: new Date().toISOString()
    });
});

// Route to Node server (remote control, EPG, proxy)
app.use('/api/remote', createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: { '^/api/remote': '/api' }
}));

// Route to Python AI server
app.use('/api/ai', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: { '^/api/ai': '' },
    ws: true  // WebSocket support
}));

// WebSocket proxy for Lumen
app.use('/ws', createProxyMiddleware({
    target: 'ws://localhost:8000',
    ws: true,
    changeOrigin: true
}));

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
```

**Package Configuration**:
```json
// api-gateway/package.json
{
  "name": "prism-api-gateway",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6",
    "cors": "^2.8.5"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

**Benefits**:
- Single entry point for all services
- Simplified frontend configuration (one base URL)
- Centralized CORS handling
- Request/response logging location
- Future: rate limiting, authentication, caching

---

#### 10. QA Metrics and Testing Framework

**Enhanced Test Structure**:

```typescript
// tests/lumen-integration.spec.ts (NEW)
import { test, expect } from '@playwright/test';

test.describe('Lumen AI Integration', () => {
    test('should connect to Lumen WebSocket', async ({ page }) => {
        await page.goto('http://localhost:3000');

        const wsConnected = await page.evaluate(() => {
            return new Promise((resolve) => {
                const ws = new WebSocket('ws://localhost:8000/ws/test-client');
                ws.onopen = () => resolve(true);
                ws.onerror = () => resolve(false);
            });
        });

        expect(wsConnected).toBe(true);
    });

    test('should send chat message and receive response', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.click('[data-testid="lumen-chat-button"]');
        await page.fill('[data-testid="lumen-input"]', 'Hello Lumen');
        await page.click('[data-testid="lumen-send"]');

        // Wait for Lumen response
        await page.waitForSelector('[data-testid="lumen-message"]', { timeout: 5000 });
        const response = await page.textContent('[data-testid="lumen-message"]');

        expect(response).toBeTruthy();
        expect(response.length).toBeGreaterThan(0);
    });

    test('should execute media command via voice', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.click('[data-testid="lumen-chat-button"]');
        await page.fill('[data-testid="lumen-input"]', 'pause the video');
        await page.click('[data-testid="lumen-send"]');

        // Check if player is paused
        await page.waitForTimeout(1000);
        const isPaused = await page.evaluate(() => {
            const video = document.querySelector('video');
            return video?.paused;
        });

        expect(isPaused).toBe(true);
    });
});
```

**Performance Metrics**:

```typescript
// tests/performance-metrics.spec.ts (NEW)
import { test, expect } from '@playwright/test';

test.describe('Performance Metrics', () => {
    test('Lumen response latency should be < 3 seconds', async ({ page }) => {
        await page.goto('http://localhost:3000');

        const startTime = Date.now();
        await page.fill('[data-testid="lumen-input"]', 'What time is it?');
        await page.click('[data-testid="lumen-send"]');
        await page.waitForSelector('[data-testid="lumen-message"]');
        const endTime = Date.now();

        const latency = endTime - startTime;
        expect(latency).toBeLessThan(3000);
    });

    test('Video buffering should start within 2 seconds', async ({ page }) => {
        await page.goto('http://localhost:3000');

        const startTime = Date.now();
        await page.click('[data-testid="channel-item"]');
        await page.waitForSelector('video[src]');

        // Wait for canplay event
        await page.waitForFunction(() => {
            const video = document.querySelector('video');
            return video?.readyState >= 3;  // HAVE_FUTURE_DATA
        }, { timeout: 5000 });

        const bufferingTime = Date.now() - startTime;
        expect(bufferingTime).toBeLessThan(2000);
    });

    test('VRM rendering should maintain 30+ FPS', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.click('[data-testid="lumen-chat-button"]');

        // Measure FPS over 3 seconds
        const fps = await page.evaluate(() => {
            return new Promise((resolve) => {
                let frames = 0;
                const startTime = performance.now();

                function countFrame() {
                    frames++;
                    if (performance.now() - startTime < 3000) {
                        requestAnimationFrame(countFrame);
                    } else {
                        const avgFPS = frames / 3;
                        resolve(avgFPS);
                    }
                }
                requestAnimationFrame(countFrame);
            });
        });

        expect(fps).toBeGreaterThan(30);
    });
});
```

**Test Coverage Metrics**:

```bash
# Add to package.json scripts
"test:coverage": "playwright test --reporter=html --coverage"
```

**QA Dashboard** (Future Enhancement):
- Grafana dashboard for real-time metrics
- Automated daily test runs
- Performance regression detection
- Error rate monitoring

---

## Installation & Setup

### Prerequisites
```bash
# System requirements
- Node.js 18+
- Python 3.10+
- CUDA 11.8+ (for GPU acceleration)
- Ollama (for LLaMA models)

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3:8b
```

### Backend Setup
```bash
cd lumen-mascot

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download models (first run takes ~15 minutes)
python -c "from audio.tts_engine import TTSEngine; from audio.stt_engine import STTEngine; TTSEngine(); STTEngine()"

# Start AI server
python main.py
```

### Node Server Setup
```bash
cd server
npm install
npm run dev
```

### Frontend Setup
```bash
npm install
npm run dev
```

### Run All Services
```bash
# Terminal 1: AI Backend
cd lumen-mascot && python main.py

# Terminal 2: Node Server
cd server && npm run dev

# Terminal 3: Frontend
npm run dev
```

Access: http://localhost:3000

---

## Testing

### Unit Tests
```bash
# Python backend tests
cd lumen-mascot
pytest tests/

# Node server tests (add Jest)
cd server
npm test
```

### Integration Tests
```bash
# Playwright tests
npm run test
npm run test:headed  # With browser UI
```

### Manual Testing Checklist
- [ ] Lumen connects via WebSocket
- [ ] Chat messages send and receive
- [ ] Media commands execute (play, pause, volume)
- [ ] TTS audio plays
- [ ] VRM avatar animates
- [ ] Companion mode activates
- [ ] EPG data loads
- [ ] Remote control works
- [ ] Video playback smooth

---

## Performance Benchmarks

### Target Metrics
| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| LLaMA Response Time | ~2-3s | <1.5s | High |
| TTS Latency | ~1-2s | <0.8s | High |
| VRM Frame Rate | 45-60 FPS | 60 FPS | Medium |
| Video Buffer Time | 1-2s | <1s | Medium |
| WebSocket Latency | 10-50ms | <30ms | Low |

### Measurement Tools
- Chrome DevTools Performance tab
- Lighthouse CI
- Playwright performance tests
- Custom metrics logging in backend

---

## Deployment Considerations

### Docker Containerization
```dockerfile
# Dockerfile.ai (Python backend)
FROM nvidia/cuda:11.8.0-runtime-ubuntu22.04
RUN apt-get update && apt-get install -y python3.10 python3-pip
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . /app
WORKDIR /app
CMD ["python3", "main.py"]
```

### Environment Variables
```env
# .env
OLLAMA_HOST=http://localhost:11434
TTS_MODEL=tts_models/multilingual/multi-dataset/xtts_v2
STT_MODEL=large-v3
GPU_ENABLED=true
LOG_LEVEL=INFO
```

### Production Checklist
- [ ] Enable HTTPS for all services
- [ ] Add authentication/JWT tokens
- [ ] Implement rate limiting
- [ ] Set up error tracking (Sentry)
- [ ] Configure CDN for static assets
- [ ] Database for user preferences
- [ ] Backup strategy for models
- [ ] Health monitoring & alerts

---

## Next Steps Priority

### Phase 1 (Immediate - Week 1-2)
1. ✅ Conversational media control (DONE)
2. ✅ Companion mode core module (DONE)
3. 🔄 Integrate companion mode into main backend
4. 🔄 Add frontend UI for companion mode toggle
5. Test end-to-end media commands

### Phase 2 (Model Upgrades - Week 3)
1. Upgrade to Whisper v3 Large
2. Upgrade to LLaMA 3.1/3.2
3. Benchmark performance improvements
4. Update documentation

### Phase 3 (Performance - Week 4-5)
1. Implement AI inference optimizations
2. Optimize TTS latency
3. Improve VRM rendering performance
4. Enhance HLS buffering
5. Run performance tests

### Phase 4 (Intelligence - Week 6)
1. Implement sentiment analysis
2. Integrate emotional responses
3. Upgrade to XTTS v2
4. Test voice quality

### Phase 5 (Polish - Week 7-8)
1. Enhanced lip-sync
2. New gesture animations
3. Facial expression blending
4. Physics-based animations
5. User acceptance testing

### Phase 6 (Infrastructure - Week 9)
1. Build unified API gateway
2. Implement monitoring
3. Enhanced QA framework
4. Production deployment prep

---

## Troubleshooting

### Common Issues

**Lumen not responding**
```bash
# Check if AI server is running
curl http://localhost:8000/health

# Check Ollama
ollama list
ollama run llama3:8b "Hello"

# Check logs
tail -f lumen-mascot/logs/lumen.log
```

**TTS not working**
```bash
# Verify Coqui TTS installation
python -c "from TTS.api import TTS; print(TTS().list_models())"

# Check audio output
python -c "from audio.tts_engine import TTSEngine; t = TTSEngine(); t.synthesize('test', 'test.wav')"
```

**VRM not loading**
```bash
# Check asset path
ls assets/FREEBIE_VRoid_Model_-_Mura_Mura/

# Check browser console for errors
# Open DevTools > Console
```

**WebSocket connection failed**
```bash
# Check CORS settings
# Verify ports 8000, 3001, 3000 are not blocked
netstat -an | grep 8000
```

---

## Contributing

### Code Style
- **Python**: Black formatter, type hints
- **TypeScript**: ESLint, Prettier
- **React**: Functional components, hooks

### Commit Convention
```
feat: Add companion mode commentary
fix: Resolve TTS latency issue
perf: Optimize VRM rendering
docs: Update API documentation
test: Add media command tests
```

### Pull Request Process
1. Create feature branch: `git checkout -b feature/companion-mode`
2. Implement changes with tests
3. Run full test suite: `npm run test && cd lumen-mascot && pytest`
4. Update documentation
5. Submit PR with clear description

---

## License & Credits

**Prism IPTV**
- Framework: React, FastAPI, Express.js
- AI Models: LLaMA 3 (Meta), Whisper (OpenAI), Coqui TTS
- 3D: Three.js, VRM Format
- Assets: VRoid Model (Free License)

**Contributors**
- Original development: [Your Name]
- AI integration: Claude (Anthropic)

---

## Changelog

### 2026-01-07
- ✅ Implemented conversational media control system
- ✅ Created companion viewing mode core module
- ✅ Integrated media commands with frontend
- ✅ Added WebSocket message handling for commands
- 📝 Created comprehensive implementation guide

### Future Releases
- v2.0: Full companion mode with EPG integration
- v2.1: AI model upgrades (Whisper v3, LLaMA 3.2)
- v2.2: Performance optimizations
- v2.3: XTTS v2 upgrade
- v3.0: Enhanced animations and API gateway

---

## Contact & Support

For questions or issues:
- GitHub Issues: [project-repo]/issues
- Documentation: See README.md
- API Reference: See API.md (to be created)

---

**Status**: Active Development 🚀
**Last Updated**: 2026-01-07
**Version**: 1.1.0-alpha
