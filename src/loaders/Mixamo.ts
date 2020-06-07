import { AnimationClip } from 'three';
import { AnimationAction, AnimationActions } from 'constants/Animation';
import FBXLoader from './FBXLoader';

const staticAnimation = new AnimationClip('static', 0, []);

const AnimationURLs: Partial<Record<AnimationAction, string>> = {
  [AnimationActions.ANGRY]: '/mixamo/animations/synty/Angry.fbx',
  [AnimationActions.BOW]: '/mixamo/animations/synty/Bow.fbx',
  [AnimationActions.CLAP]: '/mixamo/animations/synty/Clapping.fbx',
  [AnimationActions.CRY]: '/mixamo/animations/synty/Crying.fbx',
  [AnimationActions.DANCE_HIP_HOP_2]:
    '/mixamo/animations/synty/DanceHipHop2.fbx',
  [AnimationActions.DANCE_HIP_HOP]: '/mixamo/animations/synty/DanceHipHop.fbx',
  [AnimationActions.DANCE_CHICKEN]: '/mixamo/animations/synty/DanceChicken.fbx',
  [AnimationActions.DANCE_YMCA]: '/mixamo/animations/synty/DanceYmca.fbx',
  [AnimationActions.DIE]: '/mixamo/animations/synty/Dying.fbx',
  [AnimationActions.EXCITED]: '/mixamo/animations/synty/Excited.fbx',
  [AnimationActions.GOLF_DRIVE]: '/mixamo/animations/synty/GolfDrive.fbx',
  [AnimationActions.IDLE]: '/mixamo/animations/synty/Idle.fbx',
  [AnimationActions.SALUTE]: '/mixamo/animations/synty/Salute.fbx',
  [AnimationActions.WALK]: '/mixamo/animations/synty/Walking.fbx',
  [AnimationActions.WAVE]: '/mixamo/animations/synty/Waving.fbx',
  [AnimationActions.SIT_IDLE]: '/mixamo/animations/synty/SittingIdle.fbx',
};

const clipCache: Partial<Record<AnimationAction, AnimationClip>> = {};

async function loadIntoCache(animationType: AnimationAction) {
  if (clipCache[animationType]) {
    return;
  }
  const url = AnimationURLs[animationType];
  if (url) {
    const obj = await new FBXLoader().loadGroupAsync(url);
    const clip = (obj as any).animations[0];
    if (!clip) {
      throw new Error('Clip is missing from FBX: ' + url);
    }
    clip.name = animationType;
    clip.optimize();
    clipCache[animationType] = clip;
  }
}

function getClip(animationType: AnimationAction): AnimationClip | null {
  if (animationType === AnimationActions.STATIC) {
    return staticAnimation;
  }
  return clipCache[animationType] || null;
}

async function preload() {
  await loadIntoCache(AnimationActions.IDLE);
  await loadIntoCache(AnimationActions.WALK);
  await loadIntoCache(AnimationActions.WAVE);
  await loadIntoCache(AnimationActions.CLAP);
  await loadIntoCache(AnimationActions.BOW);
  await loadIntoCache(AnimationActions.DANCE_CHICKEN);
  await loadIntoCache(AnimationActions.DANCE_YMCA);
  await loadIntoCache(AnimationActions.GOLF_DRIVE);
  await loadIntoCache(AnimationActions.SALUTE);
  await loadIntoCache(AnimationActions.CRY);
  await loadIntoCache(AnimationActions.DIE);
  await loadIntoCache(AnimationActions.SIT_IDLE);
}

preload();

export { getClip };
