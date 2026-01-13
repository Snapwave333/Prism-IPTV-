import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppMode = 'tv' | 'audio' | 'sports' | 'favorites' | 'anime' | 'settings' | 'brand' | 'epg';

interface AppState {
  mode: AppMode;
  sidebarOpen: boolean;
  collapsed: boolean;
  setMode: (mode: AppMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCollapsed: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      mode: 'tv',
      sidebarOpen: true,
      collapsed: false,
      setMode: (mode) => set({ mode }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
    }),
    {
      name: 'prism-app-storage',
    }
  )
);
