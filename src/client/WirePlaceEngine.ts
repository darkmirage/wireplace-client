import WirePlaceRenderer from "./WirePlaceRenderer";

class WirePlaceEngine {
  renderer: WirePlaceRenderer;
  tick: number;
  _running: boolean;
  _lastTime: number;

  constructor(renderer: WirePlaceRenderer) {
    this.renderer = renderer;
    this.tick = 0;
    this._running = false;
    this._lastTime = 0;
  }

  start = () => {
    this._running = true;
    this._lastTime = Date.now() - 1;
    this.run();
  }

  stop = () => {
    this._running = false;
  }

  run = () => {
    this.tick += 1;
    const now = Date.now();
    const elapsed = now - this._lastTime;
    this._lastTime = now;
    this.update(this.tick, elapsed);

    if (this._running) {
      window.requestAnimationFrame(this.run);
    }
  }

  update = (tick: number, elapsed: number) => {
    return;
  }
}

export default WirePlaceEngine;