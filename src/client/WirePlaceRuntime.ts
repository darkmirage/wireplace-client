import type { WirePlaceScene } from 'wireplace-scene';

import WirePlaceThreeRenderer from "./WirePlaceThreeRenderer";

class WirePlaceRuntime {
  renderer: WirePlaceThreeRenderer;
  tick: number;
  _scene: WirePlaceScene;
  _running: boolean;
  _lastTime: number;

  constructor(renderer: WirePlaceThreeRenderer, scene: WirePlaceScene) {
    this.renderer = renderer;
    this.tick = 0;
    this._running = false;
    this._lastTime = 0;
    this._scene = scene;
  }

  startLoop = () => {
    this._running = true;
    this._lastTime = Date.now() - 1;
    this.loop();
  }

  stopLoop = () => {
    this._running = false;
  }

  loop = () => {
    this.tick += 1;
    const now = Date.now();
    const elapsed = now - this._lastTime;
    this._lastTime = now;
    this.update(this.tick, elapsed);

    if (this._running) {
      window.requestAnimationFrame(this.loop);
    }
  }

  update = (tick: number, elapsed: number) => {
    const diff = this._scene.retrieveDiff();
    const updates = diff.d;
    if (Object.keys(updates).length > 0) {
      this.renderer.applyUpdates((updates as any));
    }
    this.renderer.render(elapsed);
    return;
  }
}

export default WirePlaceRuntime;