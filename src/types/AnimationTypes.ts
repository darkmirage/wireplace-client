type ValueOf<T> = T[keyof T];

export enum AnimationActions {
  IDLE,
  ANGRY,
  BOW,
  CLAP,
  CRY,
  DANCE_HIP_HOP_2,
  DANCE_HIP_HOP,
  DANCE_SAMBA,
  DIE,
  EXCITED,
  GOLF_DRIVE,
  LAUGH,
  SALUTE,
  WALK,
  WAVE,
}

export type AnimationAction = ValueOf<typeof AnimationActions>;
