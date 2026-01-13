import { useState, useEffect } from 'react';
import { ContentFilter } from '../services/contentFilter';

export interface Channel {
  id: string;
  name: string;
  logo: string;
  category: string;
}

export interface Program {
  id: string;
  channelId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  category: string;
}

export interface EPGData {
  channels: Channel[];
  programs: Record<string, Program[]>;
}

export const useEPGRequest = () => {
  const [data, setData] = useState<EPGData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEPG = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/epg');
        if (!response.ok) throw new Error('Failed to fetch EPG');
        const json: EPGData = await response.json();
        
        // Filter Channels
        const filteredChannels = ContentFilter.filterItems(json.channels, (c) => [c.name || '', c.category || ''])
          .map(c => ({
            ...c,
            name: (c.name || 'Unknown Channel').replace(/Pluto TV/gi, 'Prism IPTV')
          }));
        const filteredChannelIds = new Set(filteredChannels.map(c => c.id));
        
        // Filter Programs
        const filteredPrograms: Record<string, Program[]> = {};
        Object.entries(json.programs).forEach(([channelId, programs]) => {
          if (filteredChannelIds.has(channelId)) {
            filteredPrograms[channelId] = ContentFilter.filterItems(programs, (p) => [p.title || '', p.description || '', p.category || ''])
              .map(p => ({
                 ...p,
                 // Also clean program descriptions if they mention it
                 description: (p.description || '').replace(/Pluto TV/gi, 'Prism IPTV'),
                 title: p.title || 'Untitled Program'
              }));
          }
        });

        setData({
          channels: filteredChannels,
          programs: filteredPrograms
        });
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEPG();
  }, []);

  return { data, loading, error };
};
