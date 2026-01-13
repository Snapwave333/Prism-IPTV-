import React, { useEffect, useMemo, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { type Channel, IPTVService } from '../../services/iptv';
import { normalizeCategory } from '../../utils/genreMapper';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useAppStore } from '../../stores/useAppStore';
import { useFavoritesStore } from '../../stores/useFavoritesStore';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Play, Heart, Search, X } from 'lucide-react';
import clsx from 'clsx';
import styles from './ChannelList.module.css';

// Default Playlist (IPTV-Org US)
const DEFAULT_PLAYLIST_URL = 'https://iptv-org.github.io/iptv/countries/us.m3u';

const SPORTS_KEYWORDS = ['sport', 'soccer', 'football', 'nba', 'nhl', 'espn', 'racing', 'league', 'beinsports', 'golf', 'tennis'];
const ANIME_KEYWORDS = ['anime', 'animation', 'cartoon', 'kids', 'toons', 'adult swim', 'disney', 'nick', 'cartoon network'];

export const ChannelList: React.FC = () => {
  console.log('ChannelList: Render start');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setUrl, url: currentUrl } = usePlayerStore();
  const { mode } = useAppStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  useEffect(() => {
    // Reset channels when mode changes to avoid mixing content or showing stale data
    setChannels([]);
    setError(null);

    const fetchChannels = async () => {
      try {
        setIsLoading(true);
        let channelsData: Channel[] = [];

        channelsData = await IPTVService.getChannels();

        if (channelsData.length === 0) {
           console.log('No channels in DB, syncing...');
           // Trigger initial sync
           let url = DEFAULT_PLAYLIST_URL;
           
           await IPTVService.syncChannels(url, mode);
           // Re-fetch
           channelsData = await IPTVService.getChannels();
        }

        console.log(`Channels loaded: ${channelsData.length}`);
        setChannels(channelsData);
        
        // Auto-play
        const { url: latestUrl, setUrl: latestSetUrl } = usePlayerStore.getState();
        if (channelsData.length > 0 && !latestUrl) {
          latestSetUrl(channelsData[0].url);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
    return () => {}; // Cleanup
  }, [mode]);

  // Define a union type for our flat list
  type ListItem = 
    | { type: 'header', title: string }
    | { type: 'channel', data: Channel };

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Derive unique categories for chips
  const categories = useMemo(() => {
    const groups = new Set<string>();
    channels.forEach(c => {
       const group = normalizeCategory(c.group || 'Uncategorized', mode);
       groups.add(group);
    });
    return Array.from(groups).sort();
  }, [channels, mode]);

  const flattenedList: ListItem[] = useMemo(() => {
    // 1. Filter based on mode
    let filtered = channels;
    if (mode === 'sports') {
      filtered = channels.filter((c: Channel) => {
        const name = c.name.toLowerCase();
        const group = (c.group || '').toLowerCase();
        return SPORTS_KEYWORDS.some(k => name.includes(k) || group.includes(k));
      });
    } else if (mode === 'anime') {
        filtered = channels.filter((c: Channel) => {
          const name = c.name.toLowerCase();
          const group = (c.group || '').toLowerCase();
          return ANIME_KEYWORDS.some(k => name.includes(k) || group.includes(k));
        });
    }

    // 1.5 Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) || 
        (c.group && c.group.toLowerCase().includes(query))
      );
    }
    
    // 1.6 Filter by Category Chip
    if (selectedCategory) {
      filtered = filtered.filter(c => {
        const group = normalizeCategory(c.group || 'Uncategorized', mode);
        return group === selectedCategory;
      });
    }

    // 2. Group by Category
    const grouped = filtered.reduce((acc: Record<string, Channel[]>, channel: Channel) => {
      // Normalize the group name using our new mapper
      const rawGroup = channel.group || 'Uncategorized';
      const groupName = normalizeCategory(rawGroup, mode);
      
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push({ ...channel, group: groupName }); // Update channel group for display
      return acc;
    }, {} as Record<string, Channel[]>);

    // 3. Sort Groups and Channels
    const sortedGroups = Object.keys(grouped).sort();
    
    const result: ListItem[] = [];
    
    sortedGroups.forEach((group: string) => {
      // Add Header only if NOT filtering by specific category (redundant if checking 1 category)
      if (!selectedCategory || sortedGroups.length > 1) {
          result.push({ type: 'header', title: group });
      }
      
      // Sort Channels within Group
      const sortedChannels = grouped[group].slice().sort((a: Channel, b: Channel) => a.name.localeCompare(b.name));
      
      // Add Channels
      sortedChannels.forEach((channel: Channel) => {
        result.push({ type: 'channel', data: channel });
      });
    });

    return result;
  }, [channels, mode, searchQuery, selectedCategory]);

  const handleChannelSelect = (channel: Channel) => {
    setUrl(channel.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent, channel: Channel) => {
      if (e.key === 'Enter' || e.key === ' ') {
          handleChannelSelect(channel);
      }
  };

  const toggleFavorite = (e: React.MouseEvent, channel: Channel) => {
    e.stopPropagation();
    const id = channel.url;
    if (isFavorite(id)) {
      removeFavorite(id);
    } else {
      addFavorite({
        id,
        type: 'channel',
        title: channel.name,
        subtitle: channel.group,
        artwork: channel.logo,
        url: channel.url,
      });
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner size="md" overlay />
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  // Not returning early for empty list to allow showing chips/search to clear filters
  
  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* Category Chips */}
        <div className="flex gap-2 mt-2 px-1 pb-2 overflow-x-auto scrollbar-hide">
          <button 
             className={clsx(
               "px-3 py-1 rounded-full font-medium text-xs whitespace-nowrap transition-colors",
               !selectedCategory ? "bg-cyan-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
             )}
             onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {categories.map(cat => (
             <button
               key={cat}
               className={clsx(
                 "px-3 py-1 rounded-full font-medium text-xs whitespace-nowrap transition-colors",
                 selectedCategory === cat ? "bg-cyan-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
               )}
               onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
             >
               {cat}
             </button>
          ))}
        </div>
      </div>
      
      {flattenedList.length === 0 ? (
          <div className={styles.error}>No channels found for this category.</div>
      ) : (
      <Virtuoso
        style={{ height: '100%' }}
        data={flattenedList}
        itemContent={(_, item: ListItem) => {
          if (item.type === 'header') {
             return <div className={styles.groupHeader}>{item.title}</div>;
          }

          const channel = item.data;
          const fav = isFavorite(channel.url);
          
          return (
            <div 
              className={clsx(
                styles.channelItem, 
                currentUrl === channel.url && styles.active
              )}
              onClick={() => handleChannelSelect(channel)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, channel)}
            >
              <div className={styles.logoPlaceholder}>
                {channel.logo ? (
                  <img src={channel.logo} alt={channel.name} loading="lazy" />
                ) : (
                  <span className={styles.initial}>{channel.name[0]}</span>
                )}
              </div>
              <div className={styles.info}>
                <div className={styles.name}>{channel.name}</div>
                <div className={styles.group}>{channel.group}</div>
              </div>
              
               <div className={styles.actions}>
                  <button 
                    className={clsx(styles.favBtn, fav && styles.favActive)}
                    onClick={(e) => toggleFavorite(e, channel)}
                    aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart size={18} fill={fav ? "currentColor" : "none"} />
                  </button>
                </div>
  
              {currentUrl === channel.url && <Play size={16} className={styles.playingIcon} />}
            </div>
          );
        }}
      />
      )}
    </div>
  );
};
