import { EventEmitter } from 'events';

import { AnimationAction } from 'types/AnimationTypes';

export enum Events {
  FOCUS_CHAT,
  MOVE_DOWN,
  MOVE_LEFT,
  MOVE_RIGHT,
  MOVE_UP,
  PERFORM_ACTION,
  SET_ACTIVE_ACTOR,
  TOGGLE_RANDOM_WALK,
  SET_MOVING,
}

type ValueOf<T> = T[keyof T];
export type Event = ValueOf<typeof Event>;

interface EventPayloads {
  [Events.FOCUS_CHAT]: boolean;
  [Events.MOVE_DOWN]: boolean;
  [Events.MOVE_LEFT]: boolean;
  [Events.MOVE_RIGHT]: boolean;
  [Events.MOVE_UP]: boolean;
  [Events.SET_ACTIVE_ACTOR]: string;
  [Events.SET_MOVING]: boolean;
  [Events.TOGGLE_RANDOM_WALK]: undefined;
  [Events.PERFORM_ACTION]: {
    actorId: string;
    actionType: AnimationAction;
    loop?: boolean;
  };
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
