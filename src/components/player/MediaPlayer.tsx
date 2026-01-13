import React, { useRef, useMemo } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { VideoPlayer } from './VideoPlayer';
import { AudioVisualizer } from './AudioVisualizer';
import { PlayerControls } from './PlayerControls';
import styles from './MediaPlayer.module.css';
import { CinemaVoidScene } from './CinemaVoidScene';

import { NeonScrubber } from './NeonScrubber';
import { GesturalGlyph } from './GesturalGlyph';

export const MediaPlayer: React.FC = () => {
  const { mode } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // We determine if we are in a mode that needs visualizer
  const isAudioOnly = false; // Placeholder for isAudioOnly, as its definition was not provided in the instruction.
  const isVisualizerMode = useMemo(() => {
    return mode === 'audio' || mode === 'favorites' || isAudioOnly || false;
  }, [mode, isAudioOnly]);

  const { isPlaying, play, pause, toggleMute } = usePlayerStore();

  // Keyboard accessibility
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch(e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlaying) pause();
          else play();
          break;
        case 'KeyM':
          toggleMute();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, play, pause, toggleMute]);

  return (
    <div className={styles.playerContainer}>
      <CinemaVoidScene videoRef={videoRef}>

        <NeonScrubber />
        
        <GesturalGlyph position={[-1.5, -2.5, 0]} />
        <GesturalGlyph position={[1.5, -2.5, 0]} />
      </CinemaVoidScene>

      <div className={styles.screen}>
        <div className={styles.videoLayer}>
           <VideoPlayer ref={videoRef} />
        </div>
        
        {isVisualizerMode && (
          <div className={styles.visualizerLayer}>
            <AudioVisualizer videoRef={videoRef} />
          </div>
        )}
      </div>
      
      {/* Overlay Controls */}
      <PlayerControls />
    </div>
  );
};
