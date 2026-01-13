import React from 'react';
import styles from './SettingsView.module.css';
import { useSettingsStore } from '../../stores/useSettingsStore';

export const SettingsView: React.FC = () => {
  const [serverStatus, setServerStatus] = React.useState<{ status: string; ip?: string } | null>(null);

  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setServerStatus(data);
        }
      } catch (e) {
        setServerStatus({ status: 'offline' });
      }
    };
    checkStatus();
  }, []);

  const remoteUrl = serverStatus?.ip ? `http://${serverStatus.ip}:3000/remote` : '';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Settings</h1>
        <p>Manage your preferences and configuration</p>
      </header>
      
      <div className={styles.section}>
        <h2>Appearance</h2>
        <div className={styles.settingItem}>
          <label htmlFor="theme-select">Theme</label>
          <select id="theme-select" disabled className={styles.select}>
            <option>Cinematic Dark</option>
          </select>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Time & Region</h2>
        <div className={styles.settingItem}>
          <label htmlFor="timezone-select">Timezone</label>
          <select 
            id="timezone-select"
            className={styles.select}
            value={useSettingsStore((state) => state.timeZone)}
            onChange={(e) => useSettingsStore.getState().setTimeZone(e.target.value)}
          >
            {Intl.supportedValuesOf('timeZone').map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Mascot Settings</h2>
        <div className={styles.settingItem}>
            <label htmlFor="mascot-volume">Voice Volume</label>
            <input 
              type="range" 
              id="mascot-volume" 
              min="0" 
              max="1" 
              step="0.05"
              value={useSettingsStore((state) => state.mascotVolume)}
              onChange={(e) => useSettingsStore.getState().setMascotVolume(parseFloat(e.target.value))}
              className={styles.rangeInput}
            />
        </div>
        <div className={styles.settingItem}>
            <div className={styles.labelGroup}>
              <label htmlFor="mic-toggle">Microphone Access</label>
              <p className={styles.description}>Allow Lumen to listen to your voice</p>
            </div>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                id="mic-toggle"
                checked={useSettingsStore((state) => state.microphoneEnabled)}
                onChange={(e) => useSettingsStore.getState().setMicrophoneEnabled(e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Remote Control</h2>
        {serverStatus?.status === 'online' ? (
           <div className={styles.remoteActive}>
             <p className={styles.success}>● Service Online</p>
             <p className={styles.info}>Connect your device to: <strong>{remoteUrl}</strong></p>
             {/* QR Code Placeholder using API */}
             <div className={styles.qrCode}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(remoteUrl)}`} 
                  alt="Pairing QR Code" 
                />
             </div>
           </div>
        ) : (
           <div className={styles.remoteOffline}>
             <p className={styles.error}>● Service Offline</p>
             <p className={styles.info}>Ensure the local remote server is running.</p>
             <button className={styles.actionBtn}>Retry Connection</button>
           </div>
        )}
      </div>

      <div className={styles.section}>
        <h2>About</h2>
        <p>Prism IPTV v1.0.0</p>
      </div>
    </div>
  );
};
