import { EventEmitter } from 'events';

export enum Events {
  MOVE_DOWN = 'MOVE_DOWN',
  MOVE_LEFT = 'MOVE_LEFT',
  MOVE_RIGHT = 'MOVE_RIGHT',
  MOVE_UP = 'MOVE_UP',
  SET_ACTIVE_ACTOR = 'SET_ACTIVE_ACTOR',
  TOGGLE_RANDOM_WALK = 'TOGGLE_RANDOM_WALK',
}

type Event = keyof typeof Events;

interface EventPayloads {
  [Events.MOVE_DOWN]: boolean;
  [Events.MOVE_LEFT]: boolean;
  [Events.MOVE_RIGHT]: boolean;
  [Events.MOVE_UP]: boolean;
  [Events.SET_ACTIVE_ACTOR]: string;
  [Events.TOGGLE_RANDOM_WALK]: undefined;
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
    this._ee.on(event, listener);
  }

  off<E extends keyof EventPayloads>(
    event: E,
    listener: (payload: EventPayloads[E]) => void
  ): void {
    this._ee.off(event, listener);
  }

  emit<K extends keyof EventPayloads>(event: K, payload?: EventPayloads[K]) {
    this._ee.emit(event, payload);
  }
}

export default TypedEventsEmitter;
