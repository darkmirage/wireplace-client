import { Cache, Group, Object3D, AnimationUtils } from 'three';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';

import { AnimationAction, AnimationActions } from 'constants/Animation';

import FBXLoader from './FBXLoader';

Cache.enabled = true;

interface Asset {
  url: string;
  scale: number;
  animations: Partial<Record<AnimationAction, number>>;
}

const Assets: Array<Asset> = [
  {
    url: '/assets/synty/office/SK_Chr_Developer_Female_01.fbx',
    scale: 0.01,
    animations: { [AnimationActions.IDLE]: 0 },
  },
  {
    url: '/assets/synty/office/SK_Chr_Business_Male_02.fbx',
    scale: 0.01,
    animations: { [AnimationActions.IDLE]: 0 },
  },
  {
    url: '/assets/synty/office/SK_Chr_Business_Female_01.fbx',
    scale: 0.01,
    animations: { [AnimationActions.IDLE]: 0 },
  },
  {
    url: '/assets/synty/office/SK_Chr_Business_Female_03.fbx',
    scale: 0.01,
    animations: { [AnimationActions.IDLE]: 0 },
  },
  {
    url: '/assets/synty/office/SK_Chr_Security_Male_01.fbx',
    scale: 0.01,
    animations: {},
  },
  {
    url: '/assets/synty/office/SK_Chr_Business_Male_01.fbx',
    scale: 0.01,
    animations: { [AnimationActions.IDLE]: 0 },
  },
  {
    url: '/assets/synty/office/SK_Chr_Boss_Female_01.fbx',
    scale: 0.01,
    animations: {},
  },
  {
    url: '/assets/synty/office/SK_Chr_Cleaner_Male_01.fbx',
    scale: 0.01,
    animations: {},
  },
  {
    url: '/assets/synty/office/SK_Chr_Business_Male_04.fbx',
    scale: 0.01,
    animations: {},
  },
  {
    url: '/assets/synty/office/SK_Chr_Business_Female_02.fbx',
    scale: 0.01,
    animations: {},
  },
];

// TODO: Build a real cache module
// start caching-related code
let preloaded = false;
const assetCache: Record<number, Group> = {};

async function waitForPreload() {
  return new Promise((resolve) => {
    const check = () => {
      if (preloaded) {
        resolve();
      } else {
        setTimeout(check, 200);
      }
    };
    check();
  });
}

function loadFromCache(assetId: number): Object3D {
  const asset = assetCache[assetId];
  const copy = SkeletonUtils.clone(asset);
  (copy as any).animations = AnimationUtils.arraySlice(
    (asset as any).animations,
    0,
    1000
  );
  return copy as Object3D;
}

async function preload(assetId: number) {
  const { url, scale } = Assets[assetId];
  const g = await new FBXLoader().loadGroupAsync(url);
  g.scale.set(scale, scale, scale);
  assetCache[assetId] = g;
}

async function preloadAll() {
  const promises = [];
  for (let i = 0; i < Object.keys(Assets).length; i += 1) {
    promises.push(preload(i));
  }
  await Promise.allSettled(promises);
  preloaded = true;
}
preloadAll();
// end caching-related code

function getAnimationIndex(
  assetId: number,
  type: AnimationAction
): number | undefined {
  return Assets[assetId].animations[type];
}

async function loadAsset(assetId: number): Promise<Object3D> {
  await waitForPreload();
  const obj = loadFromCache(assetId);
  return obj;
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
