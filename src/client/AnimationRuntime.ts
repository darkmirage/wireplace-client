import {
  AnimationMixer,
  AnimationAction,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  Scene,
  Vector3,
  AnimationClip,
} from 'three';
import type { Update } from 'wireplace-scene';

import FBXLoader from 'loaders/FBXLoader';
import {
  getAnimationIndex,
  loadAsset,
  AnimationType,
  AnimationTypes,
} from 'loaders/PreconfiguredAssets';
import { getClip } from 'loaders/Mixamo';

interface ObjectCustomData {
  assetId: number;
  animateable: boolean;
  target: Object3D;
  color: number;
  speed: number;
  animationType: AnimationType | null;
  asset: Object3D | null;
  mixer: AnimationMixer | null;
  action: AnimationAction | null;
}

const SMOOTHING_CONSTANT = 5.0;

const d = new Vector3();

class AnimationRuntime {
  _scene: Scene;

  constructor(scene: Scene) {
    this._scene = scene;
  }

  loadAsset(obj: Object3D, u: Update) {
    let data: ObjectCustomData = obj.userData as any;

    const assetId = u.assetId || 0;
    if (data.assetId === assetId) {
      return;
    }

    data = {
      assetId,
      animateable: true,
      target: new Object3D(),
      color: 0,
      speed: 1.4,
      animationType: null,
      asset: null,
      mixer: null,
      action: null,
    };
    obj.userData = data;

    loadAsset(assetId).then((g) => {
      obj.add(g);
      data.asset = g;
      data.mixer = new AnimationMixer(g);
      this.startAction(obj, AnimationTypes.IDLE);
    });
  }

  async startAction(obj: Object3D, animationType: AnimationType) {
    const data: ObjectCustomData = obj.userData as any;
    if (!data.animateable) {
      throw new Error('Invalid meta data in object');
    }

    const assetId = data.assetId;
    if (data.animationType === animationType || !data.asset || !data.mixer) {
      return;
    }

    data.animationType = animationType;

    let clip: AnimationClip | null;
    const index = getAnimationIndex(assetId, animationType);
    if (index === undefined) {
      clip = await getClip(animationType);
    } else {
      clip = (data.asset as any).animations[index];
    }

    if (!clip) {
      return;
    }

    if (data.action) {
      data.action.fadeOut(0.2);
    }

    data.action = data.mixer.clipAction(clip);
    data.action.reset();
    data.action.fadeIn(0.2);
    data.action.play();
  }

  updateCustomData(obj: Object3D, u: Update) {
    const data: ObjectCustomData = obj.userData as any;

    if (u.color) {
      data.color = u.color;
      ((obj.children[0] as Mesh).material as MeshPhongMaterial).color.set(
        u.color
      );
    }
    if (u.assetId !== undefined) {
      this.loadAsset(obj, u);
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

  update = (delta: number) => {
    for (const child of this._scene.children) {
      const { userData } = child;
      if (!userData.animateable) {
        continue;
      }
      const data: ObjectCustomData = userData as any;
      const { target } = data;
      if (!child.position.equals(target.position)) {
        this.startAction(child, AnimationTypes.WALK);

        d.copy(target.position).sub(child.position);
        const distance = d.length();
        const progress = distance / SMOOTHING_CONSTANT;
        d.normalize();
        d.multiplyScalar(progress);
        child.position.add(d);

        d.copy(target.position).sub(child.position);
        if (d.length() <= 0.01) {
          child.position.copy(target.position);
        }
      } else {
        this.startAction(child, AnimationTypes.IDLE);
      }

      if (!child.quaternion.equals(target.quaternion)) {
        child.quaternion.slerp(target.quaternion, 1 / SMOOTHING_CONSTANT);
      }

      if (data.mixer) {
        data.mixer.update(delta);
      }

      // TODO:
      // - Update scale and up
      // - Implement proper interpolation and easing
    }
  };
}

export default AnimationRuntime;
