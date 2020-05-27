import { AnimationClip } from 'three';
import { AnimationAction, AnimationActions } from 'types/AnimationTypes';
import FBXLoader from './FBXLoader';

const AnimationURLs: Partial<Record<AnimationAction, string>> = {
  [AnimationActions.ANGRY]: '/assets/mixamo/animations/Angry.fbx',
  [AnimationActions.BOW]: '/assets/mixamo/animations/Bow.fbx',
  [AnimationActions.CLAP]: '/assets/mixamo/animations/Clapping.fbx',
  [AnimationActions.CRY]: '/assets/mixamo/animations/Crying.fbx',
  [AnimationActions.DANCE_HIP_HOP_2]:
    '/assets/mixamo/animations/DanceHipHop2.fbx',
  [AnimationActions.DANCE_HIP_HOP]: '/assets/mixamo/animations/DanceHipHop.fbx',
  [AnimationActions.DANCE_SAMBA]: '/assets/mixamo/animations/DanceSamba.fbx',
  [AnimationActions.DIE]: '/assets/mixamo/animations/Dying.fbx',
  [AnimationActions.EXCITED]: '/assets/mixamo/animations/Excited.fbx',
  [AnimationActions.GOLF_DRIVE]: '/assets/mixamo/animations/GolfDrive.fbx',
  [AnimationActions.IDLE]: '/assets/mixamo/animations/Idle.fbx',
  [AnimationActions.LAUGH]: '/assets/mixamo/animations/Laughing.fbx',
  [AnimationActions.SALUTE]: '/assets/mixamo/animations/Salute.fbx',
  [AnimationActions.WALK]: '/assets/mixamo/animations/Walking.fbx',
  [AnimationActions.WAVE]: '/assets/mixamo/animations/Waving.fbx',
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
