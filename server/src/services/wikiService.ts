import axios from 'axios';

interface WikiSearchResult {
  title: string;
  description: string;
  thumbnail?: string;
  url: string;
}

export class WikiService {
  private static readonly API_URL = 'https://en.wikipedia.org/w/api.php';

  static async search(query: string): Promise<WikiSearchResult | null> {
    try {
      if (!query) return null;

      // 1. Search for the query
      const searchRes = await axios.get(this.API_URL, {
        params: {
          action: 'query',
          list: 'search',
          srsearch: query,
          format: 'json',
          srlimit: 1,
        }
      });

      const searchResults = searchRes.data.query?.search;
      if (!searchResults || searchResults.length === 0) return null;

      const pageId = searchResults[0].pageid;

      // 2. Fetch details for the first result
      const detailsRes = await axios.get(this.API_URL, {
        params: {
          action: 'query',
          prop: 'extracts|pageimages|info',
          exintro: true,
          explaintext: true,
          piprop: 'thumbnail',
          pithumbsize: 600,
          inprop: 'url',
          pageids: pageId,
          format: 'json'
        }
      });

      const page = detailsRes.data.query?.pages[pageId];
      if (!page) return null;

      // Summarize to < 4 paragraphs
      let description = page.extract || '';
      const paragraphs = description.split('\n\n');
      if (paragraphs.length > 4) {
        description = paragraphs.slice(0, 4).join('\n\n') + '...';
      }

      return {
        title: page.title,
        description: description,
        thumbnail: page.thumbnail?.source,
        url: page.fullurl
      };


    } catch (error) {
      console.error('Wiki Service Error:', error);
      return null;
    }
  }
}
