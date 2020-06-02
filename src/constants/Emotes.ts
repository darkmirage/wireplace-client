import { AnimationActions, AnimationAction } from './Animation';

interface Emote {
  displayName: string;
  type_: AnimationAction;
  state: number;
  shortcut?: string;
}

const Emotes: Emote[] = [
  {
    displayName: 'Wave',
    type_: AnimationActions.WAVE,
    state: 3,
    shortcut: '1',
  },
  {
    displayName: 'Clap',
    type_: AnimationActions.CLAP,
    state: 2,
    shortcut: '2',
  },
  {
    displayName: 'Bow',
    type_: AnimationActions.BOW,
    state: 1,
    shortcut: '3',
  },
  {
    displayName: 'Chicken Dance',
    type_: AnimationActions.DANCE_CHICKEN,
    state: 1,
    shortcut: '4',
  },
  {
    displayName: 'YMCA Dance',
    type_: AnimationActions.DANCE_YMCA,
    state: 1,
    shortcut: '5',
  },
  {
    displayName: 'Golf Drive',
    type_: AnimationActions.GOLF_DRIVE,
    state: 1,
    shortcut: '6',
  },
  {
    displayName: 'Salute',
    type_: AnimationActions.SALUTE,
    state: 1,
    shortcut: '7',
  },
  {
    displayName: 'Drop Dead',
    type_: AnimationActions.DIE,
    state: 1,
    shortcut: '9',
  },
];

export default Emotes;
