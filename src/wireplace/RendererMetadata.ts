import {
  AnimationAction as ThreeAnimationAction,
  AnimationClip,
  AnimationMixer,
  Object3D,
} from 'three';
import { Update } from 'wireplace-scene';

import { AnimationAction, AnimationActions } from 'constants/Animation';
import { getAnimationIndex } from 'loaders/PreconfiguredAssets';
import { getClip } from 'loaders/Mixamo';

export interface RendererMetadata {
  actionState: number;
  actionType: AnimationAction;
  animateable: boolean;
  assetId: number | null;
  color: number;
  movable: boolean;
  speed: number;
  target: Object3D;
  playing: {
    actionType: AnimationAction;
    clip: AnimationClip;
  } | null;
  asset: Object3D | null;
  mixer: AnimationMixer | null;
  revision: number;

  // Frame when the actor last moved
  lastTickMoved: number;
}

export function getMetadata(obj: Object3D): RendererMetadata | null {
  const data: RendererMetadata = obj.userData as any;
  if (!data.animateable) {
    return null;
  }
  return data;
}

export function getAndAssertMetadata(obj: Object3D): RendererMetadata {
  const data = getMetadata(obj);
  if (!data) {
    throw new Error('Missing metadata');
  }
  return data;
}

export function getClipFromMetadata(
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

export function getThreeAnimationActionFromMetadata(
  obj: Object3D,
  actionType: AnimationAction
): ThreeAnimationAction | null {
  const data = getAndAssertMetadata(obj);
  if (data.assetId === null || !data.asset || !data.mixer) {
    return null;
  }
  const clip = getClipFromMetadata(obj, actionType);
  if (!clip) {
    return null;
  }
  return data.mixer.clipAction(clip);
}

export function initializeMetadata(obj: Object3D, u: Update): RendererMetadata {
  if (u.revision === undefined) {
    throw new Error('Missing revision number');
  }

  const data: RendererMetadata = {
    actionState: -1,
    actionType: AnimationActions.STATIC,
    animateable: true,
    asset: null,
    assetId: null,
    color: 0,
    lastTickMoved: 0,
    mixer: null,
    movable: !!u.movable,
    playing: null,
    speed: 1.4,
    target: new Object3D(),
    revision: 0,
  };
  return data;
}
