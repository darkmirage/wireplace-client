import { Cache, Group, Object3D } from 'three';

import { AnimationAction, AnimationActions } from 'types/AnimationTypes';

import FBXLoader from './FBXLoader';

Cache.enabled = true;

interface Asset {
  url: string;
  scale: number;
  animations: Partial<Record<AnimationAction, number>>;
}

const Assets: Array<Asset> = [
  {
    url: '/assets/mixamo/characters/BlueBot.fbx',
    scale: 0.01,
    animations: { [AnimationActions.IDLE]: 0 },
  },
  {
    url: '/assets/mixamo/characters/RedBot.fbx',
    scale: 0.01,
    animations: { [AnimationActions.IDLE]: 0 },
  },
];

function getAnimationIndex(
  assetId: number,
  type: AnimationAction
): number | undefined {
  return Assets[assetId].animations[type];
}

async function loadAsset(assetId: number): Promise<Group> {
  const { url, scale } = Assets[assetId];
  const g = await new FBXLoader().loadGroupAsync(url);
  g.scale.set(scale, scale, scale);
  return g;
}

async function loadNature(filename: string): Promise<Group> {
  const g = await new FBXLoader().loadGroupAsync(
    `/assets/nature/${filename}.fbx`
  );
  g.scale.set(0.003, 0.003, 0.003);
  return g;
}

async function loadDefaultMap(): Promise<Group> {
  const group = new Group();
  const addToScene = (g: Object3D) => {
    group.add(g);
    return g;
  };

  const loaders = [
    loadNature('Tree_1')
      .then(addToScene)
      .then((g) => {
        g.position.set(-1, 0, -2);
        return g;
      }),
    loadNature('Tree_2')
      .then(addToScene)
      .then((g) => {
        g.position.set(3.4, 0, -2.5);
        return g;
      }),
    loadNature('Tree_3')
      .then(addToScene)
      .then((g) => {
        g.position.set(3, 0, 1);
        return g;
      }),
    loadNature('Log_1')
      .then(addToScene)
      .then((g) => {
        g.position.set(2.1, 0, 1);
        g.rotation.y = Math.PI / 4;
        return g;
      }),
    loadNature('Log_1')
      .then(addToScene)
      .then((g) => {
        g.position.set(2.1, 0, 1);
        g.rotation.y = Math.PI / 4;
        return g;
      }),
    loadNature('Rock_5')
      .then(addToScene)
      .then((g) => {
        g.position.set(1.2, 0, 1);
        g.rotation.y = Math.PI / 4;
        return g;
      }),
  ];

  Promise.allSettled(loaders);
  return group;
}

export { getAnimationIndex, loadAsset, loadNature, loadDefaultMap };
