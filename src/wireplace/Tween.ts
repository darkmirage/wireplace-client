import { Object3D, Quaternion, Vector3 } from 'three';

import getMaterial from 'utils/getMaterial';

export interface TweenTarget {
  position?: Vector3;
  quaternion?: Quaternion;
  opacity?: number;
}

class Tween {
  _obj: Object3D;
  _duration: number;
  _progress: number;
  ended: boolean;

  _p1: Vector3;
  _q1: Quaternion;
  _o1: number | null;

  _p2: Vector3;
  _q2: Quaternion;
  _o2: number;

  constructor(obj: Object3D, duration: number = 1.0) {
    this._obj = obj;
    this._duration = duration;
    this._progress = 0;
    this.ended = false;

    this._p1 = obj.position.clone();
    this._q1 = obj.quaternion.clone();
    this._o1 = getMaterial(obj)?.opacity || null;

    this._p2 = new Vector3();
    this._q2 = new Quaternion();
    this._o2 = 1.0;
  }

  to(target: TweenTarget): Tween {
    const { position, quaternion, opacity } = target;
    if (position) {
      this.toPosition(position);
    }
    if (quaternion) {
      this.toQuaternion(quaternion);
    }
    if (opacity !== undefined) {
      this.toOpacity(opacity);
    }
    return this;
  }

  toPosition(p: Vector3): Tween {
    this._p2.copy(p);
    return this;
  }

  toQuaternion(q: Quaternion): Tween {
    this._q2.copy(q);
    return this;
  }

  toOpacity(o: number): Tween {
    this._o2 = o;
    return this;
  }

  update(delta: number) {
    if (this.ended) {
      return;
    }
    this._progress = Math.min(this._progress + delta, this._duration);
    if (this._progress >= this._duration) {
      this.ended = true;
    }

    const t = this._progress / this._duration;
    if (this._o1 === null) {
      return;
    }
    const o = this._o1 + (this._o2 - this._o1) * t;
    const mat = getMaterial(this._obj);
    if (mat) {
      mat.opacity = o;
    }
  }
}

export default Tween;
