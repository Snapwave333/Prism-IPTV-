import React, { type KeyboardEvent } from 'react';
import { Tv, Mic, Trophy, Heart, X, Settings, Ghost, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore, type AppMode } from '../../stores/useAppStore';
import clsx from 'clsx';
import styles from './Sidebar.module.css';

const NAV_ITEMS: { id: AppMode; label: string; icon: React.ElementType }[] = [
  { id: 'epg', label: 'Guide', icon: Tv },
  { id: 'tv', label: 'Live TV', icon: Tv },
  { id: 'anime', label: 'Anime', icon: Ghost },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'audio', label: 'Radio & Podcasts', icon: Mic },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { mode, setMode, sidebarOpen, toggleSidebar, collapsed, toggleCollapsed } = useAppStore();

  const handleOverlayKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <button 
        className={clsx(styles.overlay, sidebarOpen && styles.overlayOpen)}
        onClick={() => toggleSidebar()}
        onKeyDown={handleOverlayKeyDown}
        aria-label="Close sidebar overlay"
      />

      <aside className={clsx(styles.sidebar, sidebarOpen && styles.sidebarOpen, collapsed && styles.collapsed)}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon} />
            <span className={styles.logoText}>PRISM</span>
          </div>
          <button className={styles.closeBtn} onClick={() => toggleSidebar()} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={clsx(styles.navItem, mode === id && styles.navItemActive)}
              onClick={() => {
                setMode(id);
                if (window.innerWidth < 768) {
                  toggleSidebar();
                }
              }}
              aria-label={`Switch to ${label}`}
              aria-current={mode === id ? 'page' : undefined}
            >
              <Icon size={20} />
              <span className={styles.navLabel}>{label}</span>
              {mode === id && <div className={styles.activeIndicator} />}
            </button>
          ))}

          <div className={styles.navSeparator} />
        </nav>

        <div className={styles.toggleContainer}>
           <button className={styles.toggleBtn} onClick={toggleCollapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
             {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
           </button>
        </div>
      </aside>
    </>
  );
};
