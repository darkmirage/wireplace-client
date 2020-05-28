import { Object3D, Material, Mesh } from 'three';

function getMaterial(obj: Object3D): Material | null {
  const m = obj.children[0];
  if (m) {
    const mesh = m as Mesh;
    if (mesh.isMesh) {
      const material = Array.isArray(mesh.material)
        ? mesh.material[0]
        : mesh.material;
      return material || null;
    }
    return null;
  }
  return null;
}

export default getMaterial;
