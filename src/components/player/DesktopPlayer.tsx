import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { ChannelList } from './ChannelList';
import { AudioDashboard } from './AudioDashboard';
import { FavoritesView } from './FavoritesView';
import { SettingsView } from '../settings/SettingsView';
import { TVGuide } from './TVGuide';
import { ShortcutHelp } from '../common/ShortcutHelp';

import { useAppStore } from '../../stores/useAppStore';

export const DesktopPlayer: React.FC = () => {
  const { mode } = useAppStore();
  console.log('DesktopPlayer: Render. Mode:', mode);

  const renderContent = () => {
    switch (mode) {
      case 'tv':
      case 'sports':
      case 'anime': // Handling anime case if needed
        return <ChannelList />;
      case 'audio':
        return <AudioDashboard />;
      case 'favorites':
        return <FavoritesView />;
      case 'epg':
        return <TVGuide />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ChannelList />;
    }
  };

  return (
    <MainLayout rightPanel={null}>
      {renderContent()}
      <ShortcutHelp />
    </MainLayout>
  );
};
