import { AnimationClip } from 'three';
import { AnimationAction, AnimationActions } from 'types/AnimationTypes';
import FBXLoader from './FBXLoader';

const AnimationURLs: Partial<Record<AnimationAction, string>> = {
  [AnimationActions.WALK]: '/assets/mixamo/animations/Walking.fbx',
  [AnimationActions.IDLE]: '/assets/mixamo/animations/Idle.fbx',
  [AnimationActions.DANCE_SAMBA]: '/assets/mixamo/animations/DanceSamba.fbx',
};

const clipCache: Partial<Record<AnimationAction, AnimationClip>> = {};

async function getClip(
  animationType: AnimationAction
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
