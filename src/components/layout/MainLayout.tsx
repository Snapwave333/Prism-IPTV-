import React from 'react';
import { Sidebar } from './Sidebar';
import { useAppStore } from '../../stores/useAppStore';
import { Menu } from 'lucide-react';
import { MediaPlayer } from '../player/MediaPlayer';
import { Breadcrumbs } from './Breadcrumbs';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, rightPanel }) => {
  console.log('MainLayout: Render');
  const { toggleSidebar } = useAppStore();
  const [isSheetExpanded, setIsSheetExpanded] = React.useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar />
      
      <main className={styles.main}>
        <header className={styles.mobileHeader}>
          <button className={styles.menuBtn} onClick={() => toggleSidebar()}>
            <Menu size={24} />
          </button>
          <span className={styles.mobileTitle}>Prism</span>
        </header>

        <section className={styles.playerSection}>
          <div className={styles.playerContainer}>
            <MediaPlayer />
          </div>
          {rightPanel && (
            <div className={styles.sidePanel}>
              {rightPanel}
            </div>
          )}
        </section>
        
        <div 
          className={styles.contentSheet}
          style={{ top: isSheetExpanded ? '0' : undefined }}
        >
          <div 
            className={styles.sheetHandle} 
            onClick={() => setIsSheetExpanded(!isSheetExpanded)}
          />
          <div className={styles.scrollableContent}>
            <Breadcrumbs />
            <div className={styles.content}>
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

