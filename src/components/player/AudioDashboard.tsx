import React, { useEffect, useState } from 'react';
import { Radio, Mic, Loader2, Search, X } from 'lucide-react';
import { type Channel } from '../../services/iptv';
import { AudioService } from '../../services/audioService';
import { usePlayerStore } from '../../stores/usePlayerStore';
import clsx from 'clsx';
import styles from './AudioDashboard.module.css';

interface AudioItemProps {
  item: Channel;
  isActive: boolean;
  onClick: () => void;
  isLoading?: boolean;
}

const AudioItem: React.FC<AudioItemProps> = ({ item, isActive, onClick, isLoading }) => (
  <div 
    className={clsx(styles.card, isActive && styles.cardActive)}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
  >
    <img 
      src={item.logo || 'https://via.placeholder.com/56?text=AUDIO'} 
      alt={item.name} 
      className={styles.cardImage}
      onError={(e) => {
        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/56?text=AUDIO';
      }}
    />
    <div className={styles.cardInfo}>
      <div className={styles.cardTitle}>{item.name}</div>
      <div className={styles.cardSubtitle}>{item.group || 'Unknown Genre'}</div>
    </div>
    {isLoading ? (
       <Loader2 className="text-accent animate-spin" size={16} />
    ) : isActive && (
      <div className={styles.playingIndicator}>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
      </div>
    )}
  </div>
);

export const AudioDashboard: React.FC = () => {
  const [radioStations, setRadioStations] = useState<Channel[]>([]);
  const [podcasts, setPodcasts] = useState<Channel[]>([]);
  const [loadingMedia, setLoadingMedia] = useState<string | null>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{radio: Channel[], podcasts: Channel[]}>({ radio: [], podcasts: [] });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { url: currentUrl, setUrl } = usePlayerStore();

  const CATEGORIES = [
    { id: 'music', label: 'Music', icon: null }, // Simple text for now or import icons if desired
    { id: 'news', label: 'News', icon: null },
    { id: 'talk', label: 'Talk', icon: null },
    { id: 'sports', label: 'Sports', icon: null },
    { id: 'jazz', label: 'Jazz', icon: null },
    { id: 'lofi', label: 'Lofi', icon: null },
  ];

  // Load Top Content on Mount
  useEffect(() => {
    const fetchTopData = async () => {
      try {
        const [topRadio, topPodcasts] = await Promise.all([
            AudioService.getTopRadioStations(50),
            AudioService.getTopPodcasts(50)
        ]);
        setRadioStations(topRadio);
        setPodcasts(topPodcasts);
      } catch (error) {
        console.error('Failed to load audio content:', error);
      }
    };
    fetchTopData();
  }, []);

  // Search Capability
  useEffect(() => {
    const performSearch = async () => {
        if (!searchQuery.trim()) {
            setIsSearching(false);
            setSearchResults({ radio: [], podcasts: [] });
            return;
        }

        setIsSearching(true);
        try {
            // Parallel search
            const [radioResults, podcastResults] = await Promise.all([
                AudioService.searchRadioStations(searchQuery, 20),
                AudioService.searchPodcasts(searchQuery, 20)
            ]);
            setSearchResults({ radio: radioResults, podcasts: podcastResults });
        } catch (e) {
            console.error("Search failed", e);
        }
    };

    // Debounce
    const timeoutId = setTimeout(performSearch, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleCategoryClick = (category: string) => {
      if (activeCategory === category) {
          setActiveCategory(null);
          setSearchQuery('');
      } else {
          setActiveCategory(category);
          setSearchQuery(category);
      }
  };

  const handlePodcastClick = async (podcast: Channel) => {
      if (currentUrl === podcast.url) return; 
      setLoadingMedia(podcast.url); 
      
      try {
          // If it's a search result from iTunes, the URL might be the Feed URL.
          // AudioService.getLatestEpisodeUrl handles ensuring we get an MP3.
          const episodeUrl = await AudioService.getLatestEpisodeUrl(podcast.url);
          if (episodeUrl) {
              setUrl(episodeUrl);
          } else {
             alert('No playable episode found.');
          }
      } catch (e) {
          console.error('Error resolving podcast', e);
      } finally {
          setLoadingMedia(null);
      }
  };

  // Determine what to display
  const displayRadio = isSearching ? searchResults.radio : radioStations;
  const displayPodcasts = isSearching ? searchResults.podcasts : podcasts;

  return (
    <div className={styles.dashboard}>
      {/* Controls Area */}
      <div className={styles.controls}>
        {/* Search Bar */}
        <div className={styles.searchBar}>
            <Search size={20} className={styles.searchIcon} />
            <input 
                className={styles.searchInput}
                type="text" 
                placeholder="Search radio & podcasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
             {searchQuery && (
                <button className={styles.clearBtn} onClick={() => { setSearchQuery(''); setActiveCategory(null); }}>
                  <X size={16} />
                </button>
              )}
        </div>

        {/* Chips */}
        <div className={styles.chips}>
            {CATEGORIES.map(cat => (
                <button 
                    key={cat.id}
                    className={clsx(styles.chip, activeCategory === cat.id && styles.chipActive)}
                    onClick={() => handleCategoryClick(cat.id)}
                >
                    {cat.label}
                </button>
            ))}
        </div>
      </div>

      {/* Radio Column */}
      <div className={styles.column}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Radio className={styles.titleIcon} size={24} />
            {isSearching ? `Radio Results` : 'Top Radio Stations'}
          </div>
        </div>
        <div className={styles.scrollArea}>
          {displayRadio.length === 0 && isSearching && <div className={styles.cardSubtitle}>No radio stations found.</div>}
          {displayRadio.map((station, idx) => (
            <AudioItem
              key={`${station.url}-${idx}`}
              item={station}
              isActive={currentUrl === station.url}
              onClick={() => setUrl(station.url)}
            />
          ))}
        </div>
      </div>

      {/* Podcast Column */}
      <div className={styles.column}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Mic className={styles.titleIcon} size={24} />
            {isSearching ? `Podcast Results` : 'Top Podcasts'}
          </div>
        </div>
        <div className={styles.scrollArea}>
          {displayPodcasts.length === 0 && isSearching && <div className={styles.cardSubtitle}>No podcasts found.</div>}
           {displayPodcasts.map((podcast, idx) => (
            <AudioItem
              key={`${podcast.url}-${idx}`}
              item={podcast}
              isActive={false} 
              isLoading={loadingMedia === podcast.url}
              onClick={() => handlePodcastClick(podcast)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
