import {
  AmbientLight,
  CircleBufferGeometry,
  Color,
  DirectionalLight,
  Fog,
  GridHelper,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Raycaster,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { Update } from 'wireplace-scene';

import { getGlobalEmitter, Events } from 'wireplace/TypedEventsEmitter';
import AnimationRuntime from './AnimationRuntime';
import disposeObject3D from 'utils/disposeObject3D';
import getMaterial from 'utils/getMaterial';
import SpatialAudioManager from './SpatialAudioManager';
import OverlayRenderer from './OverlayRenderer';
import { IRenderer, IPose } from './IRenderer';
import logger from 'utils/logger';

type ObjectID = string;

const isHighResolution = () => {
  return (
    window.devicePixelRatio > 1 ||
    Math.max(window.screen.width, window.screen.height) > 1920
  );
};

const DEFAULT_CAMERA_LOCKED = false;
const TARGET_Y = 1.3;
const FULL_UPDATE_THRESHOLD = 1.0;

const _v1 = new Vector3();
const _v2 = new Vector3();
const _raycaster = new Raycaster();

type ThreeRendererProps = {
  reacter: OverlayRenderer;
  sam: SpatialAudioManager;
};

class ThreeRenderer implements IRenderer {
  domElement: HTMLDivElement;
  webGLRenderer: WebGLRenderer;
  cameraForward: Vector3;
  cameraRight: Vector3;
  _sam: SpatialAudioManager;
  _scene: Scene;
  _camera: PerspectiveCamera;
  _prevCameraPosition: Vector3;
  _light: DirectionalLight;
  _cameraLocked: boolean;
  _animation: AnimationRuntime;
  _controls: OrbitControls;
  _stats: Stats;
  _reacter: OverlayRenderer;
  _controlTarget: Object3D | null;
  _cursor: Object3D;
  _floor: Object3D;
  _delayedDelta: number;

  constructor({ reacter, sam }: ThreeRendererProps) {
    this.domElement = document.createElement('div');
    const antialias = !isHighResolution();
    const showShadows = true;

    this.webGLRenderer = new WebGLRenderer({ antialias });
    logger.log('[Renderer] Anti-alias:', antialias);

    this.webGLRenderer.shadowMap.enabled = showShadows;
    this.webGLRenderer.shadowMap.type = PCFSoftShadowMap;
    logger.log('[Renderer] Shadow Map:', showShadows);

    this.webGLRenderer.setPixelRatio(1);

    this._scene = new Scene();
    this._camera = new PerspectiveCamera(45);
    this._prevCameraPosition = new Vector3();
    this._light = new DirectionalLight(0xffffff);
    this._cameraLocked = DEFAULT_CAMERA_LOCKED;
    this._animation = new AnimationRuntime(this._scene);
    this._reacter = reacter;
    this._sam = sam;
    this._delayedDelta = 0;

    this.cameraForward = new Vector3(0, 0, -1);
    this.cameraRight = new Vector3(1, 0, 0);

    const controls = new MapControls(
      this._camera,
      this.webGLRenderer.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, TARGET_Y, 0);
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2 + Math.PI / 32;
    controls.minPolarAngle = Math.PI / 16;
    controls.enableKeys = false;
    controls.minDistance = 0.5;
    controls.maxDistance = 10;
    this._controls = controls;
    this._controlTarget = null;

    this._cursor = new Group();
    this._floor = new Group();
    this._scene.add(this._floor);
    this._scene.add(this._cursor);

    this._stats = new (Stats as any)();
    this._stats.dom.setAttribute('style', 'position: fixed; right: 0; top: 0');
    document.body.appendChild(this._stats.dom);

    // TODO: find a less hacky way to achieve this
    getGlobalEmitter().on(Events.WINDOW_RESIZE, () => {
      this._reacter.update(Infinity, 0, this._scene, this._camera);
    });

    getGlobalEmitter().on(Events.MOUSE_UP, (coords) => {
      this._clickCursor(coords);
      const { x, y, z } = this._cursor.position;
      getGlobalEmitter().emit(Events.MOVE_TO, { x, y, z });
    });

    this._setupScene();

    (window as any).renderer = this;
  }

  // x and y are in screen space
  _clickCursor = ({ x, y }: { x: number; y: number }) => {
    _raycaster.setFromCamera({ x, y }, this._camera);
    const intersects = _raycaster.intersectObjects(this._floor.children);
    if (intersects.length > 0) {
      const m = getMaterial(this._cursor);
      if (!m) {
        throw new Error('Cursor is missing');
      }
      m.opacity = 0.5;
      this._cursor.position.copy(intersects[0].point);
      this._cursor.position.y = 0.01;
      this._animation.tween(this._cursor, { opacity: 0 }, 0.8);
    }
  };

  async _setupScene() {
    this._scene.background = new Color(0xdbf7ff);
    this._camera.position.set(0, 4, 5);
    const distance = this._camera.position.length();
    this._scene.fog = new Fog(0xdbf7ff, distance * 1.5, distance * 5);

    const bgObjs = new Group();

    this._light.position.set(0, 100, 100);
    this._light.shadow.camera.far = 500;
    this._light.shadow.camera.left = -20;
    this._light.shadow.camera.bottom = -20;
    this._light.shadow.camera.right = 20;
    this._light.shadow.camera.top = 20;
    this._light.castShadow = true;
    this._light.intensity = 0.4;
    this._light.shadow.mapSize.width = 1024;
    this._light.shadow.mapSize.height = 1024;

    bgObjs.add(this._light);
    bgObjs.add(this._light.target);

    const l2 = new DirectionalLight(0xffffff);
    l2.position.set(0, 200, 200);
    l2.castShadow = false;
    l2.intensity = 0.3;
    bgObjs.add(l2);

    const l3 = new AmbientLight(0xffffff, 0.1);
    bgObjs.add(l3);

    const l4 = new HemisphereLight(0xffffff, 0x444444);
    l4.position.set(0, 200, 0);
    bgObjs.add(l4);

    const floorMaterial = new MeshStandardMaterial({
      color: 0x666666,
    });
    const floor = new Mesh(new PlaneBufferGeometry(2000, 2000), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this._floor.add(floor);

    const material = new MeshBasicMaterial({
      color: 0xffcc00,
    });
    material.transparent = true;
    material.opacity = 0;
    const geometry = new CircleBufferGeometry(0.2, 20);
    const pointer = new Mesh(geometry, material);
    pointer.rotateX(-Math.PI / 2);
    this._cursor.add(pointer);

    const grid = new GridHelper(2000, 2000, 0, 0);
    if (!Array.isArray(grid.material)) {
      grid.material.opacity = 0.1;
      grid.material.transparent = true;
    }
    grid.position.setY(0.005);
    bgObjs.add(grid);

    this._scene.add(bgObjs);
  }

  _getObjectById(objectId: ObjectID): Object3D | null {
    return this._scene.getObjectByName(objectId) || null;
  }

  _initializeObject(objectId: ObjectID, u: Update): Object3D {
    const obj = new Object3D();
    obj.name = objectId;

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

  _updateControls(targetObjectId: string | null) {
    this._light.target.position.copy(this._controls.target);
    if (!this._cameraLocked) {
      return;
    }

    if (targetObjectId) {
      if (
        !this._controlTarget ||
        (this._controlTarget && this._controlTarget.name !== targetObjectId)
      ) {
        this._controlTarget =
          this._scene.getObjectByName(targetObjectId) || null;
      }
    } else if (this._controlTarget) {
      this._controlTarget = null;
    }

    if (this._controlTarget) {
      _v1.copy(this._camera.position).sub(this._controls.target);

      this._controls.target.copy(this._controlTarget.position);
      this._controls.target.y += TARGET_Y;
      this._camera.position.copy(this._controls.target).add(_v1);
    }
  }

  toggleCameraLock = () => {
    this._cameraLocked = !this._cameraLocked;
  };

  setDOMElement(element: HTMLDivElement) {
    this.domElement = element;
    element.appendChild(this.webGLRenderer.domElement);
    this.resize();
  }

  resize = () => {
    const width = this.domElement.clientWidth;
    const height = this.domElement.clientHeight;
    this.webGLRenderer.setSize(width, height);
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
  };

  getRendererPose(objectId: string): IPose | null {
    const obj = this._getObjectById(objectId);
    if (!obj) {
      return null;
    }
    return obj;
  }

  applyUpdates(updates: Record<ObjectID, Update>) {
    for (const objectId in updates) {
      let obj = this._getObjectById(objectId);
      const u = updates[objectId];

      if (u.deleted) {
        if (obj) {
          this._scene.remove(obj);
          disposeObject3D(obj);
        }
        continue;
      }

      obj = obj || this._initializeObject(objectId, u);
      this._animation.applyUpdate(obj, u);
    }
  }

  render = (
    tick: number,
    delta: number,
    updates: Record<ObjectID, Update>,
    activeActorId: ObjectID | null
  ) => {
    const fullDelta = this._delayedDelta + delta;
    const fullUpdate = fullDelta >= FULL_UPDATE_THRESHOLD;
    this._delayedDelta += delta;
    if (fullUpdate) {
      this._delayedDelta = 0;
    }

    this._updateControls(activeActorId);
    const sceneDirty = Object.keys(updates).length > 0;
    const controlsDirty = this._controls.update();

    if (sceneDirty) {
      this.applyUpdates(updates);
    }

    if (controlsDirty) {
      this._updateCameraDirections();
    }
    const cameraDirty = !this._prevCameraPosition.equals(this._camera.position);
    this._prevCameraPosition.copy(this._camera.position);

    const animated = this._animation.update(tick, delta);

    if (fullUpdate && animated && activeActorId) {
      this._sam.updateEnvironment(
        tick,
        fullDelta,
        activeActorId,
        animated,
        this
      );

      const audioLevels = this._sam.getAudioLevels();
      this._reacter.updateAudioLevels(audioLevels);
    }

    if (sceneDirty || controlsDirty || animated || cameraDirty) {
      this._reacter.update(tick, delta, this._scene, this._camera);
    }

    this.webGLRenderer.render(this._scene, this._camera);
    this._stats.update();
  };
}

export default ThreeRenderer;
