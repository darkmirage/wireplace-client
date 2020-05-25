import { Clock, Vector3, Quaternion, Euler } from 'three';
import type { WirePlaceScene } from 'wireplace-scene';

import WirePlaceThreeRenderer from './WirePlaceThreeRenderer';

const FORWARD = new Vector3(0, 0, 1);
const _v = new Vector3();
const _q = new Quaternion();
const _r = new Euler();
const _clock = new Clock();

export enum Directions {
  Up = 'Up',
  Down = 'Down',
  Left = 'Left',
  Right = 'Right',
  Random = 'Random',
}

class WirePlaceRuntime {
  renderer: WirePlaceThreeRenderer;
  tick: number;
  actorId: string | null;
  _scene: WirePlaceScene;
  _running: boolean;
  _lastTime: number;
  _directions: Record<keyof typeof Directions, boolean>;

  constructor(renderer: WirePlaceThreeRenderer, scene: WirePlaceScene) {
    this.renderer = renderer;
    this.tick = 0;
    this.actorId = null;
    this._running = false;
    this._lastTime = 0;
    this._scene = scene;
    this._directions = {
      [Directions.Up]: false,
      [Directions.Down]: false,
      [Directions.Left]: false,
      [Directions.Right]: false,
      [Directions.Random]: false,
    };
  }

  isMoving(): boolean {
    return (
      this._directions[Directions.Up] !== this._directions[Directions.Down] ||
      this._directions[Directions.Left] !==
        this._directions[Directions.Right] ||
      this._directions[Directions.Random]
    );
  }

  move(direction: keyof typeof Directions, start: boolean) {
    this._directions[direction] = start;
  }

  toggleRandom() {
    this._directions[Directions.Random] = !this._directions[Directions.Random];
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
    if (this.isMoving() && this.actorId) {
      const actor = this._scene.getActor(this.actorId);
      if (actor) {
        const { speed } = actor;
        _v.set(0, 0, 0);

        if (this._directions[Directions.Down]) {
          _v.z += 1;
        } else if (this._directions[Directions.Up]) {
          _v.z -= 1;
        }

        if (this._directions[Directions.Left]) {
          _v.x -= 1;
        } else if (this._directions[Directions.Right]) {
          _v.x += 1;
        }

        if (this._directions[Directions.Random]) {
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

        this._scene.updateActor(this.actorId, { position, rotation }, true);
      }
    }

    const diff = this._scene.retrieveDiff();
    const updates = diff.d;
    if (Object.keys(updates).length > 0) {
      this.renderer.applyUpdates(updates as any);
    }
    this.renderer.render(delta);
    return;
  };
}

export default WirePlaceRuntime;
