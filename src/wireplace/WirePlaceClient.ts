import axios from 'axios';
import {
  IScene,
  deserializeDiff,
  Update,
  WirePlaceSceneSerialized,
} from 'wireplace-scene';
import socketClusterClient from 'socketcluster-client';
import { AGClientSocket } from 'socketcluster-client';

import logger from 'utils/logger';
import TypedEventsEmitter, { Events } from 'wireplace/TypedEventsEmitter';
import firebase from 'firebaseApp';

export interface ChatLine {
  color: number;
  lineId: number;
  message: string;
  time: number;
  username: string;
}

type ServerAuthResponse = 'SUCCESS' | 'NEW_USER' | 'ON_WAITLIST' | 'FAILURE';

type ChatCallback = (line: ChatLine) => void;
type ActorID = string;

interface WirePlaceClientProps {
  emitter: TypedEventsEmitter;
  scene: IScene<WirePlaceSceneSerialized>;
  hostname: string;
  port: number;
  roomId: string;
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
  roomId: string;
  scene: IScene<WirePlaceSceneSerialized>;
  socket: AGClientSocket;

  _username: string | null;
  _hostname: string;
  _port: number;
  _actorId: string | null;
  _ee: TypedEventsEmitter;
  _unsubscribe: () => void;
  _userCache: Record<string, UserInfo>;

  constructor({
    emitter,
    hostname,
    port,
    roomId,
    scene,
  }: WirePlaceClientProps) {
    this.socket = socketClusterClient.create({
      hostname,
      port,
      autoConnect: false,
    });
    this._hostname = hostname;
    this._port = port;
    this._username = null;
    this._actorId = null;
    this._ee = emitter;
    this._unsubscribe = () => {};
    this._userCache = {};
    this.roomId = roomId;
    this.scene = scene;
    this._resetCache();

    this._ee.on(Events.SPAWN_PROP, this.spawnProp);
    this._ee.on(Events.MOVE_PROP, ({ actorId, rotation, position }) => {
      this.socket.transmit('move', { actorId, update: { rotation, position } });
    });
    this._ee.on(Events.REMOVE_PROP, this.removeProp);

    logger.log('[Client]', {
      hostname,
      port,
      roomId,
      sceneVersion: scene.version,
    });
    (window as any).client = this;
  }

  _resetCache() {
    this._userCache = {};
    this.scene.clear();
  }

  // This is a hack to send updates on the current actor to the server at a fixed refresh rate
  _trackMainActor() {
    let update: Update = {};
    this._unsubscribe = this.scene.onActorUpdate(
      this.getActorIDOrThrow(),
      (u) => {
        Object.assign(update, u);
      }
    );

    setInterval(() => {
      if (Object.keys(update).length > 0) {
        this.socket.transmit('move', { actorId: this._actorId, update });
        update = {};
      }
    }, 1000 / UPDATE_FPS);
  }

  saveScene(): string {
    return JSON.stringify(
      Object.values(this.scene.retrieveDiff(true).d)
        .map((actor) => {
          const { assetId, rotation, position } = actor;
          if (
            assetId! < 1000 ||
            (position!.x === 0 && position!.y === 0 && position!.z === 0)
          ) {
            return null;
          }
          return {
            assetId,
            position,
            rotation,
            movable: true,
          };
        })
        .filter(Boolean)
    );
  }

  spawnProp = (assetId: number) => {
    this.socket.invoke('spawn', { assetId, roomId: this.roomId });
  };

  removeProp = (actorId: ActorID) => {
    this.socket.invoke('remove', { actorId, roomId: this.roomId });
  };

  async _refreshToken(): Promise<ServerAuthResponse> {
    const user = await this.getUserOrThrow();
    try {
      const firebaseToken = await user.getIdToken();
      const res = await axios.post(
        `${window.location.protocol}//${this._hostname}:${this._port}/login`,
        {},
        {
          headers: {
            Authorization: `Bearer ${firebaseToken}`,
          },
        }
      );
      const { token, error } = res.data;
      if (!token) {
        return error;
      }
      localStorage.setItem('socketcluster.authToken', token);
    } catch (e) {
      localStorage.removeItem('socketcluster.authToken');
      logger.error(e.message);
      return 'FAILURE';
    }
    logger.log(`[Client] Logged in as ${user.uid}`);
    return 'SUCCESS';
  }

  getActorIDOrThrow(): ActorID {
    if (this._actorId) {
      return this._actorId;
    }
    throw new Error('Can only be called after a successful join');
  }

  getUsernameOrThrow(): string {
    if (this._username) {
      return this._username;
    }
    throw new Error('Can only be called after a successful join');
  }

  sendMessage(message: string) {
    this.socket.transmit('say', message);
  }

  onMessage(callback: ChatCallback): Function {
    const channel = this.socket.subscribe('said:' + this.roomId);
    const startListeniing = async () => {
      for await (let line of channel) {
        callback(line);
      }
    };
    this.socket
      .invoke('getChatHistory', {})
      .then((lines) => lines.forEach(callback))
      .then(startListeniing);
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
    this._actorId = null;
    this._username = null;
    this.socket.closeAllChannels();
    this._resetCache();
  }

  async getUserOrThrow(): Promise<firebase.User> {
    const { currentUser } = firebase.auth();
    if (!currentUser) {
      throw new Error('[Client] Invalid Firebase auth');
    }
    return currentUser;
  }

  async join() {
    const {
      actorId,
      username,
    }: { actorId: ActorID; username: string } = await this.socket.invoke(
      'join',
      {
        roomId: this.roomId,
      }
    );

    this._username = username;
    this._actorId = actorId;
    this._ee.emit(Events.SET_ACTIVE_ACTOR, actorId);
    logger.log(`[Client] Joined #${this.roomId} as Actor ${actorId}`);
    this._trackMainActor();
  }

  joinAudio = async (): Promise<string> => {
    const audioToken: ActorID = await this.socket.invoke('joinAudio', {
      roomId: this.roomId,
    });
    logger.log(`[Client] Joined audio with token: ${audioToken}`);
    return audioToken;
  };

  async connect(): Promise<ServerAuthResponse> {
    const result = await this._refreshToken();
    if (result !== 'SUCCESS') {
      return result;
    }
    let lastSeen = Date.now();

    // Listen for disconnects
    (async () => {
      for await (let { code, reason } of this.socket.listener('connectAbort')) {
        logger.error('[Client] Connection aborted', code, reason);
        this._resetCache();
        this._unsubscribe();
        lastSeen = Date.now();
        firebase
          .analytics()
          .logEvent('client_disconnected', {
            roomId: this.roomId,
            actorId: this._actorId,
          });
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
        firebase
          .analytics()
          .logEvent('client_connected', {
            roomId: this.roomId,
            actorId: this._actorId,
          });
      }
    })();

    lastSeen = Date.now();
    this.socket.connect();

    (async () => {
      const channel = this.socket.subscribe('update:' + this.roomId);
      for await (let data of channel) {
        this.scene.applySerializedDiff(data);
      }
    })();

    return result;
  }
}

export default WirePlaceClient;
