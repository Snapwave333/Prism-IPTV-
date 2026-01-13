import React, { useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown, Monitor, Power, FastForward, Rewind } from 'lucide-react';
import { remoteService } from '../../services/remote';
import clsx from 'clsx';
import styles from './MobileRemote.module.css';

export const MobileRemote: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'controls' | 'nav'>('controls');

  useEffect(() => {
    remoteService.connect();
    // In a real app, we'd listen for connection events, 
    // but for now we assume connection attempt initiates
    setIsConnected(true); 
  }, []);

  const send = (type: any, payload?: any) => {
    remoteService.send({ type, payload });
    // Add haptic feedback if available
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.status}>
          <div className={clsx(styles.indicator, isConnected && styles.online)} />
          <span>Prism Remote {isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
        <Power size={24} className={styles.powerIcon} onClick={() => window.close()} />
      </header>

      <div className={styles.mainControls}>
        <div className={styles.row}>
           <button className={styles.btn} onClick={() => send('VOLUME', 0)}><VolumeX /></button>
           <button className={styles.btn} onClick={() => send('VOLUME', 0.5)}><Volume2 /></button>
        </div>

        <button className={clsx(styles.playBtn, 'btn-glow')} onClick={() => send('PLAY')}>
          <Play size={48} fill="currentColor" />
        </button>
        
         <button className={clsx(styles.pauseBtn)} onClick={() => send('PAUSE')}>
          <Pause size={48} fill="currentColor" />
        </button>
        
        <div className={styles.row}>
           <button className={styles.btn} onClick={() => send('SEEK', -10)}><Rewind /></button>
           <button className={styles.btn} onClick={() => send('SEEK', 10)}><FastForward /></button>
        </div>
      </div>

       <div className={styles.navPad}>
          <button className={clsx(styles.padBtn, styles.up)} onClick={() => send('CHANNEL', 'up')}><ChevronUp size={32} /></button>
          <button className={clsx(styles.padBtn, styles.down)} onClick={() => send('CHANNEL', 'down')}><ChevronDown size={32} /></button>
          <button className={styles.padCenter} onClick={() => send('ENTER')}>OK</button>
       </div>

      <div className={styles.tabBar}>
        <button 
          className={clsx(styles.tab, activeTab === 'controls' && styles.activeTab)}
          onClick={() => setActiveTab('controls')}
        >
          <Monitor size={20} />
          Controls
        </button>
        {/* Placeholder for future tabs like "Channels" or "Keyboard" */}
      </div>
    </div>
  );
};
