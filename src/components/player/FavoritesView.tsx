import React from 'react';
import { useFavoritesStore } from '../../stores/useFavoritesStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { Trash2, Tv, Radio, Mic } from 'lucide-react';
import clsx from 'clsx';
import styles from './FavoritesView.module.css';

export const FavoritesView: React.FC = () => {
  const { items, removeFavorite } = useFavoritesStore();
  const { setUrl, url: currentUrl } = usePlayerStore();

  const handlePlay = (url: string) => {
    setUrl(url);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'channel': return <Tv size={16} />;
      case 'station': return <Radio size={16} />;
      case 'podcast': 
      case 'episode': return <Mic size={16} />;
      default: return <Tv size={16} />;
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <HeartBroken />
        </div>
        <h3>No Favorites Yet</h3>
        <p>Mark items as favorites to see them here.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Favorites</h2>
        <span className={styles.count}>{items.length} items</span>
      </div>

      <div className={styles.list}>
        {items.map((item) => (
          <div 
            key={item.id} 
            className={clsx(styles.item, currentUrl === item.url && styles.active)}
          >
            <button
              className={styles.primaryAction}
              onClick={() => handlePlay(item.url)}
              aria-label={`Play ${item.title}`}
            />
            <div className={styles.artwork}>
              {item.artwork ? (
                <img src={item.artwork} alt={item.title} />
              ) : (
                <div className={styles.placeholderArtwork}>
                  {getIcon(item.type)}
                </div>
              )}
            </div>
            
            <div className={styles.info}>
              <div className={styles.title}>{item.title}</div>
              <div className={styles.subtitle}>{item.subtitle}</div>
            </div>

            <div className={styles.actions}>
              <button 
                className={styles.removeBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(item.id);
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HeartBroken = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <line x1="3" y1="3" x2="21" y2="21" />
  </svg>
);
