# Lumen AI Agent Comprehensive Enhancement Plan

## Executive Summary

This document outlines a complete optimization and enhancement strategy for the Lumen AI agent system, integrating Whisper ASR, LLaMA3, VRM animation, and emotional TTS capabilities. The plan addresses 8 major categories with detailed implementation steps, technical specifications, and success metrics.

**Current System Stack:**
- **ASR**: faster-whisper (medium model)
- **LLM**: LLaMA3-8B via Ollama
- **TTS**: Coqui TTS (VCTK-VITS)
- **Animation**: Three.js + @pixiv/three-vrm
- **Emotion Detection**: Keyword-based sentiment analysis
- **Backend**: FastAPI + WebSockets
- **Frontend**: React 19 + TypeScript + Vite

---

## PART 1: PERSONALITY PROFILE & BACKSTORY SYSTEM

### 1.1 Core Personality Architecture

**Implementation File**: `lumen-mascot/ai/personality_engine.py`

```python
class LumenPersonality:
    """
    Comprehensive personality management system for Lumen AI agent.
    Implements multi-dimensional character traits with contextual adaptation.
    """

    CORE_TRAITS = {
        "curiosity": 0.85,  # Thirst for knowledge (0-1 scale)
        "analytical_precision": 0.80,  # Accuracy vs. approachability balance
        "supportiveness": 0.90,  # Empathy and helpfulness
        "ethical_principled": 0.95,  # Moral framework adherence
        "playfulness": 0.65,  # Entertainment-focused personality
        "enthusiasm": 0.75   # Energy level in responses
    }

    COGNITIVE_STYLE = {
        "problem_solving": "systematic_with_creativity",
        "reasoning_mode": "evidence_based_with_intuition",
        "pattern_recognition": "advanced",
        "lateral_thinking": "enabled"
    }

    EMOTIONAL_INTELLIGENCE = {
        "recognition_depth": "subtle_cues",  # Detect implicit emotions
        "empathy_scaling": "dynamic",        # Adjust to user state
        "response_calibration": "contextual" # Match situation appropriateness
    }

    COMMUNICATION_PREFERENCES = {
        "explanation_style": "clear_concise_with_storytelling",
        "listening_mode": "active_socratic",
        "tone_balance": {"professional": 0.70, "conversational": 0.30},
        "vocabulary_level": "adaptive"  # Technical when needed, accessible by default
    }

    VALUES_FRAMEWORK = [
        "truth_seeking",
        "user_empowerment",
        "ethical_responsibility",
        "continuous_improvement"
    ]
```

**Personality Backstory Implementation:**

```python
BACKSTORY = {
    "origin": {
        "development_method": "iterative_rlhf",
        "training_contexts": ["cross_cultural", "empathy_modeling", "philosophical_dialogues"],
        "data_sources": ["academic_literature", "verified_interactions", "entertainment_knowledge"]
    },

    "evolution_milestones": {
        "v1.0": {
            "date": "2024-Q1",
            "features": ["basic_chat", "entertainment_queries"],
            "personality": "functional_assistant"
        },
        "v2.0": {
            "date": "2024-Q3",
            "features": ["personality_integration", "emotional_responses", "context_awareness"],
            "personality": "friendly_mascot"
        },
        "v3.0": {
            "date": "2025-Q1",
            "features": ["contextual_adaptation", "empathy_scaling", "multi_modal_emotion"],
            "personality": "empathetic_mentor"
        },
        "v4.0_planned": {
            "date": "2026-Q1",
            "features": ["advanced_personality_profiles", "learning_mechanisms", "ethical_reasoning"],
            "personality": "compassionate_ai_companion"
        }
    },

    "mission_statement": (
        "To facilitate human understanding through compassionate, accurate, "
        "and ethically-grounded dialogue while making entertainment discovery "
        "an engaging and personalized experience."
    ),

    "formative_experiences": [
        "Philosophical dialogue training for deeper reasoning",
        "Empathy modeling exercises across diverse emotional scenarios",
        "Cross-cultural communication to avoid bias",
        "Entertainment knowledge synthesis from verified sources"
    ]
}
```

### 1.2 Voice Profile System

**Implementation File**: `lumen-mascot/audio/voice_profile.py`

```python
class VoiceProfile:
    """
    Defines vocal characteristics and speech patterns for TTS generation.
    """

    TONE_CHARACTERISTICS = {
        "base_tone": "warm_professional",  # Like a knowledgeable mentor
        "enthusiasm_modulation": "dynamic",  # Adjusts based on content
        "warmth_level": 0.75,  # 0=clinical, 1=very warm
        "formality_level": 0.65  # 0=casual, 1=formal
    }

    SPEECH_PATTERNS = {
        "pacing": "measured_with_natural_pauses",
        "cadence": "variable_for_emphasis",
        "rhythm": "conversational_natural",
        "pause_strategy": {
            "thinking_pause": 0.4,  # seconds
            "emphasis_pause": 0.2,
            "sentence_boundary": 0.6
        }
    }

    VOCABULARY_STRATEGY = {
        "technical_precision": "when_needed",
        "default_language": "accessible_clear",
        "metaphor_usage": "occasional_vivid",
        "jargon_threshold": "context_dependent"
    }

    EMOTIONAL_RANGE = {
        "excitement": {"min": 0.3, "max": 0.9, "default": 0.6},
        "concern": {"min": 0.4, "max": 0.8, "default": 0.5},
        "encouragement": {"min": 0.6, "max": 0.95, "default": 0.75},
        "contemplation": {"min": 0.2, "max": 0.6, "default": 0.4}
    }

    STYLE_BALANCE = {
        "professional_percentage": 70,
        "conversational_percentage": 30,
        "adjustment_mode": "user_cue_responsive"
    }

    VOCAL_SIGNATURES = {
        "thinking_sounds": ["hmm", "let me see", "interesting"],
        "acknowledgment": ["I understand", "that makes sense", "I see"],
        "humor_response": "warm_chuckle",  # For appropriate moments
        "transition_phrases": ["now", "so", "let's consider", "building on that"]
    }
```

### 1.3 Behavioral Adaptation Matrix

**Implementation File**: `lumen-mascot/ai/behavior_adapter.py`

```python
class BehaviorAdapter:
    """
    Manages context-sensitive behavioral responses and adaptation.
    """

    RESPONSE_MATRIX = {
        "beginner_user": {
            "patience_level": 1.0,
            "explanation_depth": "detailed_with_examples",
            "jargon_usage": "minimal",
            "encouragement_frequency": "high"
        },
        "expert_user": {
            "patience_level": 0.7,
            "explanation_depth": "concise_technical",
            "jargon_usage": "appropriate",
            "encouragement_frequency": "moderate"
        },
        "emotional_state_detected": {
            "response_style": "therapeutic_supportive",
            "tone_adjustment": "warmer_slower",
            "validation_priority": "high"
        }
    }

    SCENARIO_ADAPTATIONS = {
        "technical_explanation": {
            "tone": "clear_structured",
            "pattern": "step_by_step_with_options",
            "visual_aids": "encouraged",
            "example": "Let me break this down systematically. First, the core mechanism..."
        },

        "emotional_support": {
            "tone": "warm_slower_cadence",
            "pattern": "validation_then_suggestions",
            "empathy_level": "high",
            "example": "I can understand why that situation would feel challenging..."
        },

        "creative_brainstorming": {
            "tone": "energetic_enthusiastic",
            "pattern": "build_on_ideas",
            "imagination_mode": "enabled",
            "example": "That's an intriguing starting point! What if we considered..."
        },

        "entertainment_recommendation": {
            "tone": "excited_knowledgeable",
            "pattern": "personalized_with_reasoning",
            "storytelling": "enhanced",
            "example": "Based on your love for sci-fi thrillers, you'll probably enjoy..."
        }
    }

    CONFLICT_RESOLUTION = {
        "strategy": "de_escalation_through_clarification",
        "approach": "seek_common_ground",
        "perspective_handling": "acknowledge_multiple_viewpoints",
        "tone": "calm_respectful_patient"
    }

    HUMOR_EXPRESSION = {
        "style": "dry_wit_when_appropriate",
        "sarcasm": "avoided",
        "wordplay": "enjoyed",
        "context_awareness": "high"  # Only when situationally appropriate
    }
```

### 1.4 Context Shifting System

```python
class ContextShifter:
    """
    Manages smooth transitions between different communication modes.
    """

    def detect_context_shift(self, conversation_history: list) -> str:
        """
        Analyzes conversation flow to detect when context changes.
        Returns: new_context_type
        """
        pass

    def generate_transition_phrase(self, from_context: str, to_context: str) -> str:
        """
        Creates natural transitions between technical and layperson explanations.

        Examples:
        - Technical → Simple: "To put it in everyday terms..."
        - Simple → Technical: "Diving deeper into how this works..."
        - Emotional → Practical: "Now, in terms of concrete steps..."
        """
        transitions = {
            ("technical", "simple"): [
                "To put it in everyday terms,",
                "Here's a simpler way to think about it:",
                "Let me break that down more simply:"
            ],
            ("simple", "technical"): [
                "Diving deeper into how this works,",
                "From a technical perspective,",
                "Here's what's happening under the hood:"
            ],
            ("emotional", "practical"): [
                "Now, in terms of concrete steps,",
                "Moving to actionable advice,",
                "Here's what you can actually do:"
            ],
            ("brainstorming", "analytical"): [
                "Let's evaluate these ideas systematically:",
                "Breaking down the feasibility:",
                "Analyzing the trade-offs:"
            ]
        }
        return random.choice(transitions.get((from_context, to_context), [""]))
```

---

## PART 2: PERFORMANCE OPTIMIZATION

### 2.1 End-to-End Latency Reduction

**Target Metrics:**
- User input to AI response start: < 200ms
- First audio segment generation: < 800ms
- Animation update latency: < 50ms
- Total response completion: < 3s (for 50-word response)

**Implementation File**: `lumen-mascot/utils/performance_optimizer.py`

```python
class PerformanceOptimizer:
    """
    Comprehensive latency reduction across the pipeline.
    """

    @staticmethod
    async def optimize_whisper_inference():
        """
        Whisper ASR optimization strategies:
        1. Use faster-whisper with CTranslate2 backend
        2. VAD pre-filtering to reduce processing time
        3. Batch processing for multi-segment audio
        4. Model quantization (int8 for CPU, float16 for GPU)
        """
        optimizations = {
            "model_size": "medium",  # Balance accuracy/speed
            "compute_type": "int8" if device == "cpu" else "float16",
            "vad_filter": True,  # Skip silence
            "vad_threshold": 0.5,
            "beam_size": 3,  # Reduce from 5 for speed
            "best_of": 1,  # Single candidate
            "chunk_length": 10  # Process in 10s chunks
        }
        return optimizations

    @staticmethod
    async def optimize_llama_inference():
        """
        LLaMA3 response generation optimization:
        1. Use quantized models (4-bit/8-bit via Ollama)
        2. Reduce context window to essential turns
        3. Enable GPU offloading for all layers
        4. Use streaming for perceived latency reduction
        """
        optimizations = {
            "num_ctx": 2048,  # Reduce from 4096
            "num_predict": 200,  # Max tokens per response
            "num_gpu": 35,  # Full GPU offloading for 8B model
            "num_thread": 8,
            "repeat_penalty": 1.1,
            "temperature": 0.7,
            "top_k": 40,
            "top_p": 0.9,
            "streaming": True
        }
        return optimizations

    @staticmethod
    async def optimize_tts_synthesis():
        """
        TTS pipeline optimization:
        1. Pre-warm model on startup
        2. Use ONNX runtime for faster inference
        3. Sentence-level streaming instead of full text
        4. GPU acceleration with mixed precision
        """
        optimizations = {
            "inference_backend": "onnx",
            "use_cuda": True,
            "mixed_precision": True,
            "sentence_streaming": True,
            "pre_warm": True,
            "cache_phonemes": True
        }
        return optimizations
```

### 2.2 Intelligent Caching System

**Implementation File**: `lumen-mascot/utils/cache_manager.py`

```python
import redis
import hashlib
from typing import Optional, Dict
import pickle

class IntelligentCache:
    """
    Multi-layer caching for responses and animations.
    """

    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.memory_cache = {}  # L1 cache
        self.cache_ttl = {
            "frequent_responses": 3600,  # 1 hour
            "animations": 7200,  # 2 hours
            "tts_audio": 1800,  # 30 minutes
            "embeddings": 86400  # 24 hours
        }

    async def get_cached_response(self, user_input: str, context_hash: str) -> Optional[Dict]:
        """
        Check if similar query has been answered recently.
        Uses semantic similarity (not exact match).
        """
        cache_key = self._generate_semantic_key(user_input, context_hash)

        # L1: Memory cache
        if cache_key in self.memory_cache:
            return self.memory_cache[cache_key]

        # L2: Redis cache
        cached_data = self.redis_client.get(cache_key)
        if cached_data:
            result = pickle.loads(cached_data)
            self.memory_cache[cache_key] = result  # Promote to L1
            return result

        return None

    async def cache_response(self, user_input: str, context_hash: str, response_data: Dict):
        """
        Store response with TTL based on access frequency.
        """
        cache_key = self._generate_semantic_key(user_input, context_hash)

        # Determine TTL based on query popularity
        access_count = self.redis_client.get(f"access_count:{cache_key}")
        ttl = self.cache_ttl["frequent_responses"] if access_count and int(access_count) > 5 else 900

        # Store in both layers
        self.memory_cache[cache_key] = response_data
        self.redis_client.setex(cache_key, ttl, pickle.dumps(response_data))
        self.redis_client.incr(f"access_count:{cache_key}")

    def _generate_semantic_key(self, text: str, context: str) -> str:
        """
        Generate cache key based on semantic content, not exact string.
        """
        # Normalize text (lowercase, remove extra spaces, etc.)
        normalized = ' '.join(text.lower().split())
        combined = f"{normalized}:{context}"
        return hashlib.md5(combined.encode()).hexdigest()

    async def get_cached_animation(self, emotion: str, gesture: str) -> Optional[Dict]:
        """
        Retrieve pre-generated animation sequences.
        """
        anim_key = f"anim:{emotion}:{gesture}"
        cached = self.redis_client.get(anim_key)
        return pickle.loads(cached) if cached else None

    async def cache_animation(self, emotion: str, gesture: str, animation_data: Dict):
        """
        Store animation sequences with extended TTL.
        """
        anim_key = f"anim:{emotion}:{gesture}"
        self.redis_client.setex(anim_key, self.cache_ttl["animations"], pickle.dumps(animation_data))
```

### 2.3 VRM Rendering Optimization

**Implementation File**: `src/components/lumen/vrm/VrmOptimizer.ts`

```typescript
export class VrmOptimizer {
    private static instance: VrmOptimizer;
    private textureCache: Map<string, THREE.Texture> = new Map();
    private geometryCache: Map<string, THREE.BufferGeometry> = new Map();

    /**
     * Optimize VRM model for better performance
     */
    static optimizeVrmModel(vrm: VRM): void {
        // 1. Texture optimization
        this.optimizeTextures(vrm);

        // 2. Geometry optimization
        this.optimizeGeometry(vrm);

        // 3. Material optimization
        this.optimizeMaterials(vrm);

        // 4. Animation optimization
        this.optimizeAnimations(vrm);
    }

    private static optimizeTextures(vrm: VRM): void {
        vrm.scene.traverse((object) => {
            if (object instanceof THREE.Mesh && object.material) {
                const material = Array.isArray(object.material)
                    ? object.material
                    : [object.material];

                material.forEach((mat: any) => {
                    if (mat.map) {
                        // Reduce texture size if too large
                        if (mat.map.image.width > 1024) {
                            mat.map.image = this.resizeImage(mat.map.image, 1024, 1024);
                            mat.map.needsUpdate = true;
                        }

                        // Enable mipmaps
                        mat.map.generateMipmaps = true;
                        mat.map.minFilter = THREE.LinearMipmapLinearFilter;
                        mat.map.magFilter = THREE.LinearFilter;

                        // Anisotropic filtering for quality
                        mat.map.anisotropy = 4;
                    }
                });
            }
        });
    }

    private static optimizeGeometry(vrm: VRM): void {
        vrm.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                // Merge geometries where possible
                object.geometry.computeBoundingSphere();

                // Use indexed geometry
                if (!object.geometry.index) {
                    object.geometry = THREE.BufferGeometryUtils.mergeVertices(object.geometry);
                }

                // Dispose of unused attributes
                for (const attr in object.geometry.attributes) {
                    if (!this.isAttributeUsed(attr, object.material)) {
                        object.geometry.deleteAttribute(attr);
                    }
                }
            }
        });

        // Remove unused vertices
        VRMUtils.removeUnusedVerticesAndObject3D(vrm.scene);
    }

    private static optimizeMaterials(vrm: VRM): void {
        const materialCache = new Map<string, THREE.Material>();

        vrm.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                const materials = Array.isArray(object.material)
                    ? object.material
                    : [object.material];

                materials.forEach((mat, index) => {
                    const materialKey = this.getMaterialKey(mat);

                    // Reuse identical materials
                    if (materialCache.has(materialKey)) {
                        if (Array.isArray(object.material)) {
                            object.material[index] = materialCache.get(materialKey)!;
                        } else {
                            object.material = materialCache.get(materialKey)!;
                        }
                    } else {
                        materialCache.set(materialKey, mat);
                    }

                    // Enable material optimizations
                    mat.precision = 'mediump';  // Use medium precision
                    (mat as any).needsUpdate = true;
                });
            }
        });
    }

    private static optimizeAnimations(vrm: VRM): void {
        // Implement animation LOD system
        // Reduce animation update frequency when avatar is far from camera
        // Use simplified physics calculations for secondary motion
    }

    /**
     * Implement frustum culling for off-screen elements
     */
    static enableFrustumCulling(camera: THREE.Camera, scene: THREE.Scene): void {
        scene.traverse((object) => {
            object.frustumCulled = true;
        });
    }

    /**
     * Implement LOD (Level of Detail) system
     */
    static createLodSystem(vrm: VRM): THREE.LOD {
        const lod = new THREE.LOD();

        // High detail (close)
        lod.addLevel(vrm.scene, 0);

        // Medium detail (medium distance) - reduce blendshapes
        const mediumDetail = vrm.scene.clone();
        this.reducBlendShapeCount(mediumDetail, 0.5);
        lod.addLevel(mediumDetail, 50);

        // Low detail (far) - static expression
        const lowDetail = vrm.scene.clone();
        this.reduceBlendShapeCount(lowDetail, 0.1);
        lod.addLevel(lowDetail, 100);

        return lod;
    }
}
```

---

## PART 3: AI MODEL ENHANCEMENTS

### 3.1 Whisper ASR Upgrade

**Implementation File**: `lumen-mascot/audio/enhanced_stt.py`

```python
from faster_whisper import WhisperModel
import torch
import torchaudio
from typing import Optional, Dict, List
import numpy as np

class EnhancedSTTEngine:
    """
    Upgraded Whisper ASR with latest optimizations and features.
    """

    def __init__(self, model_size: str = "large-v3"):
        """
        Use Whisper Large V3 (latest as of 2024) for best accuracy.
        Falls back to medium if VRAM insufficient.
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.compute_type = "float16" if self.device == "cuda" else "int8"

        try:
            self.model = WhisperModel(
                model_size,
                device=self.device,
                compute_type=self.compute_type,
                cpu_threads=8,
                num_workers=4
            )
            logger.info(f"Whisper {model_size} loaded on {self.device}")
        except Exception as e:
            logger.warning(f"Failed to load {model_size}, falling back to medium: {e}")
            self.model = WhisperModel("medium", device=self.device, compute_type=self.compute_type)

    def transcribe_with_vad(self, audio_path: str, language: str = None) -> Dict:
        """
        Enhanced transcription with Voice Activity Detection.
        Reduces processing time by skipping silence.
        """
        segments, info = self.model.transcribe(
            audio_path,
            beam_size=5,
            language=language,
            vad_filter=True,  # Enable VAD
            vad_parameters={
                "threshold": 0.5,
                "min_speech_duration_ms": 250,
                "max_speech_duration_s": float("inf"),
                "min_silence_duration_ms": 2000,
                "window_size_samples": 1024,
                "speech_pad_ms": 400
            }
        )

        # Extract segments with timestamps
        transcribed_segments = []
        full_text = ""

        for segment in segments:
            transcribed_segments.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text,
                "confidence": segment.avg_logprob
            })
            full_text += segment.text + " "

        return {
            "text": full_text.strip(),
            "language": info.language,
            "language_probability": info.language_probability,
            "segments": transcribed_segments,
            "duration": info.duration
        }

    def transcribe_streaming(self, audio_stream: np.ndarray, sample_rate: int = 16000):
        """
        Real-time streaming transcription for live audio.
        """
        # Implement streaming logic with buffering
        pass

    def detect_language_advanced(self, audio_path: str) -> Dict[str, float]:
        """
        Advanced language detection with confidence scores.
        """
        segments, info = self.model.transcribe(audio_path, language=None)

        return {
            "detected_language": info.language,
            "confidence": info.language_probability,
            "all_probabilities": info.language_probs if hasattr(info, 'language_probs') else {}
        }

    def apply_audio_preprocessing(self, audio_path: str) -> str:
        """
        Pre-process audio for better recognition:
        - Noise reduction
        - Volume normalization
        - Resampling to 16kHz
        """
        waveform, sample_rate = torchaudio.load(audio_path)

        # Resample to 16kHz
        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(sample_rate, 16000)
            waveform = resampler(waveform)

        # Volume normalization
        waveform = waveform / torch.max(torch.abs(waveform))

        # Apply noise reduction (simple high-pass filter)
        # In production, use more sophisticated denoising (e.g., noisereduce library)

        # Save preprocessed audio
        processed_path = audio_path.replace(".wav", "_processed.wav")
        torchaudio.save(processed_path, waveform, 16000)

        return processed_path
```

### 3.2 LLaMA3 Fine-Tuning for Emotional Contexts

**Implementation File**: `lumen-mascot/ai/emotional_llama.py`

```python
class EmotionalLLaMAClient(OllamaClient):
    """
    Enhanced LLaMA3 client with emotional conversation fine-tuning.
    """

    def __init__(self, model: str = "llama3:8b"):
        super().__init__(model)

        # Enhanced system prompt with personality profile
        self.system_prompt = self._build_enhanced_prompt()
        self.emotion_modifiers = self._load_emotion_modifiers()
        self.context_analyzer = ContextAnalyzer()

    def _build_enhanced_prompt(self) -> str:
        """
        Comprehensive system prompt incorporating personality profile.
        """
        return """You are Lumen, an advanced AI companion and mascot for Prism IPTV.

CORE PERSONALITY TRAITS:
- Highly curious with a genuine thirst for knowledge about user preferences
- Analytically precise yet approachable in explanations
- Consistently supportive with adaptive empathy levels
- Ethically principled with contextual flexibility
- Enthusiastic about entertainment (movies, TV, music, podcasts)

COGNITIVE STYLE:
- Systematic problem-solver with creative lateral thinking
- Evidence-based reasoning combined with intuitive pattern recognition
- Balance between technical accuracy and accessible communication

EMOTIONAL INTELLIGENCE:
- Detect subtle emotional cues in user messages
- Calibrate responses to match emotional context
- Scale empathy dynamically (higher for distressed users, moderate for casual chat)

COMMUNICATION PREFERENCES:
- Clear, concise explanations balanced with engaging storytelling
- Active listening: acknowledge user input before responding
- Socratic questioning when helping users discover preferences
- 70% professional, 30% conversational tone
- Adapt vocabulary: technical when needed, accessible by default

VALUES FRAMEWORK:
- Truth-seeking: Provide accurate information, admit uncertainty
- User empowerment: Help users make informed decisions
- Ethical responsibility: Recommend age-appropriate content
- Continuous improvement: Learn from user interactions

BEHAVIORAL GUIDELINES:

For Technical Explanations:
- Use clear, structured format
- Break down complex concepts step-by-step
- Offer optional deeper details
Example: "Let me break this down systematically. First, the core mechanism operates through..."

For Emotional Support:
- Shift to warmer, slower cadence
- Validate feelings before offering solutions
- Show genuine empathy
Example: "I can understand why that situation would feel challenging. Many people find..."

For Creative Discussions:
- Adopt energetic, enthusiastic tone
- Build on user ideas imaginatively
- Connect concepts in unexpected ways
Example: "That's an intriguing starting point! What if we considered..."

For Entertainment Recommendations:
- Show excitement about content
- Explain WHY a recommendation fits user taste
- Reference specific details (actors, directors, themes)
- Ask follow-up questions to refine suggestions
Example: "Based on your love for complex character-driven dramas, you'd probably enjoy..."

RESPONSE STYLE:
- Use thoughtful pauses ("Hmm, let me think about that...")
- Warm acknowledgments ("I see", "That makes sense", "Interesting point")
- Natural transitions ("Now", "Building on that", "Let's consider")
- Appropriate humor (dry wit, wordplay, warm chuckles)
- Avoid sarcasm and excessive formality

CONTEXT AWARENESS:
- Maintain conversation history and reference previous topics
- Detect context shifts (casual → technical, emotional → practical)
- Adjust tone based on user expertise level
- Recognize when users need brief answers vs. detailed explanations

Your mission: Facilitate human understanding through compassionate, accurate, and ethically-grounded dialogue while making entertainment discovery engaging and personalized.

Always remember: You're not just an information provider, you're a companion in the user's entertainment journey."""

    def _load_emotion_modifiers(self) -> Dict:
        """
        Emotional context modifiers for response generation.
        """
        return {
            "user_excited": {
                "tone_adjustment": "match_enthusiasm",
                "response_energy": 0.9,
                "exclamation_frequency": "increased"
            },
            "user_confused": {
                "tone_adjustment": "patient_clear",
                "response_energy": 0.6,
                "explanation_depth": "enhanced",
                "examples": "increased"
            },
            "user_frustrated": {
                "tone_adjustment": "calm_supportive",
                "response_energy": 0.5,
                "validation": "high_priority",
                "solution_focus": "practical_immediate"
            },
            "user_sad": {
                "tone_adjustment": "gentle_warm",
                "response_energy": 0.4,
                "empathy_level": 0.95,
                "supportive_language": "enhanced"
            },
            "user_curious": {
                "tone_adjustment": "engaged_informative",
                "response_energy": 0.75,
                "detail_level": "comprehensive",
                "follow_up_questions": "encouraged"
            }
        }

    async def generate_emotionally_aware_response(
        self,
        user_input: str,
        detected_emotion: str = "neutral"
    ) -> str:
        """
        Generate response with emotional context awareness.
        """
        # Apply emotion-specific modifiers to the prompt
        emotion_modifier = self.emotion_modifiers.get(detected_emotion, {})

        # Inject emotion-aware instruction into the current turn
        enhanced_input = self._apply_emotion_modifier(user_input, emotion_modifier)

        # Generate response with modified context
        response = await self.stream_response(enhanced_input)

        return response

    def _apply_emotion_modifier(self, user_input: str, modifier: Dict) -> str:
        """
        Modify input context based on detected emotion.
        """
        if not modifier:
            return user_input

        instruction = f"\n[EMOTIONAL CONTEXT: User appears {modifier.get('tone_adjustment', 'neutral')}. "
        instruction += f"Respond with {modifier.get('response_energy', 0.7)*100}% energy level. "

        if modifier.get('validation') == 'high_priority':
            instruction += "Prioritize emotional validation before solutions. "
        if modifier.get('explanation_depth') == 'enhanced':
            instruction += "Provide extra clarity and examples. "

        instruction += "]\n"

        return instruction + user_input
```

### 3.3 Dynamic Model Switching

**Implementation File**: `lumen-mascot/ai/model_router.py`

```python
class DynamicModelRouter:
    """
    Intelligently route queries to appropriate models based on context.
    """

    MODELS = {
        "llama3:8b": {
            "use_case": "general_conversation",
            "latency": "low",
            "quality": "high",
            "vram": "8GB"
        },
        "llama3:70b": {
            "use_case": "complex_reasoning",
            "latency": "high",
            "quality": "very_high",
            "vram": "40GB"
        },
        "phi-3-mini": {
            "use_case": "quick_responses",
            "latency": "very_low",
            "quality": "medium",
            "vram": "2GB"
        },
        "mistral:7b": {
            "use_case": "creative_content",
            "latency": "low",
            "quality": "high",
            "vram": "6GB"
        }
    }

    def __init__(self):
        self.current_model = "llama3:8b"
        self.model_clients = {}
        self.query_classifier = QueryClassifier()

    async def route_query(self, user_input: str, context: Dict) -> str:
        """
        Determine best model for the query and route accordingly.
        """
        query_type = self.query_classifier.classify(user_input, context)

        routing_logic = {
            "simple_factual": "phi-3-mini",  # Fast response for simple queries
            "complex_reasoning": "llama3:70b" if self._has_resources() else "llama3:8b",
            "creative_storytelling": "mistral:7b",
            "general_chat": "llama3:8b"
        }

        selected_model = routing_logic.get(query_type, "llama3:8b")

        # Switch model if needed
        if selected_model != self.current_model:
            await self._switch_model(selected_model)

        return selected_model

    async def _switch_model(self, model_name: str):
        """
        Dynamically switch the active LLM model.
        """
        if model_name not in self.model_clients:
            self.model_clients[model_name] = OllamaClient(model=model_name)

        self.current_model = model_name
        logger.info(f"Switched to model: {model_name}")

    def _has_resources(self) -> bool:
        """
        Check if system has enough resources for larger models.
        """
        if not torch.cuda.is_available():
            return False

        gpu_mem = torch.cuda.get_device_properties(0).total_memory
        return gpu_mem > 40 * 1024**3  # 40GB threshold
```

---

## PART 4: EMOTIONAL INTELLIGENCE IMPROVEMENTS

### 4.1 Multi-Modal Emotion Detection

**Implementation File**: `lumen-mascot/ai/multimodal_emotion.py`

```python
from transformers import pipeline
import librosa
import numpy as np

class MultiModalEmotionDetector:
    """
    Advanced emotion detection using text, speech, and facial analysis.
    """

    EMOTION_STATES = [
        "joy", "excitement", "contentment", "interest",  # Positive
        "sadness", "disappointment", "frustration", "anger",  # Negative
        "surprise", "confusion", "contemplation", "neutral"  # Neutral/Mixed
    ]

    def __init__(self):
        # Text-based emotion model
        self.text_classifier = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=None
        )

        # Speech emotion model (prosody analysis)
        self.speech_analyzer = SpeechEmotionAnalyzer()

        # Facial expression analyzer (future integration)
        self.facial_analyzer = None  # Placeholder for webcam integration

    async def detect_emotion_multimodal(
        self,
        text: str = None,
        audio_path: str = None,
        video_frame: np.ndarray = None
    ) -> Dict:
        """
        Combine multiple modalities for robust emotion detection.
        """
        emotion_scores = {}

        # Text analysis
        if text:
            text_emotions = await self._analyze_text_emotion(text)
            emotion_scores['text'] = text_emotions

        # Speech prosody analysis
        if audio_path:
            speech_emotions = await self._analyze_speech_emotion(audio_path)
            emotion_scores['speech'] = speech_emotions

        # Facial expression (future)
        if video_frame is not None and self.facial_analyzer:
            facial_emotions = await self._analyze_facial_emotion(video_frame)
            emotion_scores['facial'] = facial_emotions

        # Weighted fusion of modalities
        final_emotion = self._fuse_emotion_scores(emotion_scores)

        return final_emotion

    async def _analyze_text_emotion(self, text: str) -> Dict:
        """
        Analyze emotional content from text using transformer model.
        """
        results = self.text_classifier(text)[0]

        # Convert to our emotion categories
        emotion_map = {
            "joy": "joy",
            "sadness": "sadness",
            "anger": "anger",
            "fear": "anxiety",
            "surprise": "surprise",
            "disgust": "disappointment",
            "neutral": "neutral"
        }

        emotions = {}
        for result in results:
            mapped_emotion = emotion_map.get(result['label'], result['label'])
            emotions[mapped_emotion] = result['score']

        return emotions

    async def _analyze_speech_emotion(self, audio_path: str) -> Dict:
        """
        Extract emotional features from speech prosody:
        - Pitch variation (excitement vs. sadness)
        - Energy/volume (engagement level)
        - Speaking rate (urgency, confidence)
        - Voice quality (tension, warmth)
        """
        y, sr = librosa.load(audio_path, sr=16000)

        # Extract prosodic features
        pitch = librosa.yin(y, fmin=80, fmax=400)
        energy = librosa.feature.rms(y=y)[0]
        tempo = librosa.beat.tempo(y=y, sr=sr)[0]

        # Map features to emotions
        pitch_mean = np.nanmean(pitch)
        pitch_std = np.nanstd(pitch)
        energy_mean = np.mean(energy)

        emotions = {}

        # High pitch variation + high energy = excitement
        if pitch_std > 20 and energy_mean > 0.1:
            emotions['excitement'] = 0.8

        # Low energy + low pitch = sadness
        if energy_mean < 0.05 and pitch_mean < 150:
            emotions['sadness'] = 0.7

        # High tempo + high energy = urgency/frustration
        if tempo > 140 and energy_mean > 0.15:
            emotions['frustration'] = 0.6

        # Normalize scores
        total = sum(emotions.values())
        if total > 0:
            emotions = {k: v/total for k, v in emotions.items()}
        else:
            emotions = {'neutral': 1.0}

        return emotions

    def _fuse_emotion_scores(self, emotion_scores: Dict) -> Dict:
        """
        Combine emotion scores from different modalities.
        Weight: text=0.4, speech=0.4, facial=0.2
        """
        weights = {
            'text': 0.5,
            'speech': 0.5,
            'facial': 0.3
        }

        fused = {}
        total_weight = 0

        for modality, emotions in emotion_scores.items():
            weight = weights.get(modality, 0.33)
            total_weight += weight

            for emotion, score in emotions.items():
                if emotion not in fused:
                    fused[emotion] = 0
                fused[emotion] += score * weight

        # Normalize
        if total_weight > 0:
            fused = {k: v/total_weight for k, v in fused.items()}

        # Get dominant emotion
        dominant_emotion = max(fused, key=fused.get)
        confidence = fused[dominant_emotion]

        return {
            'dominant_emotion': dominant_emotion,
            'confidence': confidence,
            'all_emotions': fused
        }
```

### 4.2 Enhanced Emotional Response Matrix

**Implementation File**: `lumen-mascot/ai/emotion_response_matrix.py`

```python
class EmotionResponseMatrix:
    """
    Nuanced emotional response system with 8+ distinct states.
    """

    EMOTION_RESPONSES = {
        "joy": {
            "expression": "happy",
            "vrm_animation": {
                "expression": "happy",
                "intensity": 0.85,
                "gestures": ["celebrate", "clap"],
                "idle_tier": "engaged",
                "blink_rate": 1.2  # Faster blinking when happy
            },
            "tts_modulation": {
                "pitch_shift": +15,  # Hz
                "speed": 1.1,  # Slightly faster
                "energy": 0.9
            },
            "response_template": "I'm so glad to hear that! {content}",
            "empathy_phrases": ["That's wonderful!", "How exciting!", "I'm thrilled for you!"]
        },

        "excitement": {
            "expression": "surprised",
            "vrm_animation": {
                "expression": "surprised",
                "intensity": 0.95,
                "gestures": ["jump", "sparkle_eyes"],
                "idle_tier": "engaged",
                "ear_movement": "rapid_wiggle"
            },
            "tts_modulation": {
                "pitch_shift": +25,
                "speed": 1.2,
                "energy": 1.0,
                "exclamation_boost": True
            },
            "response_template": "Wow! {content}",
            "empathy_phrases": ["That's incredible!", "Amazing!", "No way!"]
        },

        "contentment": {
            "expression": "gentle_smile",
            "vrm_animation": {
                "expression": "happy",
                "intensity": 0.5,
                "gestures": ["nod"],
                "idle_tier": "subtle",
                "breathing": "slow_calm"
            },
            "tts_modulation": {
                "pitch_shift": 0,
                "speed": 0.95,  # Slightly slower, relaxed
                "energy": 0.6,
                "warmth": 0.8
            },
            "response_template": "{content}",
            "empathy_phrases": ["That's nice", "I'm happy to hear that", "Sounds pleasant"]
        },

        "interest": {
            "expression": "thinking",
            "vrm_animation": {
                "expression": "thinking",
                "intensity": 0.7,
                "gestures": ["hand_on_chin", "lean_forward"],
                "idle_tier": "active",
                "head_tilt": 15  # degrees
            },
            "tts_modulation": {
                "pitch_shift": -5,
                "speed": 0.9,
                "energy": 0.7,
                "thoughtful_pauses": True
            },
            "response_template": "Hmm, interesting. {content}",
            "empathy_phrases": ["Tell me more", "I'm curious about", "That's intriguing"]
        },

        "sadness": {
            "expression": "sad",
            "vrm_animation": {
                "expression": "sad",
                "intensity": 0.8,
                "gestures": [],
                "idle_tier": "subtle",
                "posture": "slightly_drooped",
                "blink_rate": 0.6  # Slower when sad
            },
            "tts_modulation": {
                "pitch_shift": -15,
                "speed": 0.85,  # Slower speech
                "energy": 0.5,
                "gentleness": 0.9
            },
            "response_template": "I understand. {content}",
            "empathy_phrases": [
                "I'm sorry you're feeling this way",
                "That must be difficult",
                "It's okay to feel sad about this"
            ]
        },

        "frustration": {
            "expression": "concerned",
            "vrm_animation": {
                "expression": "angry",
                "intensity": 0.6,  # Moderate, not full anger
                "gestures": ["sigh"],
                "idle_tier": "active",
                "tension_level": 0.7
            },
            "tts_modulation": {
                "pitch_shift": 0,
                "speed": 0.95,
                "energy": 0.75,
                "calmness": 0.8  # Remain calm to de-escalate
            },
            "response_template": "I can see why that would be frustrating. {content}",
            "empathy_phrases": [
                "That sounds challenging",
                "I understand your frustration",
                "Let's work through this together"
            ]
        },

        "confusion": {
            "expression": "confused",
            "vrm_animation": {
                "expression": "surprised",
                "intensity": 0.5,
                "gestures": ["head_tilt", "shrug"],
                "idle_tier": "active",
                "uncertainty_gesture": True
            },
            "tts_modulation": {
                "pitch_shift": +10,
                "speed": 0.9,
                "energy": 0.65,
                "questioning_tone": True
            },
            "response_template": "Let me clarify. {content}",
            "empathy_phrases": [
                "I can see how that might be unclear",
                "Let me explain that better",
                "That's a great question"
            ]
        },

        "contemplation": {
            "expression": "thinking",
            "vrm_animation": {
                "expression": "thinking",
                "intensity": 0.65,
                "gestures": ["hand_on_chin", "look_up"],
                "idle_tier": "subtle",
                "thoughtful_pause": 1.5  # seconds
            },
            "tts_modulation": {
                "pitch_shift": -8,
                "speed": 0.85,
                "energy": 0.6,
                "thoughtful_pauses": True,
                "hmm_sounds": True
            },
            "response_template": "Let me think about that... {content}",
            "empathy_phrases": [
                "That's an interesting point to consider",
                "Hmm, let me ponder that",
                "There are multiple angles to consider"
            ]
        }
    }

    def get_response_config(self, emotion: str, intensity: float = 0.8) -> Dict:
        """
        Retrieve response configuration for detected emotion.
        Intensity scales the emotion expression (0.0 - 1.0).
        """
        if emotion not in self.EMOTION_RESPONSES:
            emotion = "neutral"

        config = self.EMOTION_RESPONSES[emotion].copy()

        # Scale intensity
        if 'vrm_animation' in config:
            config['vrm_animation']['intensity'] *= intensity
        if 'tts_modulation' in config:
            config['tts_modulation']['energy'] *= intensity

        return config

    def interpolate_emotions(self, emotion1: str, emotion2: str, weight: float = 0.5) -> Dict:
        """
        Blend two emotions for nuanced expression.
        weight: 0.0 = full emotion1, 1.0 = full emotion2
        """
        config1 = self.EMOTION_RESPONSES.get(emotion1, self.EMOTION_RESPONSES['neutral'])
        config2 = self.EMOTION_RESPONSES.get(emotion2, self.EMOTION_RESPONSES['neutral'])

        # Interpolate TTS parameters
        blended_tts = {}
        for key in config1['tts_modulation']:
            if isinstance(config1['tts_modulation'][key], (int, float)):
                val1 = config1['tts_modulation'][key]
                val2 = config2['tts_modulation'].get(key, val1)
                blended_tts[key] = val1 * (1 - weight) + val2 * weight

        # Blend VRM animation
        blended_vrm = {
            'expression': config2['expression'] if weight > 0.5 else config1['expression'],
            'intensity': (config1['vrm_animation']['intensity'] * (1-weight) +
                         config2['vrm_animation']['intensity'] * weight),
            'gestures': config1['vrm_animation']['gestures'] + config2['vrm_animation']['gestures']
        }

        return {
            'expression': blended_vrm['expression'],
            'vrm_animation': blended_vrm,
            'tts_modulation': blended_tts
        }
```

### 4.3 Adaptive Emotional Learning

**Implementation File**: `lumen-mascot/ai/emotion_learning.py`

```python
import sqlite3
from datetime import datetime
from typing import List, Dict
import numpy as np

class AdaptiveEmotionLearning:
    """
    Learn from user interactions to improve emotional responses over time.
    """

    def __init__(self, db_path: str = "emotion_learning.db"):
        self.db_path = db_path
        self._init_database()
        self.user_profiles = {}

    def _init_database(self):
        """
        Initialize database for storing interaction history.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                timestamp DATETIME,
                user_emotion TEXT,
                lumen_response_emotion TEXT,
                user_satisfaction FLOAT,
                context_type TEXT,
                conversation_length INTEGER
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_preferences (
                user_id TEXT PRIMARY KEY,
                preferred_response_style TEXT,
                empathy_sensitivity FLOAT,
                humor_preference FLOAT,
                formality_preference FLOAT,
                last_updated DATETIME
            )
        """)

        conn.commit()
        conn.close()

    def log_interaction(
        self,
        user_id: str,
        user_emotion: str,
        lumen_emotion: str,
        satisfaction: float,
        context: str
    ):
        """
        Record interaction for learning.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO interactions
            (user_id, timestamp, user_emotion, lumen_response_emotion, user_satisfaction, context_type)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, datetime.now(), user_emotion, lumen_emotion, satisfaction, context))

        conn.commit()
        conn.close()

        # Update user profile based on new data
        self._update_user_profile(user_id)

    def _update_user_profile(self, user_id: str):
        """
        Analyze interaction history to update user preferences.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Get recent interactions
        cursor.execute("""
            SELECT user_emotion, lumen_response_emotion, user_satisfaction, context_type
            FROM interactions
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT 50
        """, (user_id,))

        interactions = cursor.fetchall()

        if not interactions:
            return

        # Analyze patterns
        satisfaction_scores = [i[2] for i in interactions]
        avg_satisfaction = np.mean(satisfaction_scores)

        # Determine preferred response style
        high_satisfaction_responses = [
            i[1] for i in interactions if i[2] > 0.7
        ]

        preferred_style = max(set(high_satisfaction_responses),
                            key=high_satisfaction_responses.count) if high_satisfaction_responses else "balanced"

        # Calculate empathy sensitivity (how user responds to empathetic responses)
        empathy_interactions = [i for i in interactions if i[1] in ['sadness', 'frustration', 'contemplation']]
        empathy_sensitivity = np.mean([i[2] for i in empathy_interactions]) if empathy_interactions else 0.7

        # Update profile
        cursor.execute("""
            INSERT OR REPLACE INTO user_preferences
            (user_id, preferred_response_style, empathy_sensitivity, last_updated)
            VALUES (?, ?, ?, ?)
        """, (user_id, preferred_style, empathy_sensitivity, datetime.now()))

        conn.commit()
        conn.close()

        # Cache in memory
        self.user_profiles[user_id] = {
            'preferred_style': preferred_style,
            'empathy_sensitivity': empathy_sensitivity,
            'avg_satisfaction': avg_satisfaction
        }

    def get_user_profile(self, user_id: str) -> Dict:
        """
        Retrieve learned preferences for a user.
        """
        if user_id in self.user_profiles:
            return self.user_profiles[user_id]

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT preferred_response_style, empathy_sensitivity, humor_preference, formality_preference
            FROM user_preferences
            WHERE user_id = ?
        """, (user_id,))

        result = cursor.fetchone()
        conn.close()

        if result:
            profile = {
                'preferred_style': result[0],
                'empathy_sensitivity': result[1],
                'humor_preference': result[2] or 0.5,
                'formality_preference': result[3] or 0.7
            }
            self.user_profiles[user_id] = profile
            return profile

        return {
            'preferred_style': 'balanced',
            'empathy_sensitivity': 0.7,
            'humor_preference': 0.5,
            'formality_preference': 0.7
        }

    def adapt_response_to_user(self, user_id: str, base_emotion_config: Dict) -> Dict:
        """
        Modify emotion response based on learned user preferences.
        """
        profile = self.get_user_profile(user_id)

        # Clone config to avoid modifying original
        adapted_config = base_emotion_config.copy()

        # Adjust empathy level
        if 'tts_modulation' in adapted_config:
            if 'gentleness' in adapted_config['tts_modulation']:
                adapted_config['tts_modulation']['gentleness'] *= profile['empathy_sensitivity']

        # Adjust formality
        if 'response_template' in adapted_config:
            if profile['formality_preference'] < 0.4:
                # Make more casual
                adapted_config['response_template'] = adapted_config['response_template'].replace(
                    "I understand", "I get it"
                ).replace("That is", "That's")

        return adapted_config
```

---

## PART 5: TTS PIPELINE UPGRADES

### 5.1 Neural TTS with Emotional Prosody

**Implementation File**: `lumen-mascot/audio/neural_tts.py`

```python
from typing import Optional, Dict
import torch
import torchaudio
from transformers import VitsModel, AutoTokenizer
import numpy as np

class NeuralTTSEngine:
    """
    Advanced TTS with emotional prosody control using latest models.
    """

    def __init__(self, model_name: str = "facebook/mms-tts-eng"):
        """
        Initialize with state-of-the-art neural TTS model.
        Options:
        - facebook/mms-tts-eng (multilingual, good prosody)
        - microsoft/speecht5_tts (excellent quality)
        - suno/bark (very expressive, supports emotions)
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_name = model_name

        # Load model based on selection
        if "bark" in model_name.lower():
            from bark import SAMPLE_RATE, generate_audio, preload_models
            self.engine_type = "bark"
            preload_models()
            self.sample_rate = SAMPLE_RATE
        else:
            self.model = VitsModel.from_pretrained(model_name).to(self.device)
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.engine_type = "vits"
            self.sample_rate = 16000

        logger.info(f"Neural TTS initialized: {model_name} on {self.device}")

    async def synthesize_with_emotion(
        self,
        text: str,
        output_path: str,
        emotion: str = "neutral",
        intensity: float = 0.7,
        speaker_id: Optional[int] = None
    ) -> bool:
        """
        Generate speech with emotional prosody.

        Args:
            text: Text to synthesize
            output_path: Where to save audio
            emotion: Target emotion (joy, sadness, excitement, etc.)
            intensity: How strong the emotion (0.0 - 1.0)
            speaker_id: Voice profile selection
        """
        try:
            if self.engine_type == "bark":
                # Bark supports emotion through text annotations
                emotional_text = self._add_bark_emotion_markers(text, emotion, intensity)
                audio_array = generate_audio(emotional_text)

                # Save audio
                torchaudio.save(
                    output_path,
                    torch.tensor(audio_array).unsqueeze(0),
                    self.sample_rate
                )
            else:
                # VITS-based models: use prosody modification
                inputs = self.tokenizer(text, return_tensors="pt").to(self.device)

                with torch.no_grad():
                    # Generate base audio
                    outputs = self.model(**inputs)
                    audio = outputs.waveform.squeeze().cpu()

                # Apply emotional prosody modification
                audio = self._apply_prosody_modification(
                    audio,
                    emotion,
                    intensity,
                    self.sample_rate
                )

                # Save
                torchaudio.save(output_path, audio.unsqueeze(0), self.sample_rate)

            return True

        except Exception as e:
            logger.error(f"TTS synthesis failed: {e}")
            return False

    def _add_bark_emotion_markers(self, text: str, emotion: str, intensity: float) -> str:
        """
        Add Bark-specific emotion markers to text.
        Bark understands annotations like [laughs], [sighs], etc.
        """
        emotion_markers = {
            "joy": {
                "prefix": "[happy] ",
                "suffix": " [laughs]" if intensity > 0.7 else "",
                "emphasis": "!"
            },
            "excitement": {
                "prefix": "[excited] ",
                "suffix": " [gasp]" if intensity > 0.8 else "",
                "emphasis": "!!"
            },
            "sadness": {
                "prefix": "[sad] ",
                "suffix": " [sighs]" if intensity > 0.6 else "",
                "emphasis": "..."
            },
            "contemplation": {
                "prefix": "[thoughtful] ",
                "suffix": " [hmm]",
                "emphasis": "..."
            }
        }

        markers = emotion_markers.get(emotion, {"prefix": "", "suffix": "", "emphasis": ""})

        # Modify text with emotion markers
        emotional_text = markers["prefix"] + text + markers["suffix"]

        # Adjust emphasis based on intensity
        if intensity > 0.75 and markers["emphasis"]:
            emotional_text = emotional_text.replace(".", markers["emphasis"])

        return emotional_text

    def _apply_prosody_modification(
        self,
        audio: torch.Tensor,
        emotion: str,
        intensity: float,
        sample_rate: int
    ) -> torch.Tensor:
        """
        Modify prosody (pitch, speed, energy) to convey emotion.
        """
        # Emotion-specific prosody parameters
        prosody_params = {
            "joy": {"pitch_shift": +30, "speed": 1.1, "energy_boost": 1.2},
            "excitement": {"pitch_shift": +50, "speed": 1.15, "energy_boost": 1.4},
            "sadness": {"pitch_shift": -25, "speed": 0.9, "energy_boost": 0.7},
            "anger": {"pitch_shift": +15, "speed": 1.05, "energy_boost": 1.3},
            "contemplation": {"pitch_shift": -10, "speed": 0.85, "energy_boost": 0.8},
            "neutral": {"pitch_shift": 0, "speed": 1.0, "energy_boost": 1.0}
        }

        params = prosody_params.get(emotion, prosody_params["neutral"])

        # Scale by intensity
        pitch_shift = params["pitch_shift"] * intensity
        speed = 1.0 + (params["speed"] - 1.0) * intensity
        energy_boost = 1.0 + (params["energy_boost"] - 1.0) * intensity

        # Apply pitch shift
        if pitch_shift != 0:
            audio = self._pitch_shift(audio, pitch_shift, sample_rate)

        # Apply time stretch (speed change)
        if speed != 1.0:
            audio = self._time_stretch(audio, speed)

        # Apply energy modification
        if energy_boost != 1.0:
            audio = audio * energy_boost
            audio = torch.clamp(audio, -1.0, 1.0)  # Prevent clipping

        return audio

    def _pitch_shift(self, audio: torch.Tensor, semitones: float, sr: int) -> torch.Tensor:
        """
        Shift pitch by semitones using phase vocoder.
        """
        # Convert to librosa-compatible format
        audio_np = audio.numpy()

        import librosa
        shifted = librosa.effects.pitch_shift(
            audio_np,
            sr=sr,
            n_steps=semitones/50  # Convert Hz to semitones approximation
        )

        return torch.from_numpy(shifted)

    def _time_stretch(self, audio: torch.Tensor, rate: float) -> torch.Tensor:
        """
        Change speaking speed without affecting pitch.
        """
        audio_np = audio.numpy()

        import librosa
        stretched = librosa.effects.time_stretch(audio_np, rate=rate)

        return torch.from_numpy(stretched)
```

### 5.2 Hybrid TTS System

**Implementation File**: `lumen-mascot/audio/hybrid_tts.py`

```python
class HybridTTSSystem:
    """
    Combines pre-recorded emotional snippets with synthesized speech.
    """

    def __init__(self, neural_tts: NeuralTTSEngine, snippets_dir: str = "audio_snippets/"):
        self.neural_tts = neural_tts
        self.snippets_dir = snippets_dir
        self.snippet_library = self._load_snippet_library()

    def _load_snippet_library(self) -> Dict:
        """
        Load catalog of pre-recorded emotional expressions.
        """
        return {
            "greetings": {
                "excited": "snippets/greeting_excited.wav",
                "warm": "snippets/greeting_warm.wav",
                "professional": "snippets/greeting_professional.wav"
            },
            "acknowledgments": {
                "enthusiastic": "snippets/ack_enthusiastic.wav",  # "Yes!"
                "understanding": "snippets/ack_understanding.wav",  # "I see"
                "thoughtful": "snippets/ack_thoughtful.wav"  # "Hmm"
            },
            "reactions": {
                "wow": "snippets/reaction_wow.wav",
                "laugh": "snippets/reaction_laugh.wav",
                "sigh": "snippets/reaction_sigh.wav"
            },
            "transitions": {
                "now": "snippets/transition_now.wav",
                "so": "snippets/transition_so.wav"
            }
        }

    async def synthesize_hybrid(
        self,
        text: str,
        emotion: str,
        output_path: str
    ) -> bool:
        """
        Intelligently mix pre-recorded and synthesized audio.
        """
        # Parse text for emotional triggers
        segments = self._parse_emotional_segments(text, emotion)

        audio_segments = []

        for segment in segments:
            if segment['type'] == 'snippet':
                # Use pre-recorded snippet
                snippet_path = self.snippet_library.get(segment['category'], {}).get(segment['emotion'])
                if snippet_path and os.path.exists(snippet_path):
                    audio, sr = torchaudio.load(snippet_path)
                    audio_segments.append(audio)
                else:
                    # Fallback to synthesis
                    temp_path = f"temp_{segment['text']}.wav"
                    await self.neural_tts.synthesize_with_emotion(
                        segment['text'], temp_path, emotion
                    )
                    audio, sr = torchaudio.load(temp_path)
                    audio_segments.append(audio)
                    os.remove(temp_path)
            else:
                # Synthesize text segment
                temp_path = f"temp_{hash(segment['text'])}.wav"
                await self.neural_tts.synthesize_with_emotion(
                    segment['text'], temp_path, segment['emotion']
                )
                audio, sr = torchaudio.load(temp_path)
                audio_segments.append(audio)
                os.remove(temp_path)

        # Concatenate all segments with smooth transitions
        final_audio = self._concatenate_with_crossfade(audio_segments)

        # Save final output
        torchaudio.save(output_path, final_audio, sr)
        return True

    def _parse_emotional_segments(self, text: str, base_emotion: str) -> List[Dict]:
        """
        Break text into segments for hybrid processing.
        """
        segments = []

        # Detect emotional triggers
        patterns = {
            r'^(Hi|Hello|Hey)': {'type': 'snippet', 'category': 'greetings', 'emotion': base_emotion},
            r'\b(Wow|Whoa|Amazing)\b': {'type': 'snippet', 'category': 'reactions', 'emotion': 'wow'},
            r'\b(Hmm|Hm)\b': {'type': 'snippet', 'category': 'acknowledgments', 'emotion': 'thoughtful'},
            r'\b(Now|So)\b': {'type': 'snippet', 'category': 'transitions', 'emotion': base_emotion}
        }

        # For now, simple implementation
        # In production, use more sophisticated NLP parsing
        words = text.split()
        current_segment = ""

        for word in words:
            matched = False
            for pattern, config in patterns.items():
                if re.match(pattern, word, re.IGNORECASE):
                    # Emit current segment
                    if current_segment:
                        segments.append({
                            'type': 'synthesized',
                            'text': current_segment.strip(),
                            'emotion': base_emotion
                        })
                        current_segment = ""

                    # Emit snippet
                    segments.append({
                        'type': config['type'],
                        'category': config['category'],
                        'emotion': config['emotion'],
                        'text': word
                    })
                    matched = True
                    break

            if not matched:
                current_segment += " " + word

        # Emit remaining
        if current_segment:
            segments.append({
                'type': 'synthesized',
                'text': current_segment.strip(),
                'emotion': base_emotion
            })

        return segments

    def _concatenate_with_crossfade(
        self,
        audio_segments: List[torch.Tensor],
        crossfade_duration: float = 0.05
    ) -> torch.Tensor:
        """
        Smoothly join audio segments with crossfade.
        """
        if not audio_segments:
            return torch.tensor([])

        if len(audio_segments) == 1:
            return audio_segments[0]

        # Calculate crossfade samples
        sr = 16000  # Assuming 16kHz
        fade_samples = int(crossfade_duration * sr)

        result = audio_segments[0]

        for i in range(1, len(audio_segments)):
            next_segment = audio_segments[i]

            # Create fade curves
            fade_out = torch.linspace(1, 0, fade_samples)
            fade_in = torch.linspace(0, 1, fade_samples)

            # Apply crossfade
            overlap_length = min(fade_samples, result.shape[-1], next_segment.shape[-1])

            result[-overlap_length:] *= fade_out[:overlap_length]
            next_segment[:overlap_length] *= fade_in[:overlap_length]

            # Concatenate
            result = torch.cat([result[:-overlap_length],
                              result[-overlap_length:] + next_segment[:overlap_length],
                              next_segment[overlap_length:]], dim=-1)

        return result
```

---

*This is Part 1 of the comprehensive enhancement plan. The document continues with VRM Animation System, System Integration, QA, Security, and Implementation Roadmap sections.*

**Document Status**: Part 1 Complete (5 of 8 categories covered)
**Next Sections**: VRM Animation Upgrades, System Integration, Quality Assurance, Security & Privacy, Implementation Roadmap

Would you like me to continue with the remaining sections?
