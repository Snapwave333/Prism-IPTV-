import { ContentFilter } from './contentFilter';

export interface Channel {
  id: string;
  name: string;
  logo?: string;
  group?: string;
  url: string;
}

export class M3UParser {
  static parse(content: string): Channel[] {
    const lines = content.split('\n');
    const channels: Channel[] = [];
    let currentChannel: Partial<Channel> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('#EXTINF:')) {
        // Extract metadata
        const info = line.substring(8);
        const nameMatch = info.match(/,(.+)$/);
        const name = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';
        
        // Extract attributes
        const logoMatch = info.match(/tvg-logo="([^"]*)"/);
        const groupMatch = info.match(/group-title="([^"]*)"/);
        
        currentChannel = {
          name,
          logo: logoMatch ? logoMatch[1] : undefined,
          group: groupMatch ? groupMatch[1] : undefined,
        };
      } else if (line.startsWith('http')) {
        // This is the URL line
        if (currentChannel.name) {
          const name = currentChannel.name;
          const group = currentChannel.group || 'Uncategorized';
          
          // Apply Content Filter
          if (!ContentFilter.isReligious(name) && !ContentFilter.isReligious(group)) {
            channels.push({
              id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (Date.now() + Math.random()).toString(),
              name,
              logo: currentChannel.logo,
              group,
              url: line,
            });
          }
          currentChannel = {}; // Reset
        }
      }
    }

    return channels;
  }
}

export const API_BASE = '/api'; // Relative to root, handled by proxy

export const IPTVService = {
  async getChannels(): Promise<Channel[]> {
    try {
      const res = await fetch(`${API_BASE}/channels`);
      if (!res.ok) throw new Error('Failed to fetch channels');
      const data = await res.json();
      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        logo: c.logo_url,
        group: c.group_title,
        url: c.stream_url
      }));
    } catch (e) {
      console.error('API Error:', e);
      return [];
    }
  },

  async syncChannels(url: string, mode: string = 'tv'): Promise<number> {
    try {
      const res = await fetch(`${API_BASE}/channels/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, mode })
      });
      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();
      return data.count;
    } catch (e) {
      console.error('Sync Error:', e);
      throw e;
    }
  },

  async searchWiki(query: string) {
    try {
      if (!query) return null;
      const res = await fetch(`${API_BASE}/wiki/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }
};
