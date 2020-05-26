type ValueOf<T> = T[keyof T];

export enum AnimationActions {
  IDLE,
  WALK,
  RUN,
  SIT,
  DANCE_SAMBA,
}

export type AnimationAction = ValueOf<typeof AnimationActions>;
