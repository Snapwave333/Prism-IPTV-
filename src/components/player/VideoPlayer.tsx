import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import Hls from 'hls.js';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { audioService } from '../../services/audio';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import styles from './VideoPlayer.module.css';
import { logger } from '../../utils/logger';

export const VideoPlayer = forwardRef<HTMLVideoElement>((_, ref) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { 
    url, isPlaying, volume, isMuted, seekRequest,
    handleTimeUpdate, handleDurationChange 
  } = usePlayerStore();

  useImperativeHandle(ref, () => internalVideoRef.current as HTMLVideoElement);

  useEffect(() => {
    const video = internalVideoRef.current;
    if (!video) return;

    // Reset previous HLS
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!url) return;

    const isM3U8 = url.includes('.m3u8') || url.includes('.m3u');

    if (Hls.isSupported() && isM3U8) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 0,
        startFragPrefetch: true,
        appendErrorMaxRetry: 3,
        liveSyncDurationCount: 3, // Target ~10s latency (assuming 3s segments)
        liveMaxLatencyDurationCount: 5, // Catch up if behind >15s
      });

      hls.loadSource(url);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        // Audio Initialization
        audioService.resume();
        audioService.connectSource(video);

        // Force 4K / Highest Resolution
        // Find level with highest height (preferring 2160p)
        if (data.levels && data.levels.length > 0) {
          let highestIndex = 0;
          let maxHeight = 0;
          
          data.levels.forEach((level, index) => {
            if (level.height > maxHeight) {
              maxHeight = level.height;
              highestIndex = index;
            }
          });

          logger.info(`Forcing highest quality: ${maxHeight}p (Index ${highestIndex})`);
          hls.currentLevel = highestIndex;
        }

        if (isPlaying) video.play().catch(() => {});
      });

      let recoverDecodingErrorDate: number | null = null;
      let recoverSwapAudioCodecDate: number | null = null;

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch(data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              logger.info("fatal network error encountered, try to recover");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR: {
              logger.info("fatal media error encountered, try to recover");
              const now = Date.now();
              if (!recoverDecodingErrorDate || (now - recoverDecodingErrorDate) > 3000) {
                recoverDecodingErrorDate = now;
                hls.recoverMediaError();
              } else if (!recoverSwapAudioCodecDate || (now - recoverSwapAudioCodecDate) > 3000) {
                recoverSwapAudioCodecDate = now;
                logger.warn("Attempting swapAudioCodec recovery");
                hls.swapAudioCodec();
                hls.recoverMediaError();
              } else {
                logger.error("Fatal error, cannot recover, destroying");
                hls.destroy();
                // Optional: Reload implementation could go here
              }
              break;
            }
            default:
              hls.destroy();
              break;
          }
        }
      });
      
    } else {
      // Native support (MP3, MP4, or Safari HLS)
      video.src = url;
      video.load();
      // Try to play if we should be playing
      if (isPlaying) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Auto-play might be blocked
          });
        }
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url, isPlaying]);

  useEffect(() => {
    const video = internalVideoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = internalVideoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted;
  }, [volume, isMuted]);

  // Handle Seek Request
  useEffect(() => {
    const video = internalVideoRef.current;
    if (!video || !seekRequest) return;
    
    // Logic: The store sends a number that represents (currentTime + delta + randomSalt). 
    // Wait, looking at MobileRemote.tsx or store, specifically how it's dispatched. 
    // If we assume the store is just passing a raw seek target or delta, we need clarity.
    // Given the previous conversation context, let's make it robust:
    // If the value is small (< 100), treat as delta. If large (timestamp), treat as absolute? 
    // Or just rely on the fact that existing MobileRemote sends -10 / 10.
    
    // Simplification: We will interpret the seekRequest as a DELTA if it's within sensible bounds (+/- 300s)
    // otherwise we might assume it's an absolute position (if the user implements a progress bar scrubber later).
    // For now, let's treat it as a delta as requested for "Remote" usage.
    
    const delta = Math.trunc(seekRequest); // Remove any decimal salt if present
    
    if (video.duration && Number.isFinite(video.duration)) {
      const newTime = Math.max(0, Math.min(video.currentTime + delta, video.duration));
      video.currentTime = newTime;
    } else {
       // Live stream or unknown duration
       video.currentTime += delta;
    }
  }, [seekRequest]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const video = internalVideoRef.current;
    if (!video) return;

    const handlePlaying = () => setIsLoading(false);
    const handleSeeking = () => setIsLoading(true);
    const handleSeeked = () => setIsLoading(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    
    // Telemetry Handlers
    const handleTimeSync = () => handleTimeUpdate(video.currentTime);
    const handleDurationSync = () => handleDurationChange(video.duration);

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('timeupdate', handleTimeSync);
    video.addEventListener('durationchange', handleDurationSync);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('timeupdate', handleTimeSync);
      video.removeEventListener('durationchange', handleDurationSync);
    };
  }, [handleTimeUpdate, handleDurationChange]);

  if (!url) return <div className={styles.placeholder}>Select a channel</div>;

  return (
    <div className={styles.container}>
      <div className={`${styles.loadingOverlay} ${isLoading ? styles.visible : ''}`}>
        <LoadingSpinner size="lg" />
      </div>
      <video 
        ref={internalVideoRef} 
        className={styles.video} 
        playsInline 
        crossOrigin="anonymous"
        aria-label="Video Player"
      >
        <track kind="captions" />
      </video>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';
