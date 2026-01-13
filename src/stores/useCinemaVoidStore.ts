import { create } from 'zustand';

interface CinemaVoidState {
  accentColor: string; // The extracted color from the frame
  environmentIntensity: number;
  bloomIntensity: number;
  isCinemaMode: boolean;
  
  // Interaction states
  scrubberVerticalScale: number;
  gazeTarget: 'screen' | 'companion' | 'ui' | null;

  // Actions
  setAccentColor: (color: string) => void;
  setCinemaMode: (active: boolean) => void;
  setGazeTarget: (target: 'screen' | 'companion' | 'ui' | null) => void;
  updateVisuals: (intensity: number, bloom: number) => void;
}

export const useCinemaVoidStore = create<CinemaVoidState>((set) => ({
  accentColor: '#00FFFF', // Default cyan
  environmentIntensity: 0.5,
  bloomIntensity: 1.0,
  isCinemaMode: false,
  scrubberVerticalScale: 1.0,
  gazeTarget: 'screen',

  setAccentColor: (color) => set({ accentColor: color }),
  setCinemaMode: (active) => set({ isCinemaMode: active }),
  setGazeTarget: (target) => set({ gazeTarget: target }),
  updateVisuals: (intensity, bloom) => set({ environmentIntensity: intensity, bloomIntensity: bloom }),
}));
