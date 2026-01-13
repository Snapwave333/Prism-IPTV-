import { create } from 'zustand';

interface PlayerState {
  url: string | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  seekRequest: number | null;
  
  // Telemetry
  currentTime: number;
  duration: number;
  metadata: {
    title?: string;
    genre?: string;
  };

  // Actions
  handleTimeUpdate: (time: number) => void;
  handleDurationChange: (duration: number) => void;
  setMetadata: (metadata: { title?: string; genre?: string }) => void;
  
  setUrl: (url: string | null) => void;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  setIsMuted: (isMuted: boolean) => void;
  toggleMute: () => void;
  seekTo: (time: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  url: null,
  isPlaying: false,
  volume: 1,
  isMuted: true,
  
  seekRequest: null,
  
  // Telemetry
  currentTime: 0,
  duration: 0,
  metadata: {},

  handleTimeUpdate: (time: number) => set({ currentTime: time }),
  handleDurationChange: (duration: number) => set({ duration }),
  setMetadata: (metadata: { title?: string; genre?: string }) => set({ metadata }),

  setUrl: (url) => set({ url, isPlaying: true }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  setVolume: (volume) => set({ volume }),
  setIsMuted: (isMuted) => set({ isMuted }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  seekTo: (time) => set({ seekRequest: time + Math.random() }), // Add random to force update even if same time
}));
