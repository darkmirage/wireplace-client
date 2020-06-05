import { Clock, Vector3, Quaternion, Euler } from 'three';
import { WirePlaceScene, Update, ActorID } from 'wireplace-scene';

import TypedEventsEmitter, { Events } from 'wireplace/TypedEventsEmitter';
import { AnimationActions } from 'constants/Animation';

import { IRenderer } from './IRenderer';

const FORWARD = new Vector3(0, 0, 1);
const _v1 = new Vector3();
const _v2 = new Vector3();
const _q = new Quaternion();
const _r = new Euler();
const _clock = new Clock();

const NULL_UPDATE = {};
const FULL_UPDATE_THRESHOLD = 1.0 / 3;

export enum Directions {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  RANDOM = 'RANDOM',
}

interface WirePlaceRuntimeProps {
  emitter: TypedEventsEmitter;
  scene: WirePlaceScene;
  actorId: ActorID;
}

class GameplayRuntime {
  tick: number;
  actorId: ActorID;
  _scene: WirePlaceScene;
  _running: boolean;
  _lastTime: number;
  _directions: Record<keyof typeof Directions, boolean>;
  _renderer: IRenderer | null;
  _ee: TypedEventsEmitter;

  _wasMoving: boolean;
  _lastForward: Vector3;
  _lastRight: Vector3;
  _delayedDelta: number;

  constructor({ scene, emitter, actorId }: WirePlaceRuntimeProps) {
    this.tick = 0;
    this.actorId = actorId;
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
    this._delayedDelta = 0;
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
    this._ee.on(Events.PERFORM_ACTION, ({ actionType, actionState }) => {
      if (this.actorId) {
        const action = {
          type: actionType,
          state: actionState || 1,
        };
        this._scene.updateActor(this.actorId, { action }, true);
      }
    });
    this._ee.on(Events.SET_CAMERA_TRACKING_MODE, () => {
      this._renderer?.toggleCameraLock();
    });
    this._ee.on(Events.MOVE_TO, ({ x, y, z }) => {
      _v1.set(x, y, z);
      this.moveTo(_v1, true);
    });
    this._ee.on(Events.ANIMATION_STOPPED, ({ actorId }) => {
      if (actorId !== this.actorId) {
        return;
      }
      this._ee.emit(Events.SET_MOVING, false);
      const action = { type: AnimationActions.IDLE, state: -1 };
      this._scene.updateActor(actorId, { action }, true);
    });
    this._ee.on(Events.SET_ACTIVE_ASSET, (assetId) => {
      if (this.actorId) {
        const action = {
          type: AnimationActions.IDLE,
          state: -1,
        };
        this._scene.updateActor(this.actorId, { assetId, action }, true);
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

  setRenderer(renderer: IRenderer) {
    this._renderer = renderer;
  }

  move(direction: keyof typeof Directions, start: boolean) {
    this._directions[direction] = start;
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

  moveTo(dest: Vector3, startWalking: boolean = false) {
    if (!this.actorId) {
      return;
    }

    const actor = this._scene.getActor(this.actorId);
    if (!actor) {
      return;
    }

    const { actorId } = actor;

    let p = actor.position;
    if (this._renderer) {
      const pose = this._renderer.getRendererPose(actorId);
      p = pose ? pose.position : p;
    }

    _v2.set(p.x, p.y, p.z);
    _v2.sub(dest).multiplyScalar(-1).normalize();
    _q.setFromUnitVectors(FORWARD, _v2);
    _r.setFromQuaternion(_q);

    this.translate(dest, _r, startWalking);
  }

  translate(dest: Vector3, r: Euler, startWalking: boolean = false) {
    if (!this.actorId) {
      return;
    }

    const position = { x: dest.x, y: dest.y, z: dest.z };
    const rotation = { x: r.x, y: r.y, z: r.z };

    const update: Update = { position, rotation };
    if (startWalking) {
      update.action = {
        type: AnimationActions.WALK,
        state: -1,
      };
    }

    this._scene.updateActor(this.actorId, update, true);
  }

  update = (tick: number, delta: number) => {
    const fullDelta = delta + this._delayedDelta;
    const fullUpdate = fullDelta >= FULL_UPDATE_THRESHOLD;
    this._delayedDelta += delta;
    if (fullUpdate) {
      this._delayedDelta = 0;
    }

    if (this._renderer) {
      const updates = fullUpdate ? this._scene.retrieveDiff().d : NULL_UPDATE;
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

    const { actorId, speed } = actor;

    let p = actor.position;
    if (this._renderer) {
      const pose = this._renderer.getRendererPose(actorId);
      p = pose ? pose.position : p;
    }

    if (isMoving && !wasMoving) {
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
      // Move randomly in a 10m x 10m square
      if (this._directions[Directions.RANDOM]) {
        if (tick % 100 === 0 || !wasMoving) {
          _v1.x = Math.random() * 10.0 - 5.0;
          _v1.z = Math.random() * 10.0 - 5.0;
          _v2.set(p.x, p.y, p.z);
          _v2.sub(_v1).multiplyScalar(-1).normalize();
          _q.setFromUnitVectors(FORWARD, _v2);
          _r.setFromQuaternion(_q);
          this.translate(_v1, _r, true);
        }
        return;
      }

      _v1.set(0, 0, 0);
      if (this._directions[Directions.DOWN]) {
        _v1.sub(this._lastForward);
      } else if (this._directions[Directions.UP]) {
        _v1.add(this._lastForward);
      }

      if (this._directions[Directions.LEFT]) {
        _v1.sub(this._lastRight);
      } else if (this._directions[Directions.RIGHT]) {
        _v1.add(this._lastRight);
      }

      _v1.normalize();
      _q.setFromUnitVectors(FORWARD, _v1);
      _v1.multiplyScalar(speed * fullDelta);

      _v1.x += p.x;
      _v1.y += p.y;
      _v1.z += p.z;

      _r.setFromQuaternion(_q);
      this.translate(_v1, _r, !wasMoving);
    }
  };
}

export default GameplayRuntime;
