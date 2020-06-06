import { Group, Object3D, AnimationUtils } from 'three';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';

import { AnimationAction, AnimationActions } from 'constants/Animation';

import FBXLoader from './FBXLoader';

interface Asset {
  name: string;
  url: string;
  scale: number;
  animations?: Partial<Record<AnimationAction, number>>;
}

/*
Important Note:

AssetIDs are two-byte short integers. We have reserved the first 1000 IDs for avatars.
Any ID that is 1000 or higher will be indexed against the PropAssets list instead.
*/

const MAX_AVATAR_COUNT = 1000;

export const AvatarAssets: Array<Asset> = [
  {
    name: 'F1',
    url: '/synty/office/SK_Chr_Business_Female_01.fbx',
    scale: 0.01,
    animations: { [AnimationActions.IDLE]: 0 },
  },
  {
    name: 'F2',
    url: '/synty/office/SK_Chr_Developer_Female_01.fbx',
    scale: 0.01,
    animations: { [AnimationActions.IDLE]: 0 },
  },
  {
    name: 'F3',
    url: '/synty/office/SK_Chr_Business_Female_03.fbx',
    scale: 0.01,
    animations: { [AnimationActions.IDLE]: 0 },
  },
  {
    name: 'M1',
    url: '/synty/office/SK_Chr_Business_Male_02.fbx',
    scale: 0.01,
    animations: { [AnimationActions.IDLE]: 0 },
  },
  {
    name: 'T1',
    url: '/synty/office/SK_Chr_Security_Male_01.fbx',
    scale: 0.01,
  },
  {
    name: 'M2',
    url: '/synty/office/SK_Chr_Business_Male_01.fbx',
    scale: 0.01,
    animations: { [AnimationActions.IDLE]: 0 },
  },
  {
    name: 'F4',
    url: '/synty/office/SK_Chr_Boss_Female_01.fbx',
    scale: 0.01,
  },
  {
    name: 'T2',
    url: '/synty/office/SK_Chr_Cleaner_Male_01.fbx',
    scale: 0.01,
  },
  {
    name: 'M4',
    url: '/synty/office/SK_Chr_Business_Male_04.fbx',
    scale: 0.01,
  },
  {
    name: 'F5',
    url: '/synty/office/SK_Chr_Business_Female_02.fbx',
    scale: 0.01,
  },
];

export const PropAssets: Array<Asset> = [
  {
    name: 'Conference Table',
    url: '/synty/office/SM_Prop_Table_Conference_01.fbx',
    scale: 0.01,
  },
  {
    name: 'Table Tennis',
    url: '/synty/office/SM_Prop_TableTennis_01.fbx',
    scale: 0.01,
  },
  {
    name: 'Coffee Table',
    url: '/synty/office/SM_Prop_CoffeeTable_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Bld_Floor_Carpet_01.fbx',
    url: '/synty/office/SM_Bld_Floor_Carpet_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Bld_Wall_Blank_01.fbx',
    url: '/synty/office/SM_Bld_Wall_Blank_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Bld_Wall_Blank_Door_01.fbx',
    url: '/synty/office/SM_Bld_Wall_Blank_Door_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Bld_Wall_Blank_Window_01.fbx',
    url: '/synty/office/SM_Bld_Wall_Blank_Window_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Bin_01.fbx',
    url: '/synty/office/SM_Prop_Bin_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Chair_01.fbx',
    url: '/synty/office/SM_Prop_Chair_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Chair_02.fbx',
    url: '/synty/office/SM_Prop_Chair_02.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Computer_Keyboard_01.fbx',
    url: '/synty/office/SM_Prop_Computer_Keyboard_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Computer_Monitor_Double_01.fbx',
    url: '/synty/office/SM_Prop_Computer_Monitor_Double_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Couch_03.fbx',
    url: '/synty/office/SM_Prop_Couch_03.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Cup_01.fbx',
    url: '/synty/office/SM_Prop_Cup_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Desk_01.fbx',
    url: '/synty/office/SM_Prop_Desk_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Desk_02.fbx',
    url: '/synty/office/SM_Prop_Desk_02.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Desk_04.fbx',
    url: '/synty/office/SM_Prop_Desk_04.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Desk_Standing_01.fbx',
    url: '/synty/office/SM_Prop_Desk_Standing_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_FaxMachine_01.fbx',
    url: '/synty/office/SM_Prop_FaxMachine_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Folder_Holder_01.fbx',
    url: '/synty/office/SM_Prop_Folder_Holder_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Folder_Manila_02.fbx',
    url: '/synty/office/SM_Prop_Folder_Manila_02.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Fridge_01.fbx',
    url: '/synty/office/SM_Prop_Fridge_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Headphones_01.fbx',
    url: '/synty/office/SM_Prop_Headphones_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Laptop_01.fbx',
    url: '/synty/office/SM_Prop_Laptop_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Laptop_02.fbx',
    url: '/synty/office/SM_Prop_Laptop_02.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Monitor_Crt_01.fbx',
    url: '/synty/office/SM_Prop_Monitor_Crt_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_NotePad_01.fbx',
    url: '/synty/office/SM_Prop_NotePad_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Note_01.fbx',
    url: '/synty/office/SM_Prop_Note_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Papers_01.fbx',
    url: '/synty/office/SM_Prop_Papers_01.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Paper_02.fbx',
    url: '/synty/office/SM_Prop_Paper_02.fbx',
    scale: 0.01,
  },
  {
    name: 'SM_Prop_Paper_Pile_02.fbx',
    url: '/synty/office/SM_Prop_Paper_Pile_02.fbx',
    scale: 0.01,
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

  if (!asset) {
    if (assetId >= MAX_AVATAR_COUNT) {
      console.warn(
        'Asset failed to load',
        assetId,
        PropAssets[assetId - MAX_AVATAR_COUNT]
      );
    } else {
      console.warn('Asset failed to load', assetId);
    }
    return new Object3D();
  }

  if (assetId < MAX_AVATAR_COUNT) {
    const copy = SkeletonUtils.clone(asset);
    (copy as any).animations = AnimationUtils.arraySlice(
      (asset as any).animations,
      0,
      1000
    );
    return copy as Object3D;
  } else {
    const copy = asset.clone();
    return copy;
  }
}

async function preload(assetId: number) {
  const { url, scale } =
    assetId < MAX_AVATAR_COUNT
      ? AvatarAssets[assetId]
      : PropAssets[assetId - MAX_AVATAR_COUNT];
  const g = await new FBXLoader().loadGroupAsync(url);
  g.scale.set(scale, scale, scale);
  assetCache[assetId] = g;
}

async function preloadAll() {
  const promises = [];
  for (let i = 0; i < Object.keys(AvatarAssets).length; i += 1) {
    promises.push(preload(i));
  }
  for (let i = 0; i < Object.keys(PropAssets).length; i += 1) {
    promises.push(preload(i + MAX_AVATAR_COUNT));
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
  if (assetId < MAX_AVATAR_COUNT) {
    const animations = AvatarAssets[assetId].animations;
    return animations ? animations[type] : undefined;
  }
  return undefined;
}

async function loadAsset(assetId: number): Promise<Object3D> {
  await waitForPreload();
  const obj = loadFromCache(assetId);
  return obj;
}
export { getAnimationIndex, loadAsset };
