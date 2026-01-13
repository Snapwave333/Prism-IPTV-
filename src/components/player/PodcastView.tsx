import React, { useState } from 'react';
import { PodcastService, type Podcast, type Episode } from '../../services/podcast';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useFavoritesStore } from '../../stores/useFavoritesStore';
import { Search, Play, ArrowLeft, Heart } from 'lucide-react';
import styles from './PodcastView.module.css';
import { clsx } from 'clsx';

import { ContentFilter } from '../../services/contentFilter';

export const PodcastView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { setUrl, url: currentUrl } = usePlayerStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    const results = await PodcastService.search(searchTerm);
    // Apply Content Filter to podcasts
    const filtered = ContentFilter.filterItems(results, (p) => [p.title, p.artist]);
    setPodcasts(filtered);
    setIsLoading(false);
    setSelectedPodcast(null);
  };

  const handlePodcastSelect = async (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setIsLoading(true);
    const eps = await PodcastService.getEpisodes(podcast.feedUrl);
    // Apply Content Filter to episodes
    const filteredEps = ContentFilter.filterItems(eps, (e) => [e.title, e.description || '']);
    setEpisodes(filteredEps);
    setIsLoading(false);
  };

  const handleEpisodePlay = (episode: Episode) => {
    setUrl(episode.url);
  };

  const handleBack = () => {
    setSelectedPodcast(null);
    setEpisodes([]);
  };

  const toggleFavorite = (e: React.MouseEvent, podcast: Podcast) => {
    e.stopPropagation();
    const id = podcast.id; 
    if (isFavorite(id)) {
      removeFavorite(id);
    } else {
      addFavorite({
        id,
        type: 'podcast',
        title: podcast.title,
        subtitle: podcast.artist,
        artwork: podcast.artwork,
        url: podcast.feedUrl, // Store feedUrl for Podcasts
      });
    }
  };

  const toggleFavoriteFromDetail = (podcast: Podcast) => {
    const id = podcast.id;
    if (isFavorite(id)) {
      removeFavorite(id);
    } else {
      addFavorite({
        id,
        type: 'podcast',
        title: podcast.title,
        subtitle: podcast.artist,
        artwork: podcast.artwork,
        url: podcast.feedUrl,
      });
    }
  };

  return (
    <div className={styles.container}>
      {/* Search Header */}
      {!selectedPodcast && (
        <div className={styles.searchHeader}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              type="text" 
              placeholder="Search podcasts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </form>
        </div>
      )}

      {/* Loading State */}
      {isLoading && <div className={styles.loading}>Loading...</div>}

      {/* Podcast Grid */}
      {!selectedPodcast && !isLoading && (
        <div className={styles.grid}>
          {podcasts.map(podcast => {
            const isFav = isFavorite(podcast.id);
            return (
              <div 
                key={podcast.id} 
                className={styles.card}
              >
                <button
                  className={styles.primaryAction}
                  onClick={() => handlePodcastSelect(podcast)}
                  aria-label={`Select podcast ${podcast.title}`}
                />
                 <button 
                  className={clsx(styles.favBtn, isFav && styles.favActive)}
                  onClick={(e) => toggleFavorite(e, podcast)}
                  aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                </button>

                <img src={podcast.artwork} alt={podcast.title} className={styles.artwork} />
                <div className={styles.title}>{podcast.title}</div>
                <div className={styles.artist}>{podcast.artist}</div>
              </div>
            );
          })}
          {podcasts.length === 0 && !isLoading && searchTerm && (
            <div className={styles.empty}>No results found</div>
          )}
        </div>
      )}

      {/* Episode List */}
      {selectedPodcast && !isLoading && (
        <div className={styles.detailView}>
          <button onClick={handleBack} className={styles.backBtn}>
            <ArrowLeft size={20} /> Back to Search
          </button>
          
          <div className={styles.podcastHeader}>
            <img src={selectedPodcast.artwork} alt={selectedPodcast.title} className={styles.headerArtwork} />
            <div className={styles.headerInfo}>
              <h2 className={styles.headerTitle}>{selectedPodcast.title}</h2>
              <p className={styles.headerArtist}>{selectedPodcast.artist}</p>
              <button 
                className={styles.headerFavBtn}
                onClick={() => toggleFavoriteFromDetail(selectedPodcast)}
              >
                <Heart size={20} fill={isFavorite(selectedPodcast.id) ? "currentColor" : "none"} />
                {isFavorite(selectedPodcast.id) ? 'Favorited' : 'Add to Favorites'}
              </button>
            </div>
          </div>

          <div className={styles.episodeList}>
            {episodes.map(episode => (
              <div 
                key={episode.id} 
                className={clsx(styles.episodeItem, currentUrl === episode.url && styles.activeEpisode)}
                style={{ position: 'relative' }} // Ensure positioning for stretched link if CSS module update missed it
              >
                 <button
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    zIndex: 1
                  }}
                  onClick={() => handleEpisodePlay(episode)}
                  aria-label={`Play episode ${episode.title}`}
                />

                <div className={styles.playBtn}>
                  <Play size={16} fill={currentUrl === episode.url ? 'currentColor' : 'none'} />
                </div>
                <div className={styles.episodeInfo}>
                  <div className={styles.episodeTitle}>{episode.title}</div>
                  <div className={styles.episodeDate}>{new Date(episode.published).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
