import {
  Group,
  Mesh,
  Object3D,
  Material,
  MeshPhongMaterial,
  LoaderUtils,
} from 'three';
import { FBXLoader as ThreeFBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

const DOMAIN = 'https://wireplace-assets.s3-us-west-1.amazonaws.com';

function setMaterialProperties(m: Material) {
  m.transparent = false;
  (m as MeshPhongMaterial).shininess = 0;
}

function setChildrenProperties(parent: Object3D) {
  const mesh = parent as Mesh;
  if (mesh.isMesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    materials.forEach(setMaterialProperties);
  }

  for (const child of parent.children) {
    setChildrenProperties(child);
  }
}

class FBXLoader extends ThreeFBXLoader {
  async loadGroupAsync(p: string): Promise<Group> {
    if (p.startsWith('/')) {
      p = DOMAIN + p;
    }
    const base = LoaderUtils.extractUrlBase(p);
    this.setResourcePath(base + 'textures/');
    const group = await this.loadAsync(p);
    setChildrenProperties(group);
    return group;
  }
}

export default FBXLoader;
