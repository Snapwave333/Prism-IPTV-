# Model Context Protocol (MCP) Server Architecture for Lumen AI
## Empowering Lumen with Full Agency Over Prism IPTV

---

## Overview

This document outlines the complete MCP server architecture that gives Lumen (LLaMA3 + VRM avatar) the ability to:
- **Control** the Prism IPTV application (playback, navigation, UI)
- **Access** live media metadata and content information
- **Query** real-time sports data and web information
- **Remember** user preferences and session context

**Hybrid Architecture:** 3 Custom Internal Servers + 2 External Public Servers

---

## MCP Server Suite

### 1. Prism Control Server (Custom - Critical)
**Role:** The "Hands" of Lumen
**Purpose:** Direct control over React app state and media playback
**Communication:** WebSocket bridge between MCP and React frontend

### 2. Media Knowledge Server (Custom)
**Role:** The "Librarian"
**Purpose:** Aggregate metadata from TV/Radio/Movie sources
**Communication:** REST APIs to external services (TMDB, Radio Browser, EPG)

### 3. User Memory Server (Custom)
**Role:** The "Memory"
**Purpose:** Session tracking, personalization, context retention
**Communication:** SQLite database for persistent storage

### 4. Live Sports Server (External)
**Role:** The "Analyst"
**Purpose:** Real-time sports scores and statistics
**Implementation:** Pre-built `espn-mcp` server

### 5. Web Search Server (External)
**Role:** The "Oracle"
**Purpose:** General knowledge queries and live web data
**Implementation:** Brave Search MCP

---

## PART 1: PRISM CONTROL SERVER (Custom)

### 1.1 Architecture

```
┌─────────────────┐      WebSocket      ┌──────────────────┐
│   Lumen AI      │ ←──────────────────→ │  Prism Control   │
│  (LLaMA3)       │   MCP Tool Calls     │   MCP Server     │
└─────────────────┘                      └──────────────────┘
                                                 │
                                                 │ WebSocket
                                                 ↓
                                         ┌──────────────────┐
                                         │  React Frontend  │
                                         │  (Prism IPTV)    │
                                         └──────────────────┘
```

### 1.2 Implementation

**File:** `mcp-servers/prism-control/src/index.ts`

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import WebSocket from 'ws';

// WebSocket connection to React frontend
class FrontendBridge {
  private ws: WebSocket | null = null;
  private wsServer: WebSocket.Server;
  private messageQueue: Array<any> = [];

  constructor(port: number = 8765) {
    this.wsServer = new WebSocket.Server({ port });

    this.wsServer.on('connection', (socket) => {
      console.log('Frontend connected to MCP Control Server');
      this.ws = socket;

      // Send queued messages
      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift();
        this.ws.send(JSON.stringify(msg));
      }

      socket.on('close', () => {
        console.log('Frontend disconnected');
        this.ws = null;
      });

      socket.on('message', (data) => {
        console.log('Received from frontend:', data.toString());
      });
    });

    console.log(`WebSocket server listening on port ${port}`);
  }

  send(message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message), (err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        // Queue message if not connected
        this.messageQueue.push(message);
        console.warn('Frontend not connected, message queued');
        resolve();
      }
    });
  }
}

const frontendBridge = new FrontendBridge(8765);

// MCP Server Implementation
const server = new Server(
  {
    name: "prism-control-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define Tools
const tools: Tool[] = [
  {
    name: "control_media_player",
    description: "Controls the playback of the Prism IPTV media player. Use for play, pause, seek, volume, or speed adjustments.",
    inputSchema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          enum: [
            "play",
            "pause",
            "stop",
            "resume",
            "seek_relative",
            "seek_absolute",
            "set_volume",
            "volume_up",
            "volume_down",
            "mute",
            "unmute",
            "set_speed",
            "speed_up",
            "slow_down"
          ],
          description: "The specific playback action to execute."
        },
        value: {
          type: "number",
          description: "The value for the command (e.g., seconds for seek, 0-100 for volume, 0.5-3.0 for speed)."
        }
      },
      required: ["command"]
    }
  },

  {
    name: "navigate_ui",
    description: "Navigate to different sections of the Prism IPTV application.",
    inputSchema: {
      type: "object",
      properties: {
        route: {
          type: "string",
          enum: ["/", "/tv", "/movies", "/radio", "/podcasts", "/sports", "/settings"],
          description: "The route to navigate to."
        },
        view_mode: {
          type: "string",
          enum: ["grid", "list", "detail"],
          description: "Optional view mode for content display."
        }
      },
      required: ["route"]
    }
  },

  {
    name: "search_content",
    description: "Search for content within the Prism IPTV application.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query text."
        },
        content_type: {
          type: "string",
          enum: ["all", "tv", "movie", "radio", "podcast", "sports"],
          description: "Filter search by content type."
        },
        filters: {
          type: "object",
          properties: {
            genre: { type: "string" },
            year: { type: "number" },
            rating: { type: "string" }
          },
          description: "Additional search filters."
        }
      },
      required: ["query"]
    }
  },

  {
    name: "play_content",
    description: "Play specific content by title, ID, or channel.",
    inputSchema: {
      type: "object",
      properties: {
        content_id: {
          type: "string",
          description: "The unique identifier of the content to play."
        },
        content_type: {
          type: "string",
          enum: ["movie", "tv_show", "live_channel", "radio_station", "podcast"],
          description: "The type of content."
        },
        title: {
          type: "string",
          description: "The title of the content (if ID not provided)."
        },
        season: {
          type: "number",
          description: "Season number for TV shows."
        },
        episode: {
          type: "number",
          description: "Episode number for TV shows."
        }
      }
    }
  },

  {
    name: "set_theme",
    description: "Change the visual theme of the Prism IPTV application.",
    inputSchema: {
      type: "object",
      properties: {
        theme: {
          type: "string",
          enum: ["glass_neon", "cinema_dark", "minimal_light", "retro_vhs"],
          description: "The theme to apply."
        }
      },
      required: ["theme"]
    }
  },

  {
    name: "trigger_mascot_emotion",
    description: "Trigger a specific emotion/expression for the Lumen VRM mascot.",
    inputSchema: {
      type: "object",
      properties: {
        emotion: {
          type: "string",
          enum: ["happy", "excited", "thinking", "sad", "surprised", "neutral", "alert"],
          description: "The emotion to display."
        },
        intensity: {
          type: "number",
          minimum: 0,
          maximum: 1,
          description: "Intensity of the emotion (0.0 to 1.0)."
        },
        duration: {
          type: "number",
          description: "Duration in seconds (optional, defaults to natural)."
        }
      },
      required: ["emotion"]
    }
  },

  {
    name: "get_playback_state",
    description: "Get the current playback state of the media player.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },

  {
    name: "get_current_content",
    description: "Get information about the currently playing content.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "control_media_player": {
        await frontendBridge.send({
          type: "MEDIA_COMMAND",
          command: args.command,
          value: args.value
        });

        return {
          content: [
            {
              type: "text",
              text: `Executed media command: ${args.command}${args.value !== undefined ? ` with value ${args.value}` : ''}`
            }
          ]
        };
      }

      case "navigate_ui": {
        await frontendBridge.send({
          type: "NAVIGATE",
          route: args.route,
          viewMode: args.view_mode
        });

        return {
          content: [
            {
              type: "text",
              text: `Navigated to ${args.route}${args.view_mode ? ` in ${args.view_mode} mode` : ''}`
            }
          ]
        };
      }

      case "search_content": {
        await frontendBridge.send({
          type: "SEARCH",
          query: args.query,
          contentType: args.content_type,
          filters: args.filters
        });

        return {
          content: [
            {
              type: "text",
              text: `Searching for "${args.query}"${args.content_type ? ` in ${args.content_type}` : ''}`
            }
          ]
        };
      }

      case "play_content": {
        await frontendBridge.send({
          type: "PLAY_CONTENT",
          contentId: args.content_id,
          contentType: args.content_type,
          title: args.title,
          season: args.season,
          episode: args.episode
        });

        return {
          content: [
            {
              type: "text",
              text: `Playing ${args.title || args.content_id}`
            }
          ]
        };
      }

      case "set_theme": {
        await frontendBridge.send({
          type: "SET_THEME",
          theme: args.theme
        });

        return {
          content: [
            {
              type: "text",
              text: `Theme changed to ${args.theme}`
            }
          ]
        };
      }

      case "trigger_mascot_emotion": {
        await frontendBridge.send({
          type: "MASCOT_EMOTION",
          emotion: args.emotion,
          intensity: args.intensity || 0.7,
          duration: args.duration
        });

        return {
          content: [
            {
              type: "text",
              text: `Triggered mascot emotion: ${args.emotion}`
            }
          ]
        };
      }

      case "get_playback_state": {
        // In real implementation, would query frontend state
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                playing: true,
                position: 123,
                duration: 3600,
                volume: 75,
                speed: 1.0
              })
            }
          ]
        };
      }

      case "get_current_content": {
        // In real implementation, would query frontend state
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                title: "Current Movie",
                type: "movie",
                genre: "Action",
                year: 2024
              })
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing ${name}: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Prism Control MCP Server running");
}

main().catch(console.error);
```

### 1.3 React Frontend Integration

**File:** `src/services/MCPBridge.ts`

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export class MCPBridge {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(private url: string = 'ws://localhost:8765') {
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('Connected to MCP Control Server');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse MCP message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('Disconnected from MCP Control Server, reconnecting...');
        setTimeout(() => this.connect(), this.reconnectInterval);
      };
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  private handleMessage(message: any) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    } else {
      console.warn('No handler for message type:', message.type);
    }
  }

  registerHandler(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler);
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }
}

// React Hook for MCP Integration
export function useMCPBridge() {
  const [bridge] = useState(() => new MCPBridge());
  const navigate = useNavigate();

  useEffect(() => {
    // Register handlers for MCP commands
    bridge.registerHandler('MEDIA_COMMAND', (data) => {
      // Handle media control commands
      const { command, value } = data;
      handleMediaCommand(command, value);
    });

    bridge.registerHandler('NAVIGATE', (data) => {
      navigate(data.route);
      // Handle view mode if specified
      if (data.viewMode) {
        // Set view mode in state
      }
    });

    bridge.registerHandler('SEARCH', (data) => {
      // Trigger search in your app
      navigate(`/search?q=${encodeURIComponent(data.query)}`);
    });

    bridge.registerHandler('PLAY_CONTENT', (data) => {
      // Play specified content
      playContent(data);
    });

    bridge.registerHandler('SET_THEME', (data) => {
      // Change theme
      document.documentElement.setAttribute('data-theme', data.theme);
    });

    bridge.registerHandler('MASCOT_EMOTION', (data) => {
      // Trigger mascot emotion via VRM controller
      triggerMascotEmotion(data.emotion, data.intensity);
    });

    return () => {
      // Cleanup
    };
  }, [bridge, navigate]);

  return bridge;
}

function handleMediaCommand(command: string, value?: number) {
  const videoElement = document.querySelector('video');
  if (!videoElement) return;

  switch (command) {
    case 'play':
      videoElement.play();
      break;
    case 'pause':
      videoElement.pause();
      break;
    case 'seek_relative':
      videoElement.currentTime += (value || 0);
      break;
    case 'seek_absolute':
      videoElement.currentTime = value || 0;
      break;
    case 'set_volume':
      videoElement.volume = (value || 50) / 100;
      break;
    case 'volume_up':
      videoElement.volume = Math.min(1, videoElement.volume + 0.05);
      break;
    case 'volume_down':
      videoElement.volume = Math.max(0, videoElement.volume - 0.05);
      break;
    case 'mute':
      videoElement.muted = true;
      break;
    case 'unmute':
      videoElement.muted = false;
      break;
    case 'set_speed':
      videoElement.playbackRate = value || 1.0;
      break;
    // ... other commands
  }
}

function playContent(data: any) {
  // Implementation to play content
}

function triggerMascotEmotion(emotion: string, intensity: number = 0.7) {
  // Implementation to trigger VRM emotion
}
```

### 1.4 Package Configuration

**File:** `mcp-servers/prism-control/package.json`

```json
{
  "name": "prism-control-mcp",
  "version": "1.0.0",
  "description": "MCP Server for Prism IPTV Control",
  "type": "module",
  "bin": {
    "prism-control": "./build/index.js"
  },
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "start": "node build/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "ws": "^8.18.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/ws": "^8.5.0",
    "typescript": "^5.3.0"
  }
}
```

---

## PART 2: MEDIA KNOWLEDGE SERVER (Custom)

### 2.1 Purpose

Aggregates metadata from multiple sources to give Lumen comprehensive knowledge of available content without needing to browse the UI.

### 2.2 Implementation

**File:** `mcp-servers/media-knowledge/src/index.ts`

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

// TMDB API Client
class TMDBClient {
  private apiKey: string;
  private baseUrl = 'https://api.themoviedb.org/3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchMovies(query: string, filters?: any) {
    const response = await axios.get(`${this.baseUrl}/search/movie`, {
      params: {
        api_key: this.apiKey,
        query,
        ...filters
      }
    });
    return response.data.results;
  }

  async getMovieDetails(movieId: number) {
    const response = await axios.get(`${this.baseUrl}/movie/${movieId}`, {
      params: { api_key: this.apiKey }
    });
    return response.data;
  }

  async searchTVShows(query: string) {
    const response = await axios.get(`${this.baseUrl}/search/tv`, {
      params: {
        api_key: this.apiKey,
        query
      }
    });
    return response.data.results;
  }

  async discoverMovies(genre?: string, year?: number) {
    const response = await axios.get(`${this.baseUrl}/discover/movie`, {
      params: {
        api_key: this.apiKey,
        with_genres: genre,
        year
      }
    });
    return response.data.results;
  }
}

// Radio Browser API Client
class RadioBrowserClient {
  private baseUrl = 'https://de1.api.radio-browser.info/json';

  async searchStations(params: {
    name?: string;
    country?: string;
    tag?: string;
    language?: string;
  }) {
    const queryParams = new URLSearchParams();

    if (params.name) queryParams.append('name', params.name);
    if (params.country) queryParams.append('country', params.country);
    if (params.tag) queryParams.append('tag', params.tag);
    if (params.language) queryParams.append('language', params.language);

    const response = await axios.get(`${this.baseUrl}/stations/search`, {
      params: queryParams
    });

    return response.data.slice(0, 20); // Limit to top 20
  }

  async getPopularStations(limit: number = 20) {
    const response = await axios.get(`${this.baseUrl}/stations/topvote/${limit}`);
    return response.data;
  }

  async getStationsByCountry(country: string) {
    const response = await axios.get(`${this.baseUrl}/stations/bycountry/${country}`);
    return response.data.slice(0, 50);
  }
}

// EPG (Electronic Program Guide) Client
class EPGClient {
  private epgUrl = 'https://i.mjh.nz/PlutoTV/us.xml';
  private parser = new XMLParser();
  private cachedEPG: any = null;
  private lastFetch: number = 0;
  private cacheDuration = 3600000; // 1 hour

  async getCurrentBroadcasts(genre?: string) {
    await this.ensureFreshEPG();

    const now = new Date();
    const channels = this.cachedEPG.tv.channel || [];
    const programmes = this.cachedEPG.tv.programme || [];

    // Find currently airing programmes
    const currentBroadcasts = programmes
      .filter((prog: any) => {
        const start = new Date(prog['@_start']);
        const stop = new Date(prog['@_stop']);
        return start <= now && stop >= now;
      })
      .map((prog: any) => {
        const channel = channels.find((ch: any) => ch['@_id'] === prog['@_channel']);
        return {
          channel: channel?.['display-name']?.['#text'] || prog['@_channel'],
          title: prog.title?.['#text'] || prog.title,
          description: prog.desc?.['#text'] || '',
          start: prog['@_start'],
          stop: prog['@_stop'],
          category: prog.category?.['#text'] || ''
        };
      });

    if (genre) {
      return currentBroadcasts.filter((b: any) =>
        b.category.toLowerCase().includes(genre.toLowerCase())
      );
    }

    return currentBroadcasts.slice(0, 50);
  }

  async getChannelSchedule(channelName: string) {
    await this.ensureFreshEPG();

    const channels = this.cachedEPG.tv.channel || [];
    const channel = channels.find((ch: any) =>
      ch['display-name']?.['#text']?.toLowerCase().includes(channelName.toLowerCase())
    );

    if (!channel) return [];

    const programmes = this.cachedEPG.tv.programme || [];
    return programmes
      .filter((prog: any) => prog['@_channel'] === channel['@_id'])
      .slice(0, 20);
  }

  private async ensureFreshEPG() {
    const now = Date.now();
    if (!this.cachedEPG || (now - this.lastFetch) > this.cacheDuration) {
      await this.fetchEPG();
    }
  }

  private async fetchEPG() {
    try {
      const response = await axios.get(this.epgUrl);
      this.cachedEPG = this.parser.parse(response.data);
      this.lastFetch = Date.now();
    } catch (error) {
      console.error('Failed to fetch EPG:', error);
      throw error;
    }
  }
}

// Initialize clients
const tmdbClient = new TMDBClient(process.env.TMDB_API_KEY || '');
const radioClient = new RadioBrowserClient();
const epgClient = new EPGClient();

// MCP Server
const server = new Server(
  {
    name: "media-knowledge-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools: Tool[] = [
  {
    name: "search_movies",
    description: "Search for movies using TMDB database. Supports filters for genre, year, actor, director.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Movie title or search query"
        },
        year: {
          type: "number",
          description: "Filter by release year"
        },
        genre: {
          type: "string",
          description: "Filter by genre (action, comedy, drama, etc.)"
        },
        actor: {
          type: "string",
          description: "Filter by actor name"
        }
      },
      required: ["query"]
    }
  },

  {
    name: "get_movie_details",
    description: "Get detailed information about a specific movie.",
    inputSchema: {
      type: "object",
      properties: {
        movie_id: {
          type: "number",
          description: "TMDB movie ID"
        }
      },
      required: ["movie_id"]
    }
  },

  {
    name: "discover_movies",
    description: "Discover movies by genre, year, or popularity.",
    inputSchema: {
      type: "object",
      properties: {
        genre: {
          type: "string",
          description: "Genre name or ID"
        },
        year: {
          type: "number",
          description: "Release year"
        },
        sort_by: {
          type: "string",
          enum: ["popularity.desc", "release_date.desc", "vote_average.desc"],
          description: "Sort order"
        }
      }
    }
  },

  {
    name: "search_radio_stations",
    description: "Search for radio stations by name, country, genre/tag, or language.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Station name"
        },
        country: {
          type: "string",
          description: "Country code (e.g., 'US', 'UK')"
        },
        tag: {
          type: "string",
          description: "Genre tag (e.g., 'jazz', 'rock', 'news')"
        },
        language: {
          type: "string",
          description: "Language code"
        }
      }
    }
  },

  {
    name: "get_popular_radio_stations",
    description: "Get the most popular radio stations.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of stations to return (max 100)",
          maximum: 100
        }
      }
    }
  },

  {
    name: "get_current_tv_broadcasts",
    description: "Get currently airing TV shows from EPG (Electronic Program Guide).",
    inputSchema: {
      type: "object",
      properties: {
        genre: {
          type: "string",
          description: "Filter by genre (optional)"
        }
      }
    }
  },

  {
    name: "get_channel_schedule",
    description: "Get the schedule for a specific TV channel.",
    inputSchema: {
      type: "object",
      properties: {
        channel_name: {
          type: "string",
          description: "Name of the TV channel"
        }
      },
      required: ["channel_name"]
    }
  }
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_movies": {
        const results = await tmdbClient.searchMovies(args.query, {
          year: args.year,
          with_genres: args.genre
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2)
            }
          ]
        };
      }

      case "get_movie_details": {
        const details = await tmdbClient.getMovieDetails(args.movie_id);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(details, null, 2)
            }
          ]
        };
      }

      case "discover_movies": {
        const movies = await tmdbClient.discoverMovies(args.genre, args.year);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(movies, null, 2)
            }
          ]
        };
      }

      case "search_radio_stations": {
        const stations = await radioClient.searchStations({
          name: args.name,
          country: args.country,
          tag: args.tag,
          language: args.language
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(stations, null, 2)
            }
          ]
        };
      }

      case "get_popular_radio_stations": {
        const stations = await radioClient.getPopularStations(args.limit || 20);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(stations, null, 2)
            }
          ]
        };
      }

      case "get_current_tv_broadcasts": {
        const broadcasts = await epgClient.getCurrentBroadcasts(args.genre);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(broadcasts, null, 2)
            }
          ]
        };
      }

      case "get_channel_schedule": {
        const schedule = await epgClient.getChannelSchedule(args.channel_name);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(schedule, null, 2)
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Media Knowledge MCP Server running");
}

main().catch(console.error);
```

---

## PART 3: USER MEMORY SERVER (Custom)

### 3.1 Implementation

**File:** `mcp-servers/user-memory/src/index.ts`

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import Database from 'better-sqlite3';
import path from 'path';

class UserMemoryDB {
  private db: Database.Database;

  constructor(dbPath: string = 'user_memory.db') {
    this.db = new Database(dbPath);
    this.initDatabase();
  }

  private initDatabase() {
    // Viewing history
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS viewing_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        content_id TEXT NOT NULL,
        content_type TEXT NOT NULL,
        title TEXT NOT NULL,
        watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        duration_watched INTEGER,
        completed BOOLEAN DEFAULT 0
      )
    `);

    // User preferences
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id TEXT PRIMARY KEY,
        favorite_genres TEXT,
        disliked_genres TEXT,
        preferred_language TEXT,
        preferred_theme TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Session context
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS session_context (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        context_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_viewing_history_user ON viewing_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_session_context_user ON session_context(user_id, session_id);
    `);
  }

  // Viewing history methods
  addViewingHistory(userId: string, content: any) {
    const stmt = this.db.prepare(`
      INSERT INTO viewing_history (user_id, content_id, content_type, title, duration_watched, completed)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      userId,
      content.id,
      content.type,
      content.title,
      content.durationWatched || 0,
      content.completed ? 1 : 0
    );
  }

  getViewingHistory(userId: string, limit: number = 10) {
    const stmt = this.db.prepare(`
      SELECT * FROM viewing_history
      WHERE user_id = ?
      ORDER BY watched_at DESC
      LIMIT ?
    `);

    return stmt.all(userId, limit);
  }

  // Preferences methods
  savePreference(userId: string, preferences: any) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO user_preferences
      (user_id, favorite_genres, disliked_genres, preferred_language, preferred_theme, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(
      userId,
      JSON.stringify(preferences.favoriteGenres || []),
      JSON.stringify(preferences.dislikedGenres || []),
      preferences.preferredLanguage || 'en',
      preferences.preferredTheme || 'glass_neon'
    );
  }

  getPreferences(userId: string) {
    const stmt = this.db.prepare(`
      SELECT * FROM user_preferences WHERE user_id = ?
    `);

    const row = stmt.get(userId) as any;
    if (!row) return null;

    return {
      favoriteGenres: JSON.parse(row.favorite_genres || '[]'),
      dislikedGenres: JSON.parse(row.disliked_genres || '[]'),
      preferredLanguage: row.preferred_language,
      preferredTheme: row.preferred_theme
    };
  }

  // Session context methods
  saveSessionContext(userId: string, sessionId: string, context: any, ttlMinutes: number = 5) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

    const stmt = this.db.prepare(`
      INSERT INTO session_context (user_id, session_id, context_data, expires_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(userId, sessionId, JSON.stringify(context), expiresAt.toISOString());

    // Clean up expired sessions
    this.cleanupExpiredSessions();
  }

  getSessionContext(userId: string, sessionId: string) {
    const stmt = this.db.prepare(`
      SELECT context_data FROM session_context
      WHERE user_id = ? AND session_id = ? AND expires_at > datetime('now')
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const row = stmt.get(userId, sessionId) as any;
    return row ? JSON.parse(row.context_data) : null;
  }

  private cleanupExpiredSessions() {
    const stmt = this.db.prepare(`
      DELETE FROM session_context WHERE expires_at < datetime('now')
    `);
    stmt.run();
  }

  // Get personalized recommendations based on history
  getRecommendations(userId: string) {
    const history = this.getViewingHistory(userId, 50);
    const preferences = this.getPreferences(userId);

    // Analyze watch patterns
    const genreCounts: Record<string, number> = {};
    history.forEach((item: any) => {
      // Extract genre from content (would need content metadata)
      // This is simplified
      const genre = 'Action'; // Placeholder
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    return {
      preferredGenres: Object.entries(genreCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([genre]) => genre),
      recentlyWatched: history.slice(0, 5),
      userPreferences: preferences
    };
  }
}

const memoryDB = new UserMemoryDB();

const server = new Server(
  {
    name: "user-memory-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools = [
  {
    name: "get_user_history",
    description: "Get user's viewing history.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string" },
        limit: { type: "number", default: 10 }
      },
      required: ["user_id"]
    }
  },
  {
    name: "save_viewed_content",
    description: "Save content to user's viewing history.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string" },
        content: { type: "object" }
      },
      required: ["user_id", "content"]
    }
  },
  {
    name: "get_user_preferences",
    description: "Get user preferences.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string" }
      },
      required: ["user_id"]
    }
  },
  {
    name: "save_user_preference",
    description: "Save user preference.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string" },
        preference_type: { type: "string" },
        preference_value: { type: "string" }
      },
      required: ["user_id", "preference_type", "preference_value"]
    }
  },
  {
    name: "get_session_context",
    description: "Get current session context.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string" },
        session_id: { type: "string" }
      },
      required: ["user_id", "session_id"]
    }
  },
  {
    name: "save_session_context",
    description: "Save session context.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string" },
        session_id: { type: "string" },
        context: { type: "object" }
      },
      required: ["user_id", "session_id", "context"]
    }
  },
  {
    name: "get_personalized_recommendations",
    description: "Get personalized content recommendations.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string" }
      },
      required: ["user_id"]
    }
  }
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "get_user_history":
        result = memoryDB.getViewingHistory(args.user_id, args.limit || 10);
        break;

      case "save_viewed_content":
        memoryDB.addViewingHistory(args.user_id, args.content);
        result = { success: true };
        break;

      case "get_user_preferences":
        result = memoryDB.getPreferences(args.user_id);
        break;

      case "save_user_preference":
        const prefs = memoryDB.getPreferences(args.user_id) || {};
        memoryDB.savePreference(args.user_id, {
          ...prefs,
          [args.preference_type]: args.preference_value
        });
        result = { success: true };
        break;

      case "get_session_context":
        result = memoryDB.getSessionContext(args.user_id, args.session_id);
        break;

      case "save_session_context":
        memoryDB.saveSessionContext(args.user_id, args.session_id, args.context);
        result = { success: true };
        break;

      case "get_personalized_recommendations":
        result = memoryDB.getRecommendations(args.user_id);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("User Memory MCP Server running");
}

main().catch(console.error);
```

---

## PART 4: CONFIGURATION & DEPLOYMENT

### 4.1 Claude Desktop Configuration

**File:** `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
**Or:** `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "prism-control": {
      "command": "node",
      "args": [
        "C:\\Users\\chrom\\OneDrive\\Desktop\\VIBES\\Prism IPTV\\mcp-servers\\prism-control\\build\\index.js"
      ]
    },
    "media-knowledge": {
      "command": "node",
      "args": [
        "C:\\Users\\chrom\\OneDrive\\Desktop\\VIBES\\Prism IPTV\\mcp-servers\\media-knowledge\\build\\index.js"
      ],
      "env": {
        "TMDB_API_KEY": "your_tmdb_api_key_here"
      }
    },
    "user-memory": {
      "command": "node",
      "args": [
        "C:\\Users\\chrom\\OneDrive\\Desktop\\VIBES\\Prism IPTV\\mcp-servers\\user-memory\\build\\index.js"
      ]
    },
    "brave-search": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-brave-search"
      ],
      "env": {
        "BRAVE_API_KEY": "your_brave_api_key_here"
      }
    }
  }
}
```

### 4.2 Installation Script

**File:** `install-mcp-servers.sh`

```bash
#!/bin/bash

# Install MCP Servers for Lumen

echo "Installing Prism IPTV MCP Servers..."

# Navigate to MCP servers directory
cd mcp-servers

# Install Prism Control Server
echo "Building Prism Control Server..."
cd prism-control
npm install
npm run build
cd ..

# Install Media Knowledge Server
echo "Building Media Knowledge Server..."
cd media-knowledge
npm install
npm run build
cd ..

# Install User Memory Server
echo "Building User Memory Server..."
cd user-memory
npm install
npm run build
cd ..

echo "MCP Servers installed successfully!"
echo ""
echo "Next steps:"
echo "1. Get TMDB API key from https://www.themoviedb.org/settings/api"
echo "2. Get Brave Search API key from https://brave.com/search/api/"
echo "3. Update Claude Desktop config with your API keys"
echo "4. Restart Claude Desktop"
```

---

## PART 5: USAGE EXAMPLES

### Example 1: Voice Control Media Playback

**User:** "Hey Lumen, pause the movie and turn down the volume a bit."

**Lumen's Tool Calls:**
```json
[
  {
    "tool": "control_media_player",
    "arguments": {
      "command": "pause"
    }
  },
  {
    "tool": "control_media_player",
    "arguments": {
      "command": "volume_down",
      "value": 10
    }
  }
]
```

**Lumen's Response:** "I've paused the movie and lowered the volume for you."

---

### Example 2: Content Discovery

**User:** "Find me some action movies with Tom Cruise."

**Lumen's Tool Calls:**
```json
[
  {
    "tool": "search_movies",
    "arguments": {
      "query": "Tom Cruise",
      "genre": "action"
    }
  }
]
```

**Lumen's Response:** "I found several Tom Cruise action movies! Top Gun: Maverick, Mission: Impossible - Dead Reckoning, and Jack Reacher are available. Which would you like to watch?"

---

### Example 3: Personalized Recommendations

**User:** "What should I watch tonight?"

**Lumen's Tool Calls:**
```json
[
  {
    "tool": "get_personalized_recommendations",
    "arguments": {
      "user_id": "user_123"
    }
  },
  {
    "tool": "discover_movies",
    "arguments": {
      "genre": "sci-fi",
      "sort_by": "popularity.desc"
    }
  }
]
```

**Lumen's Response:** "Based on your viewing history, I think you'd enjoy 'Dune: Part Two'—it's a critically acclaimed sci-fi epic. You seem to love space operas with complex world-building!"

---

## CONCLUSION

This MCP server architecture gives Lumen:

✅ **Full Control** over Prism IPTV (playback, navigation, UI)
✅ **Comprehensive Knowledge** of available content (movies, TV, radio)
✅ **Persistent Memory** of user preferences and context
✅ **Live Data Access** for real-time information
✅ **True Agency** to assist users naturally

**Total Implementation Time:** 2-3 weeks
**Complexity:** Medium (requires Node.js/TypeScript knowledge)
**Maintenance:** Low (self-contained servers)

**Next Steps:**
1. Set up MCP server development environment
2. Implement Prism Control Server first (highest priority)
3. Add Media Knowledge Server second
4. Deploy User Memory Server third
5. Configure external servers (Brave Search)
6. Test end-to-end integration with Lumen
7. Deploy to production

---

*Document Version: 1.0*
*Last Updated: 2026-01-07*
*Ready for Implementation*
