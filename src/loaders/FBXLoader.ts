import { Group, Mesh, Object3D, Material, MeshPhongMaterial } from 'three';
import { FBXLoader as ThreeFBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

function setMaterialProperties(m: Material) {
  m.transparent = false;
  (m as MeshPhongMaterial).shininess = 0;
}

function setChildrenProperties(parent: Object3D) {
  const mesh = parent as Mesh;
  if (mesh.isMesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = false;
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
  async loadGroupAsync(url: string): Promise<Group> {
    const group: Group = await this.loadAsync(url);
    setChildrenProperties(group);
    return group;
  }
}

export default FBXLoader;
