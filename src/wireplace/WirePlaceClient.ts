import { WirePlaceScene, deserializeDiff, Update } from 'wireplace-scene';
import socketClusterClient from 'socketcluster-client';
import type { AGClientSocket } from 'socketcluster-client';

import logger from 'utils/logger';
import TypedEventsEmitter, { Events } from 'wireplace/TypedEventsEmitter';
import GameplayRuntime from './GameplayRuntime';

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
  runtime: GameplayRuntime;
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

const UPDATE_FPS = 3;

class WirePlaceClient implements WirePlaceChatClient {
  socket: AGClientSocket;
  scene: WirePlaceScene;
  runtime: GameplayRuntime;
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
    logger.log('[Client]', hostname, port);
    (window as any).client = this;
  }

  _resetCache() {
    this._userCache = {};
    this.scene.clear();
  }

  // This is a hack to send updates on the current actor to the server at a fixed refresh rate
  _trackMainActor(actorId: ActorID) {
    let update: Update = {};
    this._unsubscribe = this.scene.onActorUpdate(actorId, (u) => {
      Object.assign(update, u);
    });

    setInterval(() => {
      if (Object.keys(update).length > 0) {
        this.socket.transmit('move', update);
        update = {};
      }
    }, 1000 / UPDATE_FPS);
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
    logger.log('[Client] Disconnect');
    this.socket.closeAllChannels();
    this._resetCache();
  }

  async join() {
    const username = this._username;
    const token = this._token;

    const actorId: ActorID = await this.socket.invoke('join', {
      username,
      token,
      channel: 'wireplace',
    });
    this._ee.emit(Events.SET_ACTIVE_ACTOR, actorId);
    logger.log(`[Client] Logged in as ${username}`);

    this._trackMainActor(actorId);
  }

  joinAudio = async (): Promise<string> => {
    const username = this._username;
    const token = this._token;
    const audioToken: ActorID = await this.socket.invoke('joinAudio', {
      username,
      token,
      channel: 'wireplace',
    });
    logger.log(`[Client] Joined audio with token: ${audioToken}`);
    return audioToken;
  };

  async connect() {
    let lastSeen = Date.now();

    // Listen for disconnects
    (async () => {
      for await (let { code, reason } of this.socket.listener('connectAbort')) {
        logger.error('[Client] Connection aborted', code, reason);
        this._resetCache();
        this._unsubscribe();
        lastSeen = Date.now();
      }
    })();

    // Listen for reconnections
    (async () => {
      for await (let info of this.socket.listener('connect')) {
        logger.log(`[Client] Connected in ${Date.now() - lastSeen}ms`);
        this._resetCache();
        await this.join();
        logger.log('[Client] Connection info:', info);
        const diffRaw = await this.socket.invoke('sync', {});
        const diff = deserializeDiff(diffRaw);
        logger.log('[Client] Initial diff:', diff);
        this.scene.applyDiff(diff);
      }
    })();

    lastSeen = Date.now();
    this.socket.connect();

    (async () => {
      const channel = this.socket.subscribe('update');
      for await (let data of channel) {
        this.scene.applySerializedDiff(data, this.runtime.actorId);
      }
    })();
  }
}

export default WirePlaceClient;
