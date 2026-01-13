/**
 * Centralized Audio Service for Prism IPTV
 * Manages AudioContext, DynamicsCompressor (Normalization), and Analyser.
 */

class AudioService {
  private context: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private initialized = false;

  private init() {
    if (this.initialized) return;
    
    const AudioContextClass = globalThis.AudioContext || (globalThis as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.context = new AudioContextClass();
    this.compressor = this.context.createDynamicsCompressor();
    this.analyser = this.context.createAnalyser();

    // Set up Compressor for "Normalization"
    // Rules:
    // - threshold: point where compression kicks in
    // - knee: smoothness of transition
    // - ratio: how much to squash (higher = more leveling)
    // - attack/release: speed of reaction
    this.compressor.threshold.setValueAtTime(-24, this.context.currentTime);
    this.compressor.knee.setValueAtTime(30, this.context.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.context.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.context.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.context.currentTime);

    this.analyser.fftSize = 256;

    // Chain: Compressor -> Analyser -> Destination
    this.compressor.connect(this.analyser);
    this.analyser.connect(this.context.destination);

    this.initialized = true;
  }

  public getContext() {
    this.init();
    return this.context;
  }

  public getAnalyser() {
    this.init();
    return this.analyser;
  }

  public connectSource(videoElement: HTMLVideoElement) {
    this.init();
    if (!this.context || !this.compressor) return null;

    try {
      const source = this.context.createMediaElementSource(videoElement);
      source.connect(this.compressor);
      return source;
    } catch (e) {
      console.warn("AudioService: Source already connected or Context Error", e);
      return null;
    }
  }

  public resume() {
    if (this.context?.state === 'suspended') {
      this.context.resume();
    }
  }
}

export const audioService = new AudioService();
