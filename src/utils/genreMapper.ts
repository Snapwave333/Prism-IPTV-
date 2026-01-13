
import type { AppMode } from '../stores/useAppStore';

const GENRE_MAPPINGS: Record<string, string> = {
  // Movies & TV
  'action': 'Action & Adventure',
  'adventure': 'Action & Adventure',
  'comedy': 'Comedy',
  'drama': 'Drama',
  'sci-fi': 'Sci-Fi & Fantasy',
  'science fiction': 'Sci-Fi & Fantasy',
  'fantasy': 'Sci-Fi & Fantasy',
  'documentary': 'Documentary',
  'horror': 'Horror & Thriller',
  'thriller': 'Horror & Thriller',
  'suspense': 'Horror & Thriller',
  'romance': 'Romance',
  'family': 'Kids & Family',
  'kids': 'Kids & Family',
  'animation': 'Animation',
  'anime': 'Anime',
  
  // News & Info
  'news': 'News',
  'business': 'Business & Finance',
  'weather': 'News',
  'sports': 'Sports',
  'tech': 'Science & Tech',
  'technology': 'Science & Tech',
  'science': 'Science & Tech',
  
  // Music (Radio)
  'pop': 'Pop',
  'rock': 'Rock',
  'classic rock': 'Rock',
  'hard rock': 'Rock',
  'alternative': 'Alternative & Indie',
  'indie': 'Alternative & Indie',
  'jazz': 'Jazz & Blues',
  'blues': 'Jazz & Blues',
  'classical': 'Classical',
  'country': 'Country',
  'electronic': 'Electronic',
  'dance': 'Electronic',
  'hip-hop': 'Hip-Hop & R&B',
  'rap': 'Hip-Hop & R&B',
  'r&b': 'Hip-Hop & R&B',
  'talk': 'Talk Radio',
  'folk': 'Folk & Acoustic',
  
  // Anime Specific
  'shonen': 'Shonen',
  'seinen': 'Seinen',
  'shoujo': 'Shoujo',
  'mecha': 'Mecha',
  'isekai': 'Isekai',
  'slice of life': 'Slice of Life',
};

export function normalizeCategory(groupTitle: string | undefined, _mode: AppMode): string {
  if (!groupTitle) return 'Uncategorized';
  
  const normalized = groupTitle.toLowerCase().trim();
  
  // 1. Direct Mapping
  if (GENRE_MAPPINGS[normalized]) {
    return GENRE_MAPPINGS[normalized];
  }

  // 2. Keyword Matching (Partial)
  for (const [key, value] of Object.entries(GENRE_MAPPINGS)) {
    if (normalized.includes(key)) {
      return value;
    }
  }

  // Audio mode filtering could be added here if needed
  // if (mode === 'audio') {
  //    if (normalized.includes('news')) return 'News & Talk';
  //    if (normalized.includes('hits')) return 'Top Hits';
  // }

  // 4. Cleanup (Capitalize First Letter if no match)
  return groupTitle.charAt(0).toUpperCase() + groupTitle.slice(1);
}
