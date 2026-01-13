import React, { useEffect, useState } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { RadioBrowser, type RadioStation } from '../../services/radio';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useFavoritesStore } from '../../stores/useFavoritesStore';
import { Radio as RadioIcon, Heart } from 'lucide-react';
import clsx from 'clsx';
import styles from './RadioGrid.module.css';

// Extracted card component to avoid inline definition lint issues
const RadioCard = ({ 
  station, 
  isActive, 
  isFav, 
  onSelect, 
  onToggleFav 
}: { 
  station: RadioStation; 
  isActive: boolean; 
  isFav: boolean; 
  onSelect: (s: RadioStation) => void; 
  onToggleFav: (e: React.MouseEvent, s: RadioStation) => void; 
}) => {
  return (
    <div 
      className={clsx(styles.card, isActive && styles.active)}
      onClick={() => onSelect(station)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if(e.key === 'Enter' || e.key === ' ') onSelect(station);
      }}
    >
      <div className={styles.cardHeader}>
         <button 
          className={clsx(styles.favBtn, isFav && styles.favActive)}
          onClick={(e) => onToggleFav(e, station)}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={16} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>

      <div className={styles.iconWrapper}>
        {station.favicon ? (
          <img 
            src={station.favicon} 
            alt={station.name} 
            className={styles.favicon}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement?.classList.add(styles.fallback);
            }} 
          />
        ) : (
          <RadioIcon size={32} className={styles.fallbackIcon} />
        )}
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{station.name}</div>
        <div className={styles.tags}>{station.tags}</div>
      </div>
    </div>
  );
};

import { ContentFilter } from '../../services/contentFilter';

export const RadioGrid: React.FC = () => {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setUrl, url: currentUrl } = usePlayerStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  useEffect(() => {
    const fetchStations = async () => {
      setIsLoading(true);
      const data = await RadioBrowser.getTopStations(100);
      
      // Apply Content Filter
      const filtered = ContentFilter.filterItems(data, (s) => [s.name, s.tags, s.country]);
      setStations(filtered);
      setIsLoading(false);
    };

    fetchStations();
  }, []);

  const handleStationSelect = (station: RadioStation) => {
    setUrl(station.url_resolved);
  };

  const toggleFavorite = (e: React.MouseEvent, station: RadioStation) => {
    e.stopPropagation();
    const id = station.url_resolved; 
    if (isFavorite(id)) {
      removeFavorite(id);
    } else {
      addFavorite({
        id,
        type: 'station',
        title: station.name,
        subtitle: station.tags,
        artwork: station.favicon,
        url: station.url_resolved,
      });
    }
  };

  if (isLoading) return <div className={styles.loading}>Loading Stations...</div>;

  return (
    <div className={styles.container}>
      <VirtuosoGrid
        style={{ height: '100%' }}
        totalCount={stations.length}
        listClassName={styles.gridList}
        itemClassName={styles.gridItemContainer}
        itemContent={(index) => {
          const station = stations[index];
          const isActive = currentUrl === station.url_resolved;
          const isFav = isFavorite(station.url_resolved);
          
          return (
            <RadioCard 
              station={station}
              isActive={isActive}
              isFav={isFav}
              onSelect={handleStationSelect}
              onToggleFav={toggleFavorite}
            />
          );
        }}
      />
    </div>
  );
};
