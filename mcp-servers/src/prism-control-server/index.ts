#!/usr/bin/env node
/**
 * Prism Control Server (MCP Server #1)
 *
 * Acts as Lumen's "hands" to control the Prism IPTV React application.
 * Provides WebSocket bridge to frontend for real-time UI control.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import WebSocket from 'ws';
import { z } from 'zod';

// Type definitions for Prism IPTV control
interface MediaControlMessage {
  type: 'media_control';
  command: MediaCommand;
  value?: number;
}

interface NavigationMessage {
  type: 'navigate_ui';
  route: AppRoute;
  viewMode?: ViewMode;
}

interface ThemeMessage {
  type: 'set_theme';
  mode: ThemeMode;
}

interface EmotionMessage {
  type: 'mascot_emotion';
  emotion: EmotionState;
  intensity?: number;
}

type MediaCommand =
  | 'play'
  | 'pause'
  | 'stop'
  | 'seek_relative'
  | 'seek_absolute'
  | 'set_volume'
  | 'mute'
  | 'unmute'
  | 'next_channel'
  | 'previous_channel'
  | 'go_to_channel';

type AppRoute = '/tv' | '/movies' | '/radio' | '/podcasts' | '/favorites' | '/settings';
type ViewMode = 'grid' | 'list' | 'compact';
type ThemeMode = 'glass_neon' | 'cinema_dark' | 'light' | 'high_contrast';
type EmotionState = 'happy' | 'thinking' | 'alert' | 'excited' | 'sad' | 'neutral' | 'surprised';

// Zod schemas for validation
const MediaControlSchema = z.object({
  command: z.enum([
    'play', 'pause', 'stop', 'seek_relative', 'seek_absolute',
    'set_volume', 'mute', 'unmute', 'next_channel', 'previous_channel', 'go_to_channel'
  ]),
  value: z.number().optional(),
});

const NavigateUISchema = z.object({
  route: z.enum(['/tv', '/movies', '/radio', '/podcasts', '/favorites', '/settings']),
  viewMode: z.enum(['grid', 'list', 'compact']).optional(),
});

const SetThemeSchema = z.object({
  mode: z.enum(['glass_neon', 'cinema_dark', 'light', 'high_contrast']),
});

const TriggerEmotionSchema = z.object({
  emotion: z.enum(['happy', 'thinking', 'alert', 'excited', 'sad', 'neutral', 'surprised']),
  intensity: z.number().min(0).max(1).optional(),
});

const GetPlayerStateSchema = z.object({});

const QueryChannelsSchema = z.object({
  filter: z.string().optional(),
  category: z.string().optional(),
  limit: z.number().optional(),
});

/**
 * WebSocket Bridge to Prism IPTV Frontend
 */
class PrismWebSocketBridge {
  private ws: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private readonly url: string;
  private messageQueue: any[] = [];
  private connected: boolean = false;

  constructor(url: string = 'ws://localhost:3001') {
    this.url = url;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.on('open', () => {
          console.error('[PrismControl] Connected to Prism IPTV frontend');
          this.connected = true;

          // Send queued messages
          while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            this.send(msg);
          }

          resolve();
        });

        this.ws.on('close', () => {
          console.error('[PrismControl] Disconnected from frontend, reconnecting...');
          this.connected = false;
          this.scheduleReconnect();
        });

        this.ws.on('error', (err) => {
          console.error('[PrismControl] WebSocket error:', err.message);
          if (!this.connected) {
            reject(err);
          }
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            console.error('[PrismControl] Received from frontend:', message);
          } catch (e) {
            console.error('[PrismControl] Failed to parse message:', e);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectInterval) return;

    this.reconnectInterval = setInterval(() => {
      console.error('[PrismControl] Attempting to reconnect...');
      this.connect().catch(() => {
        // Will retry on next interval
      });
    }, 3000);
  }

  send(message: any): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[PrismControl] Not connected, queueing message');
      this.messageQueue.push(message);
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('[PrismControl] Failed to send message:', error);
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect(): void {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }
}

// Initialize WebSocket bridge
const bridge = new PrismWebSocketBridge();

// Tool definitions following MCP SDK pattern
const mediaControlTool: Tool = {
  name: 'control_media_player',
  description: `Controls the Prism IPTV media player. Use this to play, pause, seek, adjust volume, or navigate channels.

Commands:
- play: Start playback
- pause: Pause playback
- stop: Stop playback completely
- seek_relative: Skip forward/backward (value in seconds, negative to go back)
- seek_absolute: Jump to specific time (value in seconds)
- set_volume: Set volume level (value 0-100)
- mute/unmute: Toggle or set mute state
- next_channel/previous_channel: Navigate channels
- go_to_channel: Jump to specific channel (value = channel number)

Examples:
- Play: {"command": "play"}
- Skip 30s ahead: {"command": "seek_relative", "value": 30}
- Set volume to 75%: {"command": "set_volume", "value": 75}
- Go to channel 5: {"command": "go_to_channel", "value": 5}`,
  inputSchema: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        enum: [
          'play', 'pause', 'stop', 'seek_relative', 'seek_absolute',
          'set_volume', 'mute', 'unmute', 'next_channel', 'previous_channel', 'go_to_channel'
        ],
        description: 'The playback control command to execute',
      },
      value: {
        type: 'number',
        description: 'Numeric parameter for commands like seek, volume, or channel number',
      },
    },
    required: ['command'],
  },
};

const navigateUITool: Tool = {
  name: 'navigate_ui',
  description: `Navigate to different sections of the Prism IPTV interface and optionally change the view mode.

Routes:
- /tv: Live TV channels
- /movies: Video on demand
- /radio: Radio stations
- /podcasts: Podcast directory
- /favorites: User's saved favorites
- /settings: Application settings

View modes:
- grid: Grid layout with thumbnails
- list: Compact list view
- compact: Minimal compact view

Example: Navigate to TV with grid view: {"route": "/tv", "viewMode": "grid"}`,
  inputSchema: {
    type: 'object',
    properties: {
      route: {
        type: 'string',
        enum: ['/tv', '/movies', '/radio', '/podcasts', '/favorites', '/settings'],
        description: 'The application route to navigate to',
      },
      viewMode: {
        type: 'string',
        enum: ['grid', 'list', 'compact'],
        description: 'Optional view mode for the destination',
      },
    },
    required: ['route'],
  },
};

const setThemeTool: Tool = {
  name: 'set_theme_mode',
  description: `Change the visual theme of the Prism IPTV interface.

Available themes:
- glass_neon: Glassmorphism with neon accents (default)
- cinema_dark: Dark theme optimized for video viewing
- light: Light theme for daytime use
- high_contrast: High contrast for accessibility

Example: {"mode": "cinema_dark"}`,
  inputSchema: {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        enum: ['glass_neon', 'cinema_dark', 'light', 'high_contrast'],
        description: 'The theme mode to apply',
      },
    },
    required: ['mode'],
  },
};

const triggerEmotionTool: Tool = {
  name: 'trigger_mascot_emotion',
  description: `Trigger an emotional expression on Lumen's VRM avatar to enhance user interaction.

Emotions:
- happy: Joyful, excited expression
- thinking: Contemplative, processing
- alert: Attentive, focused
- excited: High energy, enthusiastic
- sad: Disappointed or empathetic
- neutral: Default calm state
- surprised: Shocked or amazed

Intensity (optional): 0.0 to 1.0 (default 0.8)

Example: Show excitement: {"emotion": "excited", "intensity": 1.0}`,
  inputSchema: {
    type: 'object',
    properties: {
      emotion: {
        type: 'string',
        enum: ['happy', 'thinking', 'alert', 'excited', 'sad', 'neutral', 'surprised'],
        description: 'The emotion to express',
      },
      intensity: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        description: 'Intensity of the emotion (0.0 to 1.0)',
      },
    },
    required: ['emotion'],
  },
};

const getPlayerStateTool: Tool = {
  name: 'get_player_state',
  description: `Retrieve the current state of the media player including playback status, current channel/content, volume, and position.

Returns:
- isPlaying: boolean
- currentChannel: { name, number, url }
- volume: number (0-100)
- isMuted: boolean
- currentTime: number (seconds)
- duration: number (seconds)
- mediaType: "tv" | "radio" | "podcast" | "movie"`,
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

const queryChannelsTool: Tool = {
  name: 'query_available_channels',
  description: `Query available TV/radio channels with optional filtering.

Parameters:
- filter: Search term to filter channel names
- category: Filter by category (news, sports, entertainment, etc.)
- limit: Max results to return (default 20)

Returns list of channels with: name, number, category, url, logo`,
  inputSchema: {
    type: 'object',
    properties: {
      filter: {
        type: 'string',
        description: 'Search term to filter channels',
      },
      category: {
        type: 'string',
        description: 'Category filter',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results',
      },
    },
  },
};

/**
 * Prism Control Server implementation
 */
class PrismControlServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'prism-control-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();

    // Handle errors
    this.server.onerror = (error) => {
      console.error('[PrismControl] Server error:', error);
    };

    process.on('SIGINT', async () => {
      await this.cleanup();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        mediaControlTool,
        navigateUITool,
        setThemeTool,
        triggerEmotionTool,
        getPlayerStateTool,
        queryChannelsTool,
      ],
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'control_media_player':
            return await this.handleMediaControl(args);

          case 'navigate_ui':
            return await this.handleNavigateUI(args);

          case 'set_theme_mode':
            return await this.handleSetTheme(args);

          case 'trigger_mascot_emotion':
            return await this.handleTriggerEmotion(args);

          case 'get_player_state':
            return await this.handleGetPlayerState(args);

          case 'query_available_channels':
            return await this.handleQueryChannels(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleMediaControl(args: unknown) {
    const params = MediaControlSchema.parse(args);

    if (!bridge.isConnected()) {
      throw new Error('Not connected to Prism IPTV frontend. Please ensure the app is running.');
    }

    const message: MediaControlMessage = {
      type: 'media_control',
      command: params.command,
      value: params.value,
    };

    const sent = bridge.send(message);

    if (!sent) {
      throw new Error('Failed to send command to frontend');
    }

    let resultText = `Media control executed: ${params.command}`;
    if (params.value !== undefined) {
      resultText += ` (value: ${params.value})`;
    }

    return {
      content: [
        {
          type: 'text',
          text: resultText,
        },
      ],
    };
  }

  private async handleNavigateUI(args: unknown) {
    const params = NavigateUISchema.parse(args);

    if (!bridge.isConnected()) {
      throw new Error('Not connected to Prism IPTV frontend');
    }

    const message: NavigationMessage = {
      type: 'navigate_ui',
      route: params.route,
      viewMode: params.viewMode,
    };

    bridge.send(message);

    return {
      content: [
        {
          type: 'text',
          text: `Navigated to ${params.route}${params.viewMode ? ` with ${params.viewMode} view` : ''}`,
        },
      ],
    };
  }

  private async handleSetTheme(args: unknown) {
    const params = SetThemeSchema.parse(args);

    if (!bridge.isConnected()) {
      throw new Error('Not connected to Prism IPTV frontend');
    }

    const message: ThemeMessage = {
      type: 'set_theme',
      mode: params.mode,
    };

    bridge.send(message);

    return {
      content: [
        {
          type: 'text',
          text: `Theme changed to: ${params.mode}`,
        },
      ],
    };
  }

  private async handleTriggerEmotion(args: unknown) {
    const params = TriggerEmotionSchema.parse(args);

    if (!bridge.isConnected()) {
      throw new Error('Not connected to Prism IPTV frontend');
    }

    const message: EmotionMessage = {
      type: 'mascot_emotion',
      emotion: params.emotion,
      intensity: params.intensity ?? 0.8,
    };

    bridge.send(message);

    return {
      content: [
        {
          type: 'text',
          text: `Lumen emotion set to: ${params.emotion} (intensity: ${params.intensity ?? 0.8})`,
        },
      ],
    };
  }

  private async handleGetPlayerState(args: unknown) {
    GetPlayerStateSchema.parse(args);

    if (!bridge.isConnected()) {
      throw new Error('Not connected to Prism IPTV frontend');
    }

    // TODO: Implement state query mechanism
    // For now, return mock data
    const state = {
      isPlaying: true,
      currentChannel: {
        name: 'CNN',
        number: 102,
        url: 'https://example.com/cnn.m3u8'
      },
      volume: 75,
      isMuted: false,
      currentTime: 145,
      duration: 0, // Live TV
      mediaType: 'tv' as const
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(state, null, 2),
        },
      ],
    };
  }

  private async handleQueryChannels(args: unknown) {
    const params = QueryChannelsSchema.parse(args);

    // TODO: Integrate with actual channel data
    // Mock response for now
    const channels = [
      { name: 'CNN', number: 102, category: 'news', url: 'https://...', logo: '' },
      { name: 'ESPN', number: 105, category: 'sports', url: 'https://...', logo: '' },
      { name: 'HBO', number: 201, category: 'entertainment', url: 'https://...', logo: '' },
    ];

    const filtered = params.filter
      ? channels.filter(ch => ch.name.toLowerCase().includes(params.filter!.toLowerCase()))
      : channels;

    const limited = filtered.slice(0, params.limit ?? 20);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(limited, null, 2),
        },
      ],
    };
  }

  private async cleanup(): void {
    console.error('[PrismControl] Shutting down...');
    bridge.disconnect();
  }

  async run(): Promise<void> {
    // Connect to Prism IPTV frontend
    try {
      await bridge.connect();
    } catch (error) {
      console.error('[PrismControl] Warning: Could not connect to frontend. Commands will be queued.');
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error('[PrismControl] Prism Control Server running on stdio');
  }
}

// Start server
const server = new PrismControlServer();
server.run().catch((error) => {
  console.error('[PrismControl] Fatal error:', error);
  process.exit(1);
});
