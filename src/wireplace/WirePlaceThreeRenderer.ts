import {
  AmbientLight,
  SphereBufferGeometry,
  Color,
  DirectionalLight,
  Fog,
  GridHelper,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Scene,
  WebGLRenderer,
  Vector3,
} from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { Update } from 'wireplace-scene';

import { loadDefaultMap } from 'loaders/PreconfiguredAssets';
import AnimationRuntime from './AnimationRuntime';
import WirePlaceReactRenderer from './WirePlaceReactRenderer';

type ObjectID = string;

interface ObjectCustomData {
  target: Object3D;
  color: number;
}

const boxGeometry = new SphereBufferGeometry(0.05, 16, 16);
const _v1 = new Vector3();
const _v2 = new Vector3();

class WirePlaceThreeRenderer {
  domElement: HTMLDivElement;
  webGLRenderer: WebGLRenderer;
  cameraForward: Vector3;
  cameraRight: Vector3;
  _scene: Scene;
  _camera: PerspectiveCamera;
  _prevCameraPosition: Vector3;
  _animation: AnimationRuntime;
  _controls: OrbitControls;
  _stats: Stats;
  _reacter: WirePlaceReactRenderer;

  constructor(reacter: WirePlaceReactRenderer) {
    this.domElement = document.createElement('div');
    this.webGLRenderer = new WebGLRenderer({ antialias: true });
    this.webGLRenderer.shadowMap.enabled = true;
    this.webGLRenderer.shadowMap.type = PCFSoftShadowMap;
    this._scene = new Scene();
    this._camera = new PerspectiveCamera(45);
    this._prevCameraPosition = new Vector3();
    this._animation = new AnimationRuntime(this._scene);
    this._reacter = reacter;

    this.cameraForward = new Vector3(0, 0, -1);
    this.cameraRight = new Vector3(1, 0, 0);

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

    // TODO: find a less hacky way to achieve this
    window.addEventListener('resize', () => {
      this._reacter.update(10, this._scene, this._camera);
    });

    this._setupScene();
  }

  async _setupScene() {
    this._scene.background = new Color(0xdbf7ff);
    this._camera.position.set(0, 5, 4);
    const distance = this._camera.position.length();
    this._scene.fog = new Fog(0xdbf7ff, distance * 1.5, distance * 5);

    let l1 = new DirectionalLight(0xffffff);
    l1.position.set(0, 200, 200);
    l1.castShadow = true;
    l1.intensity = 0.4;
    this._scene.add(l1);

    const l2 = new DirectionalLight(0xffffff);
    l2.position.set(0, 200, 200);
    l2.castShadow = false;
    l2.intensity = 0.3;
    this._scene.add(l2);

    const l3 = new AmbientLight(0xffffff, 0.1);
    this._scene.add(l3);

    const l4 = new HemisphereLight(0xffffff, 0x444444);
    l4.position.set(0, 200, 0);
    this._scene.add(l4);

    const floorMaterial = new MeshStandardMaterial({
      color: 0x666666,
    });
    const floor = new Mesh(new PlaneBufferGeometry(2000, 2000), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this._scene.add(floor);

    const grid = new GridHelper(2000, 2000, 0, 0);
    if (!Array.isArray(grid.material)) {
      grid.material.opacity = 0.1;
      grid.material.transparent = true;
    }
    grid.position.setY(0.005);
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
    material.transparent = true;
    material.opacity = 0.7;
    const indicator = new Mesh(boxGeometry, material);
    indicator.position.y = 2;
    indicator.visible = false;
    obj.add(indicator);

    if (u.position) {
      obj.position.set(u.position.x, u.position.y, u.position.z);
    }

    this._animation.loadAsset(obj, u);
    this._scene.add(obj);
    return obj;
  }

  _updateCameraDirections() {
    this._camera.getWorldDirection(_v1);
    _v2.copy(_v1);
    _v1.y = 0;
    _v1.normalize();
    this.cameraForward.copy(_v1);
    _v2.cross(this._camera.up).normalize();
    this.cameraRight.copy(_v2);
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

  render = (delta: number, updates: Record<ObjectID, Update>) => {
    const sceneDirty = Object.keys(updates).length > 0;
    const controlsDirty = this._controls.update();

    if (sceneDirty) {
      this.applyUpdates(updates);
    }

    if (controlsDirty) {
      this._updateCameraDirections();
    }

    const animated = this._animation.update(delta);

    if (
      sceneDirty ||
      controlsDirty ||
      animated ||
      !this._prevCameraPosition.equals(this._camera.position)
    ) {
      this._reacter.update(delta, this._scene, this._camera);
    }
    this._prevCameraPosition.copy(this._camera.position);

    this.webGLRenderer.render(this._scene, this._camera);
    this._stats.update();
  };
}

export default WirePlaceThreeRenderer;
