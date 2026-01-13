import { XMLParser } from 'fast-xml-parser';
import { Channel, Program, EPGResponse } from '../types';

const XMLTV_URL = 'https://i.mjh.nz/PlutoTV/us.xml'; // Public legal source for Pluto TV US
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Hour

interface CachedEPG {
  timestamp: number;
  data: EPGResponse;
}

let cache: CachedEPG | null = null;

export class EPGService {
  
  static async getEPGData(): Promise<EPGResponse> {
    // 1. Check Cache
    if (cache && (Date.now() - cache.timestamp < CACHE_TTL_MS)) {
      console.log('Serving EPG from cache');
      return cache.data;
    }

    console.log('Fetching EPG from upstream...');
    try {
      // 2. Fetch XMLTV
      const response = await fetch(XMLTV_URL);
      if (!response.ok) throw new Error(`Failed to fetch XMLTV: ${response.statusText}`);
      const xmlData = await response.text();

      // 3. Parse XML
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_'
      });
      const parsed = parser.parse(xmlData);
      
      // 4. Normalize
      const normalizedData = this.normalizeXMLTV(parsed);

      // 5. Update Cache
      cache = {
        timestamp: Date.now(),
        data: normalizedData
      };

      return normalizedData;
    } catch (error) {
      console.error('EPG Fetch Error:', error);
      // Return empty or cached structure if failed
      return { channels: [], programs: {} };
    }
  }

  private static normalizeXMLTV(parsed: any): EPGResponse {
    const channels: Channel[] = [];
    const programs: Record<string, Program[]> = {};

    const tv = parsed.tv;
    if (!tv) return { channels: [], programs: {} };

    // --- Process Channels ---
    const rawChannels = Array.isArray(tv.channel) ? tv.channel : [tv.channel];
    
    // Limit to first 50 channels to avoid overwhelming the client for this demo
    // In production, we would support full pagination or filtering
    const limitedChannels = rawChannels.slice(0, 50);

    limitedChannels.forEach((ch: any) => {
      const channelId = ch['@_id'];
      const displayName = ch['display-name'] || 'Unknown Channel';
      // Try to find a logo
      const icon = ch['icon'] ? ch['icon']['@_src'] : '';

      channels.push({
        id: channelId,
        name: displayName,
        number: 0, // Numbering depends on playlist, XMLTV often doesn't have it
        logo: icon,
        category: 'General' 
      });

      programs[channelId] = [];
    });

    // --- Process Programs ---
    const rawPrograms = Array.isArray(tv.programme) ? tv.programme : [tv.programme];
    
    // Create a Set of valid channel IDs for O(1) lookup
    const validChannelIds = new Set(channels.map(c => c.id));

    rawPrograms.forEach((prog: any) => {
      const channelId = prog['@_channel'];
      if (!validChannelIds.has(channelId)) return;

      const title = prog.title?.['#text'] || prog.title || 'No Title';
      const desc = prog.desc?.['#text'] || prog.desc || '';
      
      // XMLTV format: YYYYMMDDhhmmss +0000
      // We need to convert this to ISO string
      const startIso = this.parseXMLTVDate(prog['@_start']);
      const endIso = this.parseXMLTVDate(prog['@_stop']);

      programs[channelId].push({
        id: `${channelId}-${prog['@_start']}`,
        channelId: channelId,
        title: title,
        description: desc,
        startTime: startIso,
        endTime: endIso,
        category: 'entertainment' // Simplified mapping
      });
    });

    return { channels, programs };
  }

  private static parseXMLTVDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString();
    // Format: 20240501120000 +0000
    //         01234567890123
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    
    // Simple ISO construction (assuming UTC or handling timezone if needed)
    // XMLTV usually has offset, but for simplicity we treat as UTC or local string
    // Better: construct a traceable date object
    return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`; 
  }
}
