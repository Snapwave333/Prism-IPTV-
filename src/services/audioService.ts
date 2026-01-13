import type { Channel } from './iptv';

// Valid endpoints: /stations/topclick, /stations/topvote, /stations/clickstrend
// Stick to known valid for stability, 'topclick' is safest for "sorted by popularity".
const ITUNES_PODCAST_API = 'https://itunes.apple.com/us/rss/toppodcasts/limit=50/json';

export interface AudioItem extends Channel {
  type: 'radio' | 'podcast';
  feedUrl?: string; // For podcasts
}

export const AudioService = {
  async getTopRadioStations(limit = 20): Promise<Channel[]> {
    try {
      // Changed from global topclick to US topclick (by count)
      const response = await fetch(`https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/US?limit=${limit}&order=clickcount`);
      if (!response.ok) throw new Error('Failed to fetch radio stations');
      
      const data = await response.json();
      
      return data.map((station: any) => ({
        // Map Radio Browser format to our Channel interface
        url: station.url_resolved || station.url,
        name: station.name,
        group: station.tags || 'Radio',
        logo: station.favicon || '',
      }));
    } catch (error) {
      console.error('AudioService: Radio fetch failed', error);
      return [];
    }
  },

  async getTopPodcasts(limit = 20): Promise<Channel[]> {
    try {
      // Already fetching from /us/rss, so this is good.
      const response = await fetch(ITUNES_PODCAST_API);
      if (!response.ok) throw new Error('Failed to fetch podcasts');
      
      const data = await response.json();
      const entries = data.feed?.entry || [];

      // Map iTunes format to our Channel interface
      // Note: The 'url' here will initially be the RSS feed URL.
      // We will need to resolve the actual audio URL when playing.
      return entries.slice(0, limit).map((entry: any) => ({
        name: entry['im:name']?.label || 'Unknown Podcast',
        group: entry.category?.attributes?.label || 'Podcast',
        logo: entry['im:image']?.[2]?.label || '', // Get the largest image
        url: '', // Placeholder, we store the feed URL in a separate property usually, but Channel interface expects url. 
                 // We will overload 'url' with the feedUrl for now and handle it in the UI.
        // We'll add a custom property via type assertion if needed, or just use 'url' as feedUrl
        id: entry.id?.attributes?.['im:id']
      })).map((c: any, index: number) => ({
          ...c,
          url: entries[index]?.link?.attributes?.href || '' // Store the Feed/Link URL here
      }));

    } catch (error) {
      console.error('AudioService: Podcast fetch failed', error);
      return [];
    }
  },

  async searchRadioStations(query: string, limit = 20): Promise<Channel[]> {
    try {
      // Radio Browser usually supports CORS, but using 'all' subdomain is safer for up-time.
      // Added countrycode=US to filter
      const response = await fetch(`https://all.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(query)}&countrycode=US&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to search radio stations');
      
      const data = await response.json();
      
      return data.map((station: any) => ({
        id: station.stationuuid,
        url: station.url_resolved || station.url,
        name: station.name,
        group: station.tags || 'Radio',
        logo: station.favicon || '',
      }));
    } catch (error) {
      console.error('AudioService: Radio search failed', error);
      return [];
    }
  },

  async searchPodcasts(query: string, limit = 20): Promise<Channel[]> {
    try {
      // iTunes API does not support CORS. We must use a proxy.
      // Added country=US to iTunes search
      const targetUrl = `https://itunes.apple.com/search?media=podcast&term=${encodeURIComponent(query)}&country=US&limit=${limit}`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Failed to search podcasts');
      
      const proxyData = await response.json();
      const data = JSON.parse(proxyData.contents); // allorigins returns stringified JSON in 'contents'
      
      const results = data.results || [];

      return results.map((entry: any) => ({
        id: entry.collectionId?.toString(),
        name: entry.collectionName || 'Unknown Podcast',
        group: entry.primaryGenreName || 'Podcast',
        logo: entry.artworkUrl600 || entry.artworkUrl100 || '', 
        url: entry.feedUrl || '', 
      }));

    } catch (error) {
      console.error('AudioService: Podcast search failed', error);
      // Fallback: Return empty to avoid breaking the UI
      return [];
    }
  },

  async getLatestEpisodeUrl(feedUrl: string): Promise<string | null> {
    try {
        if (!feedUrl) return null;
        
        // Use allorigins as a proxy to avoid CORS
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        const xmlString = data.contents;

        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlString, 'text/xml');
        
        const items = xml.querySelectorAll('item');
        if (items.length === 0) return null;

        const firstItem = items[0];
        const enclosure = firstItem.querySelector('enclosure');
        
        if (enclosure?.getAttribute('url')) {
            return enclosure.getAttribute('url');
        }
        
        return null;
    } catch (error) {
        console.error('AudioService: Failed to parse RSS', error);
        return null;
    }
  }
};
