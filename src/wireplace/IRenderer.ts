import { ActorID, Update } from 'wireplace-scene';
import { Vector3, Quaternion } from 'three';

export interface IPose {
  position: Vector3;
  quaternion: Quaternion;
}

export interface IRenderer {
  render: (
    tick: number,
    delta: number,
    updates: Record<ActorID, Update>,
    activeActorId: ActorID | null
  ) => void;
  cameraForward: Vector3;
  cameraRight: Vector3;
  toggleCameraLock: () => void;
  getRendererPose: (actorId: ActorID) => IPose | null;
  moveCamera: (coords: { x: number; y: number; z: number }) => void;
}
