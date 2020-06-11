import { EventEmitter } from 'events';

import { AnimationAction } from 'constants/Animation';
import { ActorID } from 'wireplace-scene';
import firebase from 'firebaseApp';

export enum Events {
  ANIMATION_STOPPED = 'ANIMATION_STOPPED',
  FOCUS_CHAT = 'FOCUS_CHAT',
  MOUSE_LEAVE = 'MOUSE_LEAVE',
  MOUSE_MOVE = 'MOUSE_MOVE',
  MOUSE_UP = 'MOUSE_UP',
  MOVE_DOWN = 'MOVE_DOWN',
  MOVE_LEFT = 'MOVE_LEFT',
  MOVE_RIGHT = 'MOVE_RIGHT',
  MOVE_TO = 'MOVE_TO',
  MOVE_UP = 'MOVE_UP',
  PERFORM_ACTION = 'PERFORM_ACTION',
  SET_ACTIVE_ACTOR = 'SET_ACTIVE_ACTOR',
  SET_ACTIVE_ASSET = 'SET_ACTIVE_ASSET',
  SET_CAMERA_TRACKING_MODE = 'SET_CAMERA_TRACKING_MODE',
  SET_MOVING = 'SET_MOVING',
  TOGGLE_RANDOM_WALK = 'TOGGLE_RANDOM_WALK',
  WINDOW_RESIZE = 'WINDOW_RESIZE',
  SPAWN_PROP = 'SPAWN_PROP',
  REMOVE_PROP = 'REMOVE_PROP',
  MOVE_PROP = 'MOVE_PROP',
  SET_TRANSFORM_MODE = 'SET_TRANSFORM_MODE',
  SET_TRANSFORM_ENABLED = 'SET_TRANSFORM_ENABLED',
  DELETION_REQUEST = 'DELETION_REQUEST',
}

type ValueOf<T> = T[keyof T];
export type Event = ValueOf<typeof Events>;

type PointerEvent = {
  x: number;
  y: number;
};

type XYZ = {
  x: number;
  y: number;
  z: number;
};

type AssetID = number;

interface EventPayloads {
  [Events.ANIMATION_STOPPED]: { actorId: ActorID; actionType: AnimationAction };
  [Events.FOCUS_CHAT]: boolean;
  [Events.MOUSE_LEAVE]: void;
  [Events.MOUSE_MOVE]: PointerEvent;
  [Events.MOUSE_UP]: PointerEvent;
  [Events.MOVE_DOWN]: boolean;
  [Events.MOVE_LEFT]: boolean;
  [Events.MOVE_RIGHT]: boolean;
  [Events.MOVE_TO]: XYZ;
  [Events.MOVE_UP]: boolean;
  [Events.SET_ACTIVE_ACTOR]: ActorID;
  [Events.SET_ACTIVE_ASSET]: number;
  [Events.SET_CAMERA_TRACKING_MODE]: void;
  [Events.SET_MOVING]: boolean;
  [Events.TOGGLE_RANDOM_WALK]: undefined;
  [Events.PERFORM_ACTION]: {
    actionType: AnimationAction;
    actionState?: number;
  };
  [Events.WINDOW_RESIZE]: void;
  [Events.SPAWN_PROP]: AssetID;
  [Events.REMOVE_PROP]: ActorID;
  [Events.MOVE_PROP]: { actorId: ActorID; position: XYZ; rotation: XYZ };
  [Events.SET_TRANSFORM_MODE]: 'translate' | 'rotate' | 'scale';
  [Events.SET_TRANSFORM_ENABLED]: boolean;
  [Events.DELETION_REQUEST]: void;
}

interface GenericTypedEventEmitter<P> {
  on<E extends keyof P>(event: E, listener: (payload: P[E]) => void): void;
  off<E extends keyof P>(event: E, listener: (payload: P[E]) => void): void;
  emit<E extends keyof P>(event: E, payload: P[E]): void;
}

const LOGGED_EVENTS: Event[] = [
  Events.FOCUS_CHAT,
  Events.PERFORM_ACTION,
  Events.SET_ACTIVE_ASSET,
  Events.SET_CAMERA_TRACKING_MODE,
  Events.SET_TRANSFORM_MODE,
  Events.SET_TRANSFORM_ENABLED,
];

class TypedEventsEmitter implements GenericTypedEventEmitter<EventPayloads> {
  _ee: EventEmitter;

  constructor() {
    this._ee = new EventEmitter();
  }

  on<E extends keyof EventPayloads>(
    event: E,
    listener: (payload: EventPayloads[E]) => void
  ): void {
    this._ee.on(event.toString(), listener);
  }

  off<E extends keyof EventPayloads>(
    event: E,
    listener: (payload: EventPayloads[E]) => void
  ): void {
    this._ee.off(event.toString(), listener);
  }

  emit<K extends keyof EventPayloads>(event: K, payload?: EventPayloads[K]) {
    this._ee.emit(event.toString(), payload);
    if (LOGGED_EVENTS.includes(event)) {
      firebase
        .analytics()
        .logEvent(event.toString(), { payload: JSON.stringify(payload) });
    }
  }
}

const singleton = new TypedEventsEmitter();

export function getGlobalEmitter(): TypedEventsEmitter {
  return singleton;
}

export default TypedEventsEmitter;
