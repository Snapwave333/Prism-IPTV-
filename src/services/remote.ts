import { usePlayerStore } from '../stores/usePlayerStore';

type RemoteMessage = {
  type: 'PLAY' | 'PAUSE' | 'VOLUME' | 'MUTE' | 'SEEK' | 'CHANNEL' | 'WELCOME';
  payload?: any;
};

class RemoteControlService {
  private ws: WebSocket | null = null;
  private readonly reconnectInterval: number = 3000;
  private readonly url: string = `ws://${globalThis.location?.hostname || 'localhost'}:3001`; // Dynamic host support

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Connected to Remote Server');
    };

    this.ws.onmessage = (event) => {
      try {
        const data: RemoteMessage = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (e) {
        console.error('Invalid remote message', e);
      }
    };

    this.ws.onclose = () => {
      console.log('Remote disconnected, reconnecting...');
      setTimeout(() => this.connect(), this.reconnectInterval);
    };

    this.ws.onerror = (err) => {
      console.error('Remote WebSocket error', err);
      this.ws?.close();
    };
  }

  private handleMessage(msg: RemoteMessage) {
    const store = usePlayerStore.getState();
    
    switch (msg.type) {
        case 'PLAY':
            store.play();
            break;
        case 'PAUSE':
            store.pause();
            break;
        case 'VOLUME':
            if (typeof msg.payload === 'number') store.setVolume(msg.payload);
            break;
        case 'MUTE':
            store.toggleMute();
            break;
        case 'SEEK':
            if (typeof msg.payload === 'number') store.seekTo(msg.payload);
            break;
        case 'CHANNEL':
            if (typeof msg.payload === 'string') store.setUrl(msg.payload);
            break;
        case 'WELCOME':
            console.log('Remote Server:', msg.payload);
            break;
    }
  }

  send(msg: RemoteMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }
}

export const remoteService = new RemoteControlService();
