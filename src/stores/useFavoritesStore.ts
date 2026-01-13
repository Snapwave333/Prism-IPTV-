import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteItem {
  id: string;
  type: 'channel' | 'station' | 'podcast' | 'episode';
  title: string;
  subtitle?: string; // Group, Artist, etc.
  artwork?: string;
  url: string;
  data?: any; // Extra metadata to restore state if needed
}

interface FavoritesState {
  items: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      addFavorite: (item) => set((state) => ({ 
        items: [...state.items, item] 
      })),
      removeFavorite: (id) => set((state) => ({ 
        items: state.items.filter((i) => i.id !== id) 
      })),
      isFavorite: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'prism-favorites',
    }
  )
);
