import { Mesh, MeshPhongMaterial, Object3D, Vector3 } from 'three';

import type { Scene } from 'three';
import type { Update } from 'wireplace-scene';

interface ObjectCustomData {
  animateable: boolean;
  target: Object3D;
  color: number;
  speed: number;
}

const d = new Vector3();

class AnimationRuntime {
  _scene: Scene;

  constructor(scene: Scene) {
    this._scene = scene;
  }

  initializeCustomData(obj: Object3D) {
    const data: ObjectCustomData = {
      animateable: true,
      target: new Object3D(),
      color: 0,
      speed: 1.4,
    };
    obj.userData = data;
  }

  updateCustomData(obj: Object3D, u: Update) {
    const data: ObjectCustomData = obj.userData as any;

    if (u.color) {
      data.color = u.color;
      ((obj.children[0] as Mesh).material as MeshPhongMaterial).color.set(
        u.color
      );
    }
    if (u.speed !== undefined) {
      data.speed = u.speed;
    }
    if (u.position) {
      data.target.position.set(u.position.x, u.position.y, u.position.z);
    }
    if (u.rotation) {
      data.target.rotation.set(u.rotation.x, u.rotation.y, u.rotation.z, 'XYZ');
    }
    if (u.scale) {
      data.target.scale.set(u.scale.x, u.scale.y, u.scale.z);
    }
    if (u.up) {
      data.target.up.set(u.up.x, u.up.y, u.up.z);
    }
  }

  update = (deltaTimeMs: number) => {
    for (const child of this._scene.children) {
      const { userData } = child;
      if (!userData.animateable) {
        continue;
      }
      const data: ObjectCustomData = userData as any;
      if (!child.position.equals(data.target.position)) {
        d.copy(data.target.position).sub(child.position);
        const distance = d.length();
        const progress = distance / 3.5;
        d.normalize();
        d.multiplyScalar(progress);
        child.position.add(d);
      }
    }
  };
}

export default AnimationRuntime;
