

export interface Podcast {
  id: string; // collectionId
  title: string; // collectionName
  artist: string; // artistName
  artwork: string; // artworkUrl600
  feedUrl: string; // feedUrl
}

export interface Episode {
  id: string; // guid or url
  title: string;
  description: string;
  url: string; // enclosure url
  published: string; // pubDate
  duration?: string; // itunes:duration
}

const getProxyUrl = (url: string) => {
    // Use local proxy if available, fallback to direct for dev if needed
    // In production, this should point to the deployed server
    // For now, match the window location logic used in remote service
    const port = 3001; 
    const host = window.location.hostname || 'localhost';
    return `http://${host}:${port}/api/proxy?url=${encodeURIComponent(url)}`;
};

export class PodcastService {
  static async search(term: string): Promise<Podcast[]> {
    if (!term) return [];
    
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=podcast&entity=podcast&limit=20`);
      if (!response.ok) throw new Error('iTunes API Error');
      const data = await response.json();
      
      return data.results.map((item: any) => ({
        id: item.collectionId.toString(),
        title: item.collectionName,
        artist: item.artistName,
        artwork: item.artworkUrl600 || item.artworkUrl100,
        feedUrl: item.feedUrl,
      }));
    } catch (error) {
      console.error('Podcast Search Error', error);
      return [];
    }
  }

  static async getEpisodes(feedUrl: string): Promise<Episode[]> {
    try {
      // Use Self-Hosted CORS proxy
      const proxyUrl = getProxyUrl(feedUrl);
      const response = await fetch(proxyUrl);
      
      if (!response.ok) throw new Error('Feed Fetch Error');
      const xmlText = await response.text();
      
      // Basic XML Parsing
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, 'text/xml');
      const items = xml.querySelectorAll('item');
      
      const episodes: Episode[] = [];
      
      items.forEach((item) => {
        const title = item.querySelector('title')?.textContent || 'Untitled';
        const description = item.querySelector('description')?.textContent || '';
        // Sanitize description in UI, not here generally, but we can strip tags if we want simple text
        // const cleanDesc = description.replace(/<[^>]*>/g, '').substring(0, 200) + '...';

        const enclosure = item.querySelector('enclosure');
        const url = enclosure?.getAttribute('url');
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        
        if (url) {
          episodes.push({
            id: url, // Use URL as ID
            title,
            description,
            url,
            published: pubDate,
            duration: item.querySelector('duration')?.textContent || undefined
          });
        }
      });

      return episodes;
    } catch (error) {
      console.error('Podcast Feed Parsing Error', error);
      return [];
    }
  }
}
