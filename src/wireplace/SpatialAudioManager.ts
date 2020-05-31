import { Vector3 } from 'three';
import { ActorID } from 'wireplace-scene';

import { IRenderer } from './IRenderer';

interface SpatialAudioActor {
  actorId: ActorID;
  analyser: AnalyserNode;
  panner: PannerNode;
  output: GainNode;
}

const _v = new Vector3();

class SpatialAudioManager {
  _soundActors: Record<ActorID, SpatialAudioActor>;
  _context: BaseAudioContext;

  constructor() {
    this._soundActors = {};
    this._context = new AudioContext();
  }

  addActor(actorId: ActorID, input: AudioNode): SpatialAudioActor {
    const { context } = input;
    this._context = context;
    const panner = new PannerNode(context);
    const analyser = new AnalyserNode(context);
    const output = new GainNode(context);
    input.connect(analyser);
    analyser.connect(panner);
    panner.connect(output);
    output.connect(context.destination);

    panner.distanceModel = 'exponential';
    panner.refDistance = 2;
    panner.coneOuterAngle = 180;
    panner.coneInnerAngle = 120;
    panner.rolloffFactor = 5;

    const audioActor = { actorId, analyser, panner, output };
    this._soundActors[actorId] = audioActor;
    return audioActor;
  }

  removeActor(actorId: ActorID) {
    const actor = this._soundActors[actorId];
    if (!actor) {
      return;
    }

    const { output } = actor;
    output.disconnect();
    delete this._soundActors[actorId];
  }

  updateEnvironment = (
    tick: number,
    delta: number,
    activeActorId: ActorID,
    animated: Set<ActorID>,
    renderer: IRenderer
  ) => {
    const { currentTime } = this._context;
    const listenerPose = renderer.getRendererPose(activeActorId);
    if (!listenerPose) {
      return;
    }
    let { listener } = this._context;
    if (!listener) {
      return;
    }
    let p = listenerPose.position;
    let q = listenerPose.quaternion;
    _v.set(1, 0, 0).applyQuaternion(q);
    listener.positionX.setValueAtTime(p.x, currentTime);
    listener.positionY.setValueAtTime(p.y, currentTime);
    listener.positionZ.setValueAtTime(p.z, currentTime);
    listener.forwardX.setValueAtTime(_v.x, currentTime);
    listener.forwardY.setValueAtTime(_v.y, currentTime);
    listener.forwardZ.setValueAtTime(_v.z, currentTime);

    animated.forEach((actorId) => {
      const pose = renderer.getRendererPose(actorId);
      const soundActor = this._soundActors[actorId];
      if (!pose || !soundActor) {
        return;
      }

      const { panner } = soundActor;
      p = pose.position;
      q = pose.quaternion;
      _v.set(1, 0, 0).applyQuaternion(q);
      panner.positionX.setValueAtTime(p.x, currentTime);
      panner.positionY.setValueAtTime(p.y, currentTime);
      panner.positionZ.setValueAtTime(p.z, currentTime);
      panner.orientationX.setValueAtTime(_v.x, currentTime);
      panner.orientationY.setValueAtTime(_v.y, currentTime);
      panner.orientationZ.setValueAtTime(_v.z, currentTime);
    });
  };
}

export default SpatialAudioManager;
