export interface RadioStation {
  stationuuid: string;
  name: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  votes: number;
}

const BASE_URL = 'https://de1.api.radio-browser.info/json';

export class RadioBrowser {
  static async searchStations(query: string = '', countryCode: string = 'US', limit: number = 50): Promise<RadioStation[]> {
    const params = new URLSearchParams({
      countrycode: countryCode,
      hidebroken: 'true',
      order: 'votes',
      reverse: 'true',
      limit: limit.toString(),
    });

    if (query) {
      params.append('name', query);
    }

    try {
      const response = await fetch(`${BASE_URL}/stations/search?${params.toString()}`);
      if (!response.ok) throw new Error('Radio Browser API Error');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch radio stations', error);
      return [];
    }
  }

  static async getTopStations(limit: number = 50): Promise<RadioStation[]> {
    return this.searchStations('', 'US', limit);
  }
}
