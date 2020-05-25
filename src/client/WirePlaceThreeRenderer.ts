import {
  AmbientLight,
  AxesHelper,
  BoxBufferGeometry,
  Color,
  DirectionalLight,
  Fog,
  GridHelper,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Scene,
  WebGLRenderer,
} from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { Update } from 'wireplace-scene';

import { loadDefaultMap } from 'loaders/PreconfiguredAssets';
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
  _controls: OrbitControls;
  _stats: Stats;

  constructor() {
    this.domElement = document.createElement('div');
    this.webGLRenderer = new WebGLRenderer({ antialias: true });
    this.webGLRenderer.shadowMap.enabled = true;
    this.webGLRenderer.shadowMap.type = PCFSoftShadowMap;
    this._scene = new Scene();
    this._camera = new PerspectiveCamera(45);
    this._animation = new AnimationRuntime(this._scene);

    const controls = new MapControls(
      this._camera,
      this.webGLRenderer.domElement
    );
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1, 0);
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2 + Math.PI / 32;
    controls.minPolarAngle = Math.PI / 16;
    controls.enableKeys = false;
    controls.minDistance = 0.5;
    controls.maxDistance = 10;
    this._controls = controls;

    this._stats = new (Stats as any)();
    this._stats.dom.setAttribute('style', 'position: fixed; right: 0; top: 0');
    document.body.appendChild(this._stats.dom);

    this._setupScene();
  }

  async _setupScene() {
    this._scene.background = new Color(0xcccccc);
    this._camera.position.set(0, 5, 4);
    const distance = this._camera.position.length();
    this._scene.fog = new Fog(0xa0a0a0, distance * 1.5, distance * 4);

    let l1 = new DirectionalLight(0xffffff);
    l1.position.set(0, 200, 200);
    l1.castShadow = true;
    l1.intensity = 0.3;
    this._scene.add(l1);

    const l2 = new DirectionalLight(0xffffff);
    l2.position.set(0, 200, 200);
    l2.castShadow = false;
    l2.intensity = 1 - l1.intensity - 0.2;
    this._scene.add(l2);

    const l3 = new AmbientLight(0xffffff, 0.1);
    this._scene.add(l3);

    const l4 = new HemisphereLight(0xffffff, 0x444444);
    l4.position.set(0, 200, 0);
    this._scene.add(l4);

    const floor = new Mesh(
      new PlaneBufferGeometry(6, 6),
      new MeshPhongMaterial({ color: 0x999999, depthTest: false })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this._scene.add(floor);

    const grid = new GridHelper(2000, 2000, 0, 0);
    if (!Array.isArray(grid.material)) {
      grid.material.opacity = 0.2;
      grid.material.transparent = true;
    }
    this._scene.add(grid);

    const map = await loadDefaultMap();
    this._scene.add(map);
  }

  _getObjectById(objectId: ObjectID): Object3D | null {
    return this._scene.getObjectByName(objectId) || null;
  }

  _initializeObject(objectId: ObjectID, u: Update): Object3D {
    const obj = new Object3D();
    obj.name = objectId;

    const material = new MeshBasicMaterial({
      color: 0xffffff,
    });
    const body = new Mesh(boxGeometry, material);
    body.castShadow = true;
    body.position.y = 0.75;
    obj.add(body);

    if (u.position) {
      obj.position.set(u.position.x, u.position.y, u.position.z);
    }

    obj.add(new AxesHelper(1.0));

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

  render = (delta: number) => {
    this._animation.update(delta);
    this.webGLRenderer.render(this._scene, this._camera);
    this._stats.update();
    this._controls.update();
  };
}

export default WirePlaceThreeRenderer;
