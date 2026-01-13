import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import ip from 'ip';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));
app.use(express.json());

// Basic Status Endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', ip: ip.address() });
});

// Proxy Endpoint for CORS
app.get('/api/proxy', async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    res.status(400).send('Missing "url" query parameter');
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
    
    // Copy content type
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Proxy Error');
  }
});

// WebSocket Handling
wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received:', data);
      
      // Broadcast to all other clients (e.g., the web player)
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (e) {
      console.error('Error serving message', e);
    }
  });

  ws.send(JSON.stringify({ type: 'WELCOME', message: 'Connected to Prism Remote Server' }));
});

// EPG Endpoint
// Services
import { EPGService } from './services/EPGService';
import { ChannelService } from './services/channelService';
import { WikiService } from './services/wikiService';
import { initSchema } from './db/schema';

// Initialize DB
initSchema();

// --- API Routes ---

// EPG
app.get('/api/epg', async (req, res) => {
  try {
    const data = await EPGService.getEPGData();
    res.json(data);
  } catch (error) {
    console.error('EPG Error:', error);
    res.status(500).json({ error: 'Failed to generate EPG' });
  }
});

// Channels
app.get('/api/channels', (req, res) => {
  try {
    const channels = ChannelService.getAllChannels();
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

app.post('/api/channels/sync', async (req, res) => {
  const { url, mode } = req.body;
  if (!url) {
     return res.status(400).json({ error: 'Missing M3U url' });
  }
  try {
    const count = await ChannelService.syncFromM3U(url, mode);
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ error: 'Sync failed' });
  }
});

// Wiki Proxy
app.get('/api/wiki/search', async (req, res) => {
  const query = req.query.q as string;
  if (!query) return res.status(400).json({ error: 'Missing query' });
  
  const result = await WikiService.search(query);
  if (!result) return res.status(404).json({ error: 'Not found' });
  
  res.json(result);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`
      🚀 Prism Remote Server running!
      Local:   http://localhost:${PORT}
      Network: http://${ip.address()}:${PORT}
    `);
});
