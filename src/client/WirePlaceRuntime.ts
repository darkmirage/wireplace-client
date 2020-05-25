import { Vector3 } from 'three';
import type { WirePlaceScene } from 'wireplace-scene';

import WirePlaceThreeRenderer from './WirePlaceThreeRenderer';

const TICK_RATE_MS = 50;
const v = new Vector3();

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
    const now = Date.now();
    const elapsed = now - this._lastTime;

    if (elapsed >= TICK_RATE_MS) {
      this.tick += 1;
      this.update(this.tick, elapsed);
      this._lastTime = now;
    }

    if (this._running) {
      window.requestAnimationFrame(this.loop);
    }
  };

  update = (tick: number, elapsed: number) => {
    if (this.isMoving() && this.actorId) {
      const actor = this._scene.getActor(this.actorId);
      if (actor) {
        const { speed } = actor;
        v.set(0, 0, 0);

        if (this._directions[Directions.Down]) {
          v.z += 1;
        } else if (this._directions[Directions.Up]) {
          v.z -= 1;
        }

        if (this._directions[Directions.Left]) {
          v.x -= 1;
        } else if (this._directions[Directions.Right]) {
          v.x += 1;
        }

        if (this._directions[Directions.Random]) {
          v.x += Math.random() * 2.0 - 1.0;
          v.z += Math.random() * 2.0 - 1.0;
        }

        v.normalize();
        v.multiplyScalar((speed * elapsed) / 1000);
        v.x += actor.position.x;
        v.y += actor.position.y;
        v.z += actor.position.z;
        const position = { x: v.x, y: v.y, z: v.z };
        this._scene.updateActor(this.actorId, { position }, true);
      }
    }

    const diff = this._scene.retrieveDiff();
    const updates = diff.d;
    if (Object.keys(updates).length > 0) {
      this.renderer.applyUpdates(updates as any);
    }
    this.renderer.render(elapsed);
    return;
  };
}

export default WirePlaceRuntime;
