import { WirePlaceScene, deserializeDiff } from 'wireplace-scene';
import socketClusterClient from 'socketcluster-client';
import type { AGClientSocket } from 'socketcluster-client';
import type { KeyboardEvent } from 'react';

import { AnimationAction, AnimationActions } from 'types/AnimationTypes';
import TypedEventsEmitter, { Events } from 'wireplace/TypedEventsEmitter';
import WirePlaceRuntime from './WirePlaceRuntime';

export interface ChatLine {
  color: number;
  lineId: number;
  message: string;
  time: number;
  username: string;
}

type ChatCallback = (line: ChatLine) => void;
type ActorID = string;

interface WirePlaceClientProps {
  emitter: TypedEventsEmitter;
  scene: WirePlaceScene;
  runtime: WirePlaceRuntime;
  username: string;
  token: string;
  hostname: string;
  port: number;
}

interface UserInfo {
  actorId: ActorID;
  username: string;
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
  _userCache: Record<string, UserInfo>;

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
    this._userCache = {};
    this._resetCache();
    (window as any).client = this;
  }

  _resetCache() {
    this._userCache = {};
    this.scene.clear();
  }

  _performAction(actionType: AnimationAction) {
    if (this.runtime.actorId) {
      this._ee.emit(Events.PERFORM_ACTION, {
        actorId: this.runtime.actorId,
        actionType,
      });
    }
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

  fetchUsersInfo = async (
    actorIds: Array<ActorID>
  ): Promise<Record<ActorID, UserInfo>> => {
    const query: Array<ActorID> = [];
    const result: Record<ActorID, UserInfo> = {};

    for (const actorId of actorIds) {
      const user = this._userCache[actorId];
      if (user) {
        result[actorId] = user;
      } else {
        query.push(actorId);
      }
    }

    const additionalResults: Record<
      ActorID,
      UserInfo
    > = await this.socket.invoke('user', query);
    Object.assign(result, additionalResults);
    Object.assign(this._userCache, additionalResults);

    return result;
  };

  fetchUserInfo = async (actorId: ActorID): Promise<UserInfo | null> => {
    if (actorId in this._userCache) {
      return this._userCache[actorId];
    }
    const user = await this.socket.invoke('user', actorId);
    if (user) {
      this._userCache[actorId] = user;
    }
    return user;
  };

  disconnect() {
    console.log('[Client] Disconnect');
    this.socket.closeAllChannels();
    this._resetCache();
  }

  async join() {
    const username = this._username;
    const token = this._token;

    const actorId: ActorID = await this.socket.invoke('join', {
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
        this._resetCache();
        this._unsubscribe();
        lastSeen = Date.now();
      }
    })();

    // Listen for reconnections
    (async () => {
      for await (let info of this.socket.listener('connect')) {
        console.log(`[Client] Connected in ${Date.now() - lastSeen}ms`);
        this._resetCache();
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
        this._performAction(AnimationActions.WAVE);
        break;
      }
      case '2': {
        this._performAction(AnimationActions.CLAP);
        break;
      }
      case '3': {
        this._performAction(AnimationActions.BOW);
        break;
      }
      case '4': {
        this._performAction(AnimationActions.DANCE_SAMBA);
        break;
      }
      case '5': {
        this._performAction(AnimationActions.DANCE_HIP_HOP);
        break;
      }
      case '6': {
        this._performAction(AnimationActions.GOLF_DRIVE);
        break;
      }
      case '7': {
        this._performAction(AnimationActions.SALUTE);
        break;
      }
      case '8': {
        this._performAction(AnimationActions.CRY);
        break;
      }
      case '9': {
        this._performAction(AnimationActions.DIE);
        break;
      }
      case 'Escape': {
        this._performAction(AnimationActions.IDLE);
        break;
      }
    }
  };
}

export default WirePlaceClient;
