import { Object3D, Mesh, Material, MeshPhongMaterial } from 'three';

function disposeMaterial(m: Material) {
  const m_ = m as MeshPhongMaterial;
  if (m_.envMap) {
    m_.envMap.dispose();
  }
  if (m_.aoMap) {
    m_.aoMap.dispose();
  }
  if (m_.normalMap) {
    m_.normalMap.dispose();
  }
  if (m_.specularMap) {
    m_.specularMap.dispose();
  }
  if (m_.alphaMap) {
    m_.alphaMap.dispose();
  }
  if (m_.emissiveMap) {
    m_.emissiveMap.dispose();
  }
  if (m_.displacementMap) {
    m_.displacementMap.dispose();
  }
  if (m_.map) {
    m_.map.dispose();
  }
  m.dispose();
}

function disposeObject3D(obj: Object3D) {
  obj.children.forEach(disposeObject3D);
  const mesh = obj as Mesh;
  if (mesh.isMesh) {
    mesh.geometry.dispose();
    if (Array.isArray(mesh.material)) {
      for (const m of mesh.material) {
        disposeMaterial(m);
      }
    } else {
      disposeMaterial(mesh.material);
    }
  }
}

export default disposeObject3D;
