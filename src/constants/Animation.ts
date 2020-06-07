type ValueOf<T> = T[keyof T];

export enum AnimationActions {
  STATIC,
  IDLE,
  ANGRY,
  BOW,
  CLAP,
  CRY,
  DANCE_HIP_HOP_2,
  DANCE_HIP_HOP,
  DANCE_CHICKEN,
  DANCE_YMCA,
  DIE,
  EXCITED,
  GOLF_DRIVE,
  SALUTE,
  WALK,
  WAVE,
  SIT_IDLE,
}

export type AnimationAction = ValueOf<typeof AnimationActions>;
