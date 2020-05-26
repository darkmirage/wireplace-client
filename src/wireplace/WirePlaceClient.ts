import { WirePlaceScene, deserializeDiff } from 'wireplace-scene';
import socketClusterClient from 'socketcluster-client';
import type { AGClientSocket } from 'socketcluster-client';
import type { KeyboardEvent } from 'react';

import { AnimationActions } from 'types/AnimationTypes';
import TypedEventsEmitter, { Events } from 'wireplace/TypedEventsEmitter';
import WirePlaceRuntime from './WirePlaceRuntime';

export interface ChatLine {
  lineId: number;
  time: number;
  username: string;
  message: string;
}

type ChatCallback = (line: ChatLine) => void;

interface WirePlaceClientProps {
  emitter: TypedEventsEmitter;
  scene: WirePlaceScene;
  runtime: WirePlaceRuntime;
  username: string;
  token: string;
  hostname: string;
  port: number;
}

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
  _ee: TypedEventsEmitter;

  constructor({
    emitter,
    scene,
    runtime,
    username,
    token,
    hostname = 'localhost',
    port = 8000,
  }: WirePlaceClientProps) {
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
    this._ee = emitter;
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
    this._ee.emit(Events.SET_ACTIVE_ACTOR, actorId);
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
        this._ee.emit(Events.MOVE_UP, true);
        break;
      }
      case 'ArrowDown': {
        this._ee.emit(Events.MOVE_DOWN, true);
        break;
      }
      case 'ArrowLeft': {
        this._ee.emit(Events.MOVE_LEFT, true);
        break;
      }
      case 'ArrowRight': {
        this._ee.emit(Events.MOVE_RIGHT, true);
        break;
      }
    }
  };

  handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp': {
        this._ee.emit(Events.MOVE_UP, false);
        break;
      }
      case 'ArrowDown': {
        this._ee.emit(Events.MOVE_DOWN, false);
        break;
      }
      case 'ArrowLeft': {
        this._ee.emit(Events.MOVE_LEFT, false);
        break;
      }
      case 'ArrowRight': {
        this._ee.emit(Events.MOVE_RIGHT, false);
        break;
      }
      case 's': {
        this._ee.emit(Events.TOGGLE_RANDOM_WALK);
        break;
      }
      case '1': {
        if (this.runtime.actorId) {
          this._ee.emit(Events.PERFORM_ACTION, {
            actorId: this.runtime.actorId,
            actionType: AnimationActions.DANCE_SAMBA,
          });
        }
      }
    }
  };
}

export default WirePlaceClient;
