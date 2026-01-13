import React, { useEffect, useState } from 'react';
import { X, Keyboard } from 'lucide-react';
import styles from './ShortcutHelp.module.css';

export const ShortcutHelp: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
          return;
        }
        setVisible((prev) => !prev);
      }
      if (e.key === 'Escape' && visible) {
        setVisible(false);
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  if (!visible) return null;

  return (
    <div 
      className={styles.overlay} 
      onClick={() => setVisible(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setVisible(false);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Close Keyboard Shortcuts"
    >
      <div 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Shortcuts List"
      >
        <div className={styles.header}>
          <div className={styles.title}>
            <Keyboard size={24} />
            <h2>Keyboard Shortcuts</h2>
          </div>
          <button className={styles.closeBtn} onClick={() => setVisible(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.grid}>
          <div className={styles.group}>
            <h3>Playback</h3>
            <div className={styles.row}>
              <kbd>Space</kbd> <span>Play / Pause</span>
            </div>
            <div className={styles.row}>
              <kbd>M</kbd> <span>Toggle Mute</span>
            </div>
            <div className={styles.row}>
              <kbd>F</kbd> <span>Toggle Fullscreen</span>
            </div>
            <div className={styles.row}>
              <kbd>↑</kbd> / <kbd>↓</kbd> <span>Volume Up / Down</span>
            </div>
          </div>

          <div className={styles.group}>
            <h3>Navigation</h3>
            <div className={styles.row}>
              <kbd>?</kbd> <span>Toggle this menu</span>
            </div>
            <div className={styles.row}>
              <kbd>Esc</kbd> <span>Close Modals / Sidebar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
