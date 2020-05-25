import type { Object3D } from 'three';
import { Group } from 'three';

import FBXLoader from './FBXLoader';

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

export { loadNature, loadDefaultMap };
