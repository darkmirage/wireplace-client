import {
  AnimationClip,
  AnimationMixer,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  Scene,
  Vector3,
} from 'three';
import type { Update } from 'wireplace-scene';

import { AnimationAction, AnimationActions } from 'types/AnimationTypes';
import { getAnimationIndex, loadAsset } from 'loaders/PreconfiguredAssets';
import { getClip } from 'loaders/Mixamo';

interface AnimationMetadata {
  assetId: number | null;
  animateable: boolean;
  target: Object3D;
  color: number;
  speed: number;
  actionType: AnimationAction | null;
  currentClip: AnimationClip | null;
  asset: Object3D | null;
  mixer: AnimationMixer | null;
  networkedActionType: AnimationAction;
  networkedActionState: number;
}

const SMOOTHING_CONSTANT = 5.0;
const ANIMATION_FADE_TIME = 0.3;

const _v = new Vector3();

function getMetadata(obj: Object3D): AnimationMetadata | null {
  const data: AnimationMetadata = obj.userData as any;
  if (!data.animateable) {
    return null;
  }
  return data;
}

function getAndAssertMetadata(obj: Object3D): AnimationMetadata {
  const data = getMetadata(obj);
  if (!data) {
    throw new Error('Missing metadata');
  }
  return data;
}

function getClipFromMetadata(
  obj: Object3D,
  actionType: AnimationAction
): AnimationClip | null {
  const data = getAndAssertMetadata(obj);
  if (data.assetId === null || data.asset === null) {
    return null;
  }

  let clip: AnimationClip | null;
  const index = getAnimationIndex(data.assetId, actionType);
  if (index === undefined) {
    clip = getClip(actionType);
  } else {
    clip = (data.asset as any).animations[index];
  }

  return clip;
}

function initializeMetadata(u: Update): AnimationMetadata {
  const data = {
    assetId: null,
    animateable: true,
    target: new Object3D(),
    color: 0,
    speed: 1.4,
    actionType: null,
    currentClip: null,
    asset: null,
    mixer: null,
    networkedActionType: AnimationActions.IDLE,
    networkedActionState: -1,
  };
  return data;
}

class AnimationRuntime {
  _scene: Scene;

  constructor(scene: Scene) {
    this._scene = scene;
  }

  loadAsset(obj: Object3D, u: Update) {
    let data = getMetadata(obj);
    if (!data) {
      data = initializeMetadata(u);
      obj.userData = data;
    }

    const assetId = u.assetId || 0;
    if (data.assetId === assetId) {
      return;
    }

    loadAsset(assetId).then((g) => {
      data = getAndAssertMetadata(obj);

      if (data.assetId === assetId) {
        return;
      }

      if (data.asset) {
        obj.remove(data.asset);
      }

      obj.add(g);
      data.assetId = assetId;
      data.asset = g;
      data.mixer = new AnimationMixer(g);
      this.startAction(obj, AnimationActions.IDLE);
    });
  }

  startAction(obj: Object3D, actionType: AnimationAction) {
    const data = getAndAssertMetadata(obj);

    const assetId = data.assetId;
    if (
      assetId === null ||
      data.actionType === actionType ||
      !data.asset ||
      !data.mixer
    ) {
      return;
    }

    const clip = getClipFromMetadata(obj, actionType);
    if (!clip) {
      return;
    }

    this.playClip(obj, clip);
    data.actionType = actionType;
  }

  stopAction(obj: Object3D) {
    const clip = getClipFromMetadata(obj, AnimationActions.IDLE);
    if (!clip) {
      throw new Error('Missing idle animation');
    }
    this.playClip(obj, clip);
  }

  updateAction(obj: Object3D) {
    const data = getAndAssertMetadata(obj);
    const { networkedActionType, actionType } = data;
    if (networkedActionType !== actionType) {
      const clip = getClipFromMetadata(obj, networkedActionType);
      if (!clip) {
        return;
      }
      this.playClip(obj, clip);
    }
  }

  playClip(obj: Object3D, clip: AnimationClip) {
    const data = getAndAssertMetadata(obj);
    const prevClip = data.currentClip;

    if (!data.mixer) {
      return;
    }

    if (prevClip && prevClip !== clip) {
      const prevAction = data.mixer.clipAction(prevClip);
      prevAction.fadeOut(ANIMATION_FADE_TIME);
    }

    const action = data.mixer.clipAction(clip);
    action.reset();
    action.fadeIn(ANIMATION_FADE_TIME);
    action.play();

    data.currentClip = clip;
  }

  updateCustomData(obj: Object3D, u: Update) {
    const data = getAndAssertMetadata(obj);

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
    if (u.action) {
      if (
        data.networkedActionType !== u.action.type ||
        data.networkedActionState !== u.action.state
      ) {
        data.networkedActionType = u.action.type;
        data.networkedActionState = u.action.state;
        if (u.action.type !== AnimationActions.IDLE) {
          this.updateAction(obj);
        } else {
          this.stopAction(obj);
        }
      }
    }
  }

  update = (delta: number): boolean => {
    let translated = false;
    for (const child of this._scene.children) {
      const data = getMetadata(child);
      if (!data) {
        continue;
      }

      const { target } = data;
      if (!child.position.equals(target.position)) {
        translated = true;
        this.startAction(child, AnimationActions.WALK);

        _v.copy(target.position).sub(child.position);
        const distance = _v.length();
        const progress = distance / SMOOTHING_CONSTANT;
        _v.normalize();
        _v.multiplyScalar(progress);
        child.position.add(_v);

        _v.copy(target.position).sub(child.position);
        if (_v.length() <= 0.01) {
          child.position.copy(target.position);
          this.startAction(child, AnimationActions.IDLE);
        }
      }

      if (!child.quaternion.equals(target.quaternion)) {
        translated = true;
        if (target.quaternion.angleTo(child.quaternion) < 0.01) {
          child.quaternion.copy(target.quaternion);
        } else {
          child.quaternion.slerp(target.quaternion, 1 / SMOOTHING_CONSTANT);
        }
      }

      if (data.mixer) {
        data.mixer.update(delta);
      }
      // TODO:
      // - Update scale and up
      // - Implement proper interpolation and easing
    }
    return translated;
  };
}

export default AnimationRuntime;
