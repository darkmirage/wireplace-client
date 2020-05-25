import {
  AmbientLight,
  AxesHelper,
  BoxBufferGeometry,
  Color,
  DirectionalLight,
  Fog,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Scene,
  WebGLRenderer,
} from 'three';
import type { Update } from 'wireplace-scene';

import AnimationRuntime from './AnimationRuntime';

type ObjectID = string;

interface ObjectCustomData {
  target: Object3D;
  color: number;
}

const boxGeometry = new BoxBufferGeometry(0.25, 1.5, 0.25);

class WirePlaceThreeRenderer {
  domElement: HTMLDivElement;
  webGLRenderer: WebGLRenderer;
  _scene: Scene;
  _camera: PerspectiveCamera;
  _animation: AnimationRuntime;

  constructor() {
    this.domElement = document.createElement('div');
    this.webGLRenderer = new WebGLRenderer({ antialias: true });
    this._scene = new Scene();
    this._camera = new PerspectiveCamera(60);
    this._animation = new AnimationRuntime(this._scene);
    this._setupScene();
  }

  _setupScene() {
    this._scene.background = new Color(0xcccccc);
    this._camera.position.set(0, 12.5, 12.5);
    this._camera.zoom = 3.0;
    const distance = this._camera.position.length();
    this._scene.fog = new Fog(0xcce0ff, distance, distance * 1.5);
    this._camera.lookAt(0, 0, 0);

    let l1 = new DirectionalLight(0xffffff);
    l1.position.set(1, 1, 1);
    this._scene.add(l1);

    const l2 = new DirectionalLight(0x002288);
    l2.position.set(-1, -1, -1);
    this._scene.add(l2);

    const l3 = new AmbientLight(0x222222);
    this._scene.add(l3);

    const floor = new Mesh(
      new PlaneBufferGeometry(5.0, 5.0),
      new MeshPhongMaterial({ color: 0xffffff, flatShading: true })
    );
    floor.rotation.x = -Math.PI / 2;
    this._scene.add(floor);

    this._scene.add(new AxesHelper(1.0));
  }

  _getObjectById(objectId: ObjectID): Object3D | null {
    return this._scene.getObjectByName(objectId) || null;
  }

  _initializeObject(objectId: ObjectID, u: Update): Object3D {
    const obj = new Object3D();
    obj.name = objectId;

    const material = new MeshPhongMaterial({
      color: 0xffffff,
      flatShading: false,
    });
    const body = new Mesh(boxGeometry, material);
    body.position.y = 0.75;
    obj.add(body);

    if (u.position) {
      obj.position.set(u.position.x, u.position.y, u.position.z);
    }

    this._animation.initializeCustomData(obj);
    this._scene.add(obj);
    return obj;
  }

  setDOMElement(element: HTMLDivElement) {
    this.domElement = element;
    element.appendChild(this.webGLRenderer.domElement);
    this.resize();
  }

  resize = () => {
    this.webGLRenderer.setPixelRatio(window.devicePixelRatio);
    const width = this.domElement.clientWidth;
    const height = this.domElement.clientHeight;
    this.webGLRenderer.setSize(width, height);
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
  };

  applyUpdates(updates: Record<ObjectID, Update>) {
    for (const objectId in updates) {
      let obj = this._getObjectById(objectId);
      const u = updates[objectId];

      if (u.deleted) {
        if (obj) {
          this._scene.remove(obj);
        }
        continue;
      }

      obj = obj || this._initializeObject(objectId, u);
      this._animation.updateCustomData(obj, u);
    }
  }

  render = (deltaTimeMs: number) => {
    this._animation.update(deltaTimeMs);
    this.webGLRenderer.render(this._scene, this._camera);
  };
}

export default WirePlaceThreeRenderer;
