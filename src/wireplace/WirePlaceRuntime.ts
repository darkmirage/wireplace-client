import { Clock, Vector3, Quaternion, Euler } from 'three';
import { WirePlaceScene, Update } from 'wireplace-scene';

import TypedEventsEmitter, { Events } from 'wireplace/TypedEventsEmitter';
import { AnimationActions } from 'types/AnimationTypes';

const FORWARD = new Vector3(0, 0, 1);
const _v = new Vector3();
const _q = new Quaternion();
const _r = new Euler();
const _clock = new Clock();

export enum Directions {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  RANDOM = 'RANDOM',
}

interface Renderer {
  render: (
    tick: number,
    delta: number,
    updates: Record<string, Update>,
    activeActorId: string | null
  ) => void;
  cameraForward: Vector3;
  cameraRight: Vector3;
}

interface WirePlaceRuntimeProps {
  emitter: TypedEventsEmitter;
  scene: WirePlaceScene;
}

class WirePlaceRuntime {
  tick: number;
  actorId: string | null;
  _scene: WirePlaceScene;
  _running: boolean;
  _lastTime: number;
  _directions: Record<keyof typeof Directions, boolean>;
  _renderer: Renderer | null;
  _ee: TypedEventsEmitter;

  _wasMoving: boolean;
  _lastForward: Vector3;
  _lastRight: Vector3;

  constructor({ scene, emitter }: WirePlaceRuntimeProps) {
    this.tick = 0;
    this.actorId = null;
    this._running = false;
    this._lastTime = 0;
    this._scene = scene;
    this._ee = emitter;
    this._directions = {
      [Directions.UP]: false,
      [Directions.DOWN]: false,
      [Directions.LEFT]: false,
      [Directions.RIGHT]: false,
      [Directions.RANDOM]: false,
    };
    this._renderer = null;
    this._wasMoving = false;
    this._lastForward = new Vector3();
    this._lastRight = new Vector3();
    this._registerEvents();
  }

  _registerEvents() {
    this._ee.on(Events.MOVE_DOWN, (move) => this.move(Directions.DOWN, move));
    this._ee.on(Events.MOVE_UP, (move) => this.move(Directions.UP, move));
    this._ee.on(Events.MOVE_LEFT, (move) => this.move(Directions.LEFT, move));
    this._ee.on(Events.MOVE_RIGHT, (move) => this.move(Directions.RIGHT, move));
    this._ee.on(Events.TOGGLE_RANDOM_WALK, () => {
      this._directions[Directions.RANDOM] = !this._directions[
        Directions.RANDOM
      ];
    });
    this._ee.on(Events.SET_ACTIVE_ACTOR, (actorId) => this.setActor(actorId));
    this._ee.on(Events.PERFORM_ACTION, ({ actorId, actionType, loop }) => {
      if (this.actorId === actorId) {
        const action = {
          type: actionType,
          state: 1,
        };
        this._scene.updateActor(this.actorId, { action }, true);
      }
    });
  }

  _isMoving(): boolean {
    return (
      this._directions[Directions.UP] !== this._directions[Directions.DOWN] ||
      this._directions[Directions.LEFT] !==
        this._directions[Directions.RIGHT] ||
      this._directions[Directions.RANDOM]
    );
  }

  setRenderer(renderer: Renderer) {
    this._renderer = renderer;
  }

  move(direction: keyof typeof Directions, start: boolean) {
    this._directions[direction] = start;
  }

  setActor(actorId: string) {
    this.actorId = actorId;
  }

  startLoop = () => {
    this._running = true;
    this._lastTime = Date.now() - 1;
    this.loop();
  };

  stopLoop = () => {
    this._running = false;
  };

  loop = () => {
    const deltaTimeMs = _clock.getDelta();
    this.tick += 1;
    this.update(this.tick, deltaTimeMs);

    if (this._running) {
      window.requestAnimationFrame(this.loop);
    }
  };

  update = (tick: number, delta: number) => {
    if (this._renderer) {
      const diff = this._scene.retrieveDiff();
      const updates = diff.d;
      this._renderer.render(tick, delta, updates, this.actorId);
    }

    if (!this.actorId) {
      return;
    }
    const actor = this._scene.getActor(this.actorId);
    if (!actor) {
      return;
    }

    const isMoving = this._isMoving();
    const wasMoving = this._wasMoving;
    this._wasMoving = isMoving;

    if (!isMoving && wasMoving) {
      this._ee.emit(Events.SET_MOVING, false);
      const action = { type: AnimationActions.IDLE, state: -1 };
      this._scene.updateActor(this.actorId, { action }, true);
      return;
    } else if (isMoving && !wasMoving) {
      this._ee.emit(Events.SET_MOVING, true);
      if (this._renderer) {
        this._lastForward.copy(this._renderer.cameraForward);
        this._lastRight.copy(this._renderer.cameraRight);
      } else {
        this._lastForward.set(0, 0, -1);
        this._lastRight.set(1, 0, 0);
      }
    }

    if (isMoving) {
      const { speed } = actor;
      _v.set(0, 0, 0);

      if (this._directions[Directions.DOWN]) {
        _v.sub(this._lastForward);
      } else if (this._directions[Directions.UP]) {
        _v.add(this._lastForward);
      }

      if (this._directions[Directions.LEFT]) {
        _v.sub(this._lastRight);
      } else if (this._directions[Directions.RIGHT]) {
        _v.add(this._lastRight);
      }

      if (this._directions[Directions.RANDOM]) {
        _v.x += Math.random() * 2.0 - 1.0;
        _v.z += Math.random() * 2.0 - 1.0;
      }

      _v.normalize();
      _q.setFromUnitVectors(FORWARD, _v);
      _v.multiplyScalar(speed * delta);
      _v.x += actor.position.x;
      _v.y += actor.position.y;
      _v.z += actor.position.z;
      const position = { x: _v.x, y: _v.y, z: _v.z };

      _r.setFromQuaternion(_q);
      const rotation = { x: _r.x, y: _r.y, z: _r.z };

      const update: Update = { position, rotation };
      if (!wasMoving) {
        update.action = {
          type: AnimationActions.WALK,
          state: -1,
        };
      }

      this._scene.updateActor(this.actorId, update, true);
    }
  };
}

export default WirePlaceRuntime;
