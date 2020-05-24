import { Scene, WebGLRenderer, PerspectiveCamera, Object3D } from 'three';
import type { Camera } from 'three';

type ThreeUpdate = Partial<Object3D> | false;
type ObjectID = string;

class WirePlaceThreeRenderer {
  domElement: HTMLDivElement;
  webGLRenderer: WebGLRenderer;
  _scene: Scene;
  _camera: Camera;
  _dirty: boolean;

  constructor() {
    this.domElement = document.createElement('div');
    this.webGLRenderer = new WebGLRenderer({ antialias: true });
    this._scene = new Scene();
    this._dirty = false;
    this._camera = new PerspectiveCamera();
  }

  _getObjectById(objectId: ObjectID): Object3D | null {
    return this._scene.getObjectByName(objectId) || null;
  }

  setDOMElement(element: HTMLDivElement) {
    this.domElement = element;
    element.appendChild(this.webGLRenderer.domElement);
    this.resize();
  }

  resize = () => {
    this.webGLRenderer.setPixelRatio(window.devicePixelRatio);
    this.webGLRenderer.setSize(this.domElement.clientWidth, this.domElement.clientHeight);
  }

  applyUpdates(updates: Record<ObjectID, ThreeUpdate>) {
    for (const objectId in updates) {
      let obj = this._getObjectById(objectId);
      if (!obj) {
        obj = new Object3D();
        obj.name = objectId;
        this._scene.add(obj);
      }
    }
    this._dirty = true;
  }

  render = (deltaTimeMs: number) => {
    this.webGLRenderer.render(this._scene, this._camera);
    this._dirty = false;
  }
}

export default WirePlaceThreeRenderer;