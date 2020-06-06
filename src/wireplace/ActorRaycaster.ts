import { Object3D, PerspectiveCamera, Raycaster, Vector2 } from 'three';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';

import { getGlobalEmitter, Events } from 'wireplace/TypedEventsEmitter';
import { ActorID } from 'wireplace-scene';

class ActorRaycaster {
  _mousePosition: Vector2;
  _mouseDirty: boolean;
  _camera: PerspectiveCamera;
  _raycaster: Raycaster;
  _propActors: Object3D[];
  _outlinePass: OutlinePass;

  constructor(
    propActors: Object3D[],
    camera: PerspectiveCamera,
    outlinePass: OutlinePass
  ) {
    this._mousePosition = new Vector2();
    this._mouseDirty = false;
    this._camera = camera;
    this._raycaster = new Raycaster();
    this._propActors = propActors;
    this._outlinePass = outlinePass;
  }

  _handleMouseMove = (event: { x: number; y: number }) => {
    this._mousePosition.set(event.x, event.y);
    this._mouseDirty = true;
  };

  enable() {
    getGlobalEmitter().on(Events.MOUSE_MOVE, this._handleMouseMove);
  }

  disable() {
    getGlobalEmitter().off(Events.MOUSE_MOVE, this._handleMouseMove);
  }

  raycast(coords?: { x: number; y: number }): ActorID | null {
    if (this._mouseDirty || coords) {
      this._raycaster.setFromCamera(
        coords || this._mousePosition,
        this._camera
      );
      const intersects = this._raycaster.intersectObjects(
        this._propActors,
        true
      );
      if (intersects.length > 0) {
        let obj: Object3D | null = intersects[0].object;
        while (obj && obj.userData.assetId === undefined) {
          obj = obj.parent;
        }
        if (obj) {
          this._outlinePass.selectedObjects = [intersects[0].object];
          return obj.name;
        }
      }
    }
    this._outlinePass.selectedObjects = [];
    return null;
  }
}

export default ActorRaycaster;
