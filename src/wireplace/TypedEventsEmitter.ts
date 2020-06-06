import { EventEmitter } from 'events';

import { AnimationAction } from 'constants/Animation';
import { ActorID } from 'wireplace-scene';

export enum Events {
  ANIMATION_STOPPED,
  FOCUS_CHAT,
  MOUSE_LEAVE,
  MOUSE_MOVE,
  MOUSE_UP,
  MOVE_DOWN,
  MOVE_LEFT,
  MOVE_RIGHT,
  MOVE_TO,
  MOVE_UP,
  PERFORM_ACTION,
  SET_ACTIVE_ACTOR,
  SET_ACTIVE_ASSET,
  SET_CAMERA_TRACKING_MODE,
  SET_MOVING,
  TOGGLE_RANDOM_WALK,
  WINDOW_RESIZE,
  SPAWN_PROP,
  MOVE_PROP,
  SET_TRANSFORM_MODE,
  SET_TRANSFORM_ENABLED,
}

type ValueOf<T> = T[keyof T];
export type Event = ValueOf<typeof Event>;

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
  [Events.MOVE_PROP]: { actorId: ActorID; position: XYZ; rotation: XYZ };
  [Events.SET_TRANSFORM_MODE]: 'translate' | 'rotate' | 'scale';
  [Events.SET_TRANSFORM_ENABLED]: boolean;
}

interface GenericTypedEventEmitter<P> {
  on<E extends keyof P>(event: E, listener: (payload: P[E]) => void): void;
  off<E extends keyof P>(event: E, listener: (payload: P[E]) => void): void;
  emit<E extends keyof P>(event: E, payload: P[E]): void;
}

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
  }
}

const singleton = new TypedEventsEmitter();

export function getGlobalEmitter(): TypedEventsEmitter {
  return singleton;
}

export default TypedEventsEmitter;
