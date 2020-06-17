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
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import {
  MapControls,
  OrbitControls,
} from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { Update, isRevisionNewer } from 'wireplace-scene';
import Stats from 'three/examples/jsm/libs/stats.module';

import { getGlobalEmitter, Events } from 'wireplace/TypedEventsEmitter';
import { IRenderer, IPose } from './IRenderer';
import { Notification } from 'components/ui';
import ActorRaycaster from './ActorRaycaster';
import AnimationRuntime from './AnimationRuntime';
import disposeObject3D from 'utils/disposeObject3D';
import getMaterial from 'utils/getMaterial';
import logger from 'utils/logger';
import OverlayRenderer from './OverlayRenderer';
import SpatialAudioManager from './SpatialAudioManager';
import { initializeMetadata, getAndAssertMetadata } from './RendererMetadata';

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
  overlay: OverlayRenderer;
  sam: SpatialAudioManager;
};

class ThreeRenderer implements IRenderer {
  domElement: HTMLDivElement;
  webGLRenderer: WebGLRenderer;
  composer: EffectComposer;
  cameraForward: Vector3;
  cameraRight: Vector3;
  raycaster: ActorRaycaster;

  _sam: SpatialAudioManager;
  _scene: Scene;
  _camera: PerspectiveCamera;
  _prevCameraPosition: Vector3;
  _light: DirectionalLight;
  _cameraLocked: boolean;
  _animation: AnimationRuntime;
  _controls: OrbitControls;
  _gizmos: TransformControls;
  _fxaa: ShaderPass;
  _stats: Stats;
  _overlay: OverlayRenderer;
  _controlTarget: Object3D | null;
  _cursor: Group;
  _floor: Group;
  _actorGroup: Group;
  _avatarActors: Object3D[];
  _propActors: Object3D[];
  _delayedDelta: number;
  _transformEnabled: boolean;

  constructor({ overlay, sam }: ThreeRendererProps) {
    this.domElement = document.createElement('div');
    const antialias = !isHighResolution();
    const showShadows = true;
    const enableBloom = false;
    const enableOutline = !isHighResolution();

    this.webGLRenderer = new WebGLRenderer({ antialias });
    this.webGLRenderer.autoClear = false;
    this.webGLRenderer.shadowMap.enabled = showShadows;
    this.webGLRenderer.shadowMap.type = PCFSoftShadowMap;
    this.webGLRenderer.setPixelRatio(1);

    const composer = new EffectComposer(this.webGLRenderer);
    composer.setPixelRatio(1);
    this.composer = composer;

    this._scene = new Scene();
    this._cursor = new Group();
    this._floor = new Group();
    this._actorGroup = new Group();
    this._scene.add(this._floor);
    this._scene.add(this._cursor);
    this._scene.add(this._actorGroup);
    this._propActors = [];
    this._avatarActors = [];

    this._camera = new PerspectiveCamera(45);
    this._prevCameraPosition = new Vector3();
    this._light = new DirectionalLight(0xffffff);
    this._cameraLocked = DEFAULT_CAMERA_LOCKED;
    this._animation = new AnimationRuntime(this._actorGroup);
    this._overlay = overlay;
    this._sam = sam;
    this._delayedDelta = 0;

    this.cameraForward = new Vector3(0, 0, -1);
    this.cameraRight = new Vector3(1, 0, 0);

    this._stats = new (Stats as any)();
    this._stats.dom.setAttribute('style', 'position: fixed; right: 0; top: 0');
    document.body.appendChild(this._stats.dom);

    const renderPass = new RenderPass(this._scene, this._camera);
    this.composer.addPass(renderPass);

    const width = this.domElement.clientWidth;
    const height = this.domElement.clientHeight;
    const resolution = new Vector2(width, height);
    const pixelRatio = this.webGLRenderer.getPixelRatio();

    if (enableBloom) {
      const bloomPass = new UnrealBloomPass(resolution, 0.3, 0.4, 0.8);
      this.composer.addPass(bloomPass);
    }

    const outlinePass = new OutlinePass(resolution, this._scene, this._camera);
    outlinePass.edgeStrength = 2;
    outlinePass.edgeThickness = 0.5;
    outlinePass.visibleEdgeColor.setHex(0xffff00);
    outlinePass.hiddenEdgeColor.setHex(0xaaaaaa);
    if (enableOutline) {
      this.composer.addPass(outlinePass);
    }

    this._fxaa = new ShaderPass(FXAAShader);
    (this._fxaa.material as any).uniforms['resolution'].value.x =
      1 / (width * pixelRatio);
    (this._fxaa.material as any).uniforms['resolution'].value.y =
      1 / (height * pixelRatio);

    if (antialias) {
      this.composer.addPass(this._fxaa);
    }

    logger.log('[Renderer] Effects:', {
      enableBloom,
      enableOutline,
      showShadows,
      antialias,
    });

    this.raycaster = new ActorRaycaster(
      this._propActors,
      this._camera,
      outlinePass
    );
    this.raycaster.enable();

    this._controlTarget = null;
    this._controls = initializeMapControls(this.webGLRenderer, this._camera);
    this._gizmos = initializeGizmos(
      this.webGLRenderer,
      this._controls,
      this._camera,
      outlinePass
    );

    this._setupScene();

    // TODO: find a less hacky way to achieve this
    getGlobalEmitter().on(Events.WINDOW_RESIZE, () => {
      this._overlay.update(Infinity, 0, this._avatarActors, this._camera);
    });

    getGlobalEmitter().on(Events.MOUSE_UP, (coords) => {
      if (this._transformEnabled) {
        const actorId = this.raycaster.raycast(coords);

        if (actorId) {
          const obj = this._getObjectById(actorId);
          if (obj) {
            this._gizmos.attach(obj);
          }
          return;
        }
      }

      this._gizmos.detach();

      this._clickCursor(coords);
      const { x, y, z } = this._cursor.position;
      getGlobalEmitter().emit(Events.MOVE_TO, { x, y, z });
    });

    this._transformEnabled = false;
    getGlobalEmitter().on(Events.SET_TRANSFORM_ENABLED, (enabled) => {
      if (this._transformEnabled !== enabled) {
        Notification.info({
          key: 'edit-mode',
          title: 'Edit mode',
          description: enabled ? 'Enabled' : 'Disabled',
        });
      }
      this._transformEnabled = enabled;
      if (!this._transformEnabled) {
        document.body.style.cursor = 'auto';
        this._gizmos.detach();
      }
    });

    getGlobalEmitter().on(Events.DELETION_REQUEST, () => {
      if (this._gizmos.object) {
        getGlobalEmitter().emit(Events.REMOVE_PROP, this._gizmos.object.name);
      }
    });

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
    this._scene.background = new Color(0xeeefff);
    this._camera.position.set(-5, 5, 5);
    const distance = this._camera.position.length();
    this._scene.fog = new Fog(0xeeefff, distance * 3, distance * 5);

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
      color: 0x717171,
    });
    const floor = new Mesh(new PlaneBufferGeometry(2000, 2000), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.position.setY(-0.01);
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
    grid.position.setY(-0.005);
    bgObjs.add(grid);

    bgObjs.add(this._gizmos);

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

    if (u.rotation) {
      obj.rotation.set(u.rotation.x, u.rotation.y, u.rotation.z, 'XYZ');
    }

    if (u.movable) {
      this._propActors.push(obj);
    } else {
      this._avatarActors.push(obj);
    }

    obj.userData = initializeMetadata(obj, u);
    this._animation.loadAsset(obj, u);
    this._actorGroup.add(obj);
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

  moveCamera(coords: { x: number; y: number; z: number }) {
    this._cameraLocked = false;

    _v1.copy(this._camera.position).sub(this._controls.target);

    this._controls.target.set(coords.x, coords.y, coords.z);
    this._controls.target.y += TARGET_Y;
    this._camera.position.copy(this._controls.target).add(_v1);
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
    this.composer.setSize(width, height);

    const pixelRatio = this.webGLRenderer.getPixelRatio();
    (this._fxaa.material as any).uniforms['resolution'].value.x =
      1 / (width * pixelRatio);
    (this._fxaa.material as any).uniforms['resolution'].value.y =
      1 / (height * pixelRatio);

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
          if (this._gizmos.object === obj) {
            this._gizmos.detach();
          }
          this._actorGroup.remove(obj);
          this._avatarActors = this._avatarActors.filter((a) => a !== obj);
          this._propActors = this._propActors.filter((a) => a !== obj);
          disposeObject3D(obj);
          this._overlay.removeOverlay(objectId);
        }
        continue;
      }

      obj = obj || this._initializeObject(objectId, u);

      const data = getAndAssertMetadata(obj);

      if (u.revision === undefined) {
        throw new Error('Revision number is missing');
      }

      if (!isRevisionNewer(data.revision, u.revision)) {
        return;
      }

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
      this._overlay.updateAudioLevels(audioLevels);
    }

    if (this._transformEnabled) {
      const showPointer = !!this.raycaster.raycast() && !this._gizmos.object;
      document.body.style.cursor = showPointer ? 'pointer' : 'auto';
    }

    if (sceneDirty || controlsDirty || animated || cameraDirty) {
      this._overlay.update(tick, delta, this._avatarActors, this._camera);
    }

    this.composer.render(delta);
    this._stats.update();
  };
}

function initializeMapControls(
  renderer: WebGLRenderer,
  camera: PerspectiveCamera
): OrbitControls {
  const controls = new MapControls(camera, renderer.domElement);

  controls.enableDamping = false;
  controls.dampingFactor = 0.05;
  controls.target.set(0, TARGET_Y, 0);
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2 - Math.PI / 16;
  controls.minPolarAngle = Math.PI / 16;
  controls.enableKeys = false;
  controls.minDistance = 1.0;
  controls.maxDistance = 10;
  return controls;
}

const MIN_HEIGHT = 0;
const MAX_HEIGHT = 2.8;
const ROTATION_SNAP = Math.PI / 8;
const TRANSLATION_SNAP = 0.05;

function initializeGizmos(
  renderer: WebGLRenderer,
  controls: OrbitControls,
  camera: PerspectiveCamera,
  outlinePass: OutlinePass
): TransformControls {
  const gizmos = new TransformControls(camera, renderer.domElement);
  gizmos.setTranslationSnap(TRANSLATION_SNAP);
  gizmos.setRotationSnap(ROTATION_SNAP);
  gizmos.addEventListener('change', () => {
    outlinePass.enabled = !gizmos.object;
  });
  gizmos.addEventListener('dragging-changed', (event) => {
    controls.enabled = !event.value;
    if (!event.value) {
      const object = gizmos.object!;
      if (!object) {
        return;
      }
      const actorId = object.name;
      if (!actorId) {
        return;
      }
      const p = object.position;
      const position = { x: p.x, y: p.y, z: p.z };
      const r = object.rotation;
      const rotation = { x: r.x, y: r.y, z: r.z };
      getGlobalEmitter().emit(Events.MOVE_PROP, {
        actorId,
        rotation,
        position,
      });
    }
  });
  gizmos.addEventListener('objectChange', () => {
    const object = gizmos.object;
    if (object) {
      object.position.setY(
        Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, object.position.y))
      );
    }
  });
  gizmos.setSize(1.5);
  getGlobalEmitter().on(Events.SET_TRANSFORM_MODE, (mode) => {
    gizmos.setMode(mode);
    if (mode === 'translate') {
      gizmos.showX = true;
      gizmos.showY = true;
      gizmos.showZ = true;
    } else if (mode === 'rotate') {
      gizmos.showX = false;
      gizmos.showY = true;
      gizmos.showZ = false;
    }
  });
  return gizmos;
}

export default ThreeRenderer;
