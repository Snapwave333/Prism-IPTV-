import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  mascotVolume: number; // 0 to 1
  setMascotVolume: (volume: number) => void;
  microphoneEnabled: boolean;
  setMicrophoneEnabled: (enabled: boolean) => void;
  timeZone: string;
  setTimeZone: (timeZone: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      mascotVolume: 0.7, // Default volume
      setMascotVolume: (volume) => set({ mascotVolume: volume }),
      microphoneEnabled: true, // Default to true for ease of use, but user can disable
      setMicrophoneEnabled: (enabled) => set({ microphoneEnabled: enabled }),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      setTimeZone: (timeZone) => set({ timeZone }),
    }),
    {
      name: 'prism-settings-storage',
    }
  )
);
