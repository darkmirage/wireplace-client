import { AnimationClip } from 'three';
import { AnimationTypes, AnimationType } from './PreconfiguredAssets';
import FBXLoader from './FBXLoader';

const AnimationURLs: Partial<Record<AnimationType, string>> = {
  [AnimationTypes.WALK]: '/assets/mixamo/animations/Walking.fbx',
  [AnimationTypes.IDLE]: '/assets/mixamo/animations/Idle.fbx',
};

const clipCache: Partial<Record<AnimationType, AnimationClip>> = {};

async function getClip(
  animationType: AnimationType
): Promise<AnimationClip | null> {
  const url = AnimationURLs[animationType];
  if (url) {
    let clip = clipCache[animationType];
    if (clip) {
      return clip;
    }
    const obj = await new FBXLoader().loadGroupAsync(url);
    clip = (obj as any).animations[0];
    if (!clip) {
      throw new Error('Clip is missing from FBX: ' + url);
    }
    clip.optimize();
    clipCache[animationType] = clip;
    return clip;
  }
  return null;
}

export { getClip };
