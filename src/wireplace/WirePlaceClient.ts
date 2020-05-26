import { WirePlaceScene, deserializeDiff } from 'wireplace-scene';
import socketClusterClient from 'socketcluster-client';
import type { AGClientSocket } from 'socketcluster-client';
import type { KeyboardEvent } from 'react';

import WirePlaceRuntime, { Directions } from './WirePlaceRuntime';

export interface ChatLine {
  lineId: number;
  time: number;
  username: string;
  message: string;
}

type ChatCallback = (line: ChatLine) => void;

export interface WirePlaceChatClient {
  sendMessage: (message: string) => void;
  onMessage: (callback: ChatCallback) => Function;
  fetchMessages: () => Promise<Array<ChatLine>>;
}

const UPDATE_FPS = 30;

class WirePlaceClient implements WirePlaceChatClient {
  socket: AGClientSocket;
  scene: WirePlaceScene;
  runtime: WirePlaceRuntime;
  _username: string;
  _token: string;
  _unsubscribe: () => void;

  constructor(
    scene: WirePlaceScene,
    runtime: WirePlaceRuntime,
    username: string,
    token: string,
    hostname: string = 'localhost',
    port: number = 8000
  ) {
    this.socket = socketClusterClient.create({
      hostname,
      port,
      autoConnect: false,
    });
    this.scene = scene;
    this.runtime = runtime;
    this._username = username;
    this._token = token;
    this._unsubscribe = () => {};
    (window as any).client = this;
  }

  sendMessage(message: string) {
    this.socket.transmit('say', message);
  }

  onMessage(callback: ChatCallback): Function {
    const channel = this.socket.subscribe('said');

    (async () => {
      for await (let line of channel) {
        callback(line);
      }
    })();

    return () => {
      channel.unsubscribe();
    };
  }

  async fetchMessages(): Promise<Array<ChatLine>> {
    return [];
  }

  disconnect() {
    console.log('[Client] Disconnect');
    this.socket.closeAllChannels();
  }

  async join() {
    const username = this._username;
    const token = this._token;

    const actorId: string = await this.socket.invoke('join', {
      username,
      token,
    });
    this.runtime.setActor(actorId);
    console.log(`[Client] Logged in as ${username}`);

    let lastSent = Date.now();
    this._unsubscribe = this.scene.onActorUpdate(actorId, (update) => {
      if (Date.now() - lastSent >= 1000 / UPDATE_FPS) {
        this.socket.transmit('move', update);
        lastSent = Date.now();
      }
    });
  }

  async connect() {
    let lastSeen = Date.now();

    // Listen for disconnects
    (async () => {
      for await (let { code, reason } of this.socket.listener('connectAbort')) {
        console.error('[Client] Connection aborted', code, reason);
        this.scene.clear();
        this._unsubscribe();
        lastSeen = Date.now();
      }
    })();

    // Listen for reconnections
    (async () => {
      for await (let info of this.socket.listener('connect')) {
        console.log(`[Client] Connected in ${Date.now() - lastSeen}ms`);
        this.scene.clear();
        await this.join();
        console.log('[Client] Connection info:', info);
        const diffRaw = await this.socket.invoke('sync', {});
        const diff = deserializeDiff(diffRaw);
        console.log('[Client] Initial diff:', diff);
        this.scene.applyDiff(diff);
      }
    })();

    lastSeen = Date.now();
    this.socket.connect();

    (async () => {
      const channel = this.socket.subscribe('update');
      for await (let data of channel) {
        this.scene.applySerializedDiff(
          data,
          this.runtime.isMoving() ? this.runtime.actorId : null
        );
      }
    })();
  }

  handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp': {
        this.runtime.move(Directions.UP, true);
        break;
      }
      case 'ArrowDown': {
        this.runtime.move(Directions.DOWN, true);
        break;
      }
      case 'ArrowLeft': {
        this.runtime.move(Directions.LEFT, true);
        break;
      }
      case 'ArrowRight': {
        this.runtime.move(Directions.RIGHT, true);
        break;
      }
    }
  };

  handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp': {
        this.runtime.move(Directions.UP, false);
        break;
      }
      case 'ArrowDown': {
        this.runtime.move(Directions.DOWN, false);
        break;
      }
      case 'ArrowLeft': {
        this.runtime.move(Directions.LEFT, false);
        break;
      }
      case 'ArrowRight': {
        this.runtime.move(Directions.RIGHT, false);
        break;
      }
      case 's': {
        this.runtime.toggleRandom();
        break;
      }
    }
  };
}

export default WirePlaceClient;
