export interface Channel {
  id: string;
  name: string;
  number: number;
  logo: string;
  category: string;
}

export interface Program {
  id: string;
  channelId: string;
  title: string;
  description: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  category: 'movie' | 'news' | 'sports' | 'music' | 'documentary' | 'kids' | 'entertainment';
  rating?: string;
}

export interface EPGResponse {
  channels: Channel[];
  programs: Record<string, Program[]>; // Keyed by channelId
}
