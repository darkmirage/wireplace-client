import { Vector3 } from 'three';
import { ActorID } from 'wireplace-scene';

import { IRenderer } from './IRenderer';

interface SpatialAudioActor {
  actorId: ActorID;
  analyser: AnalyserNode;
  panner: PannerNode | null;
  output: GainNode;
}

const REF_DISTANCE = 5.0;
const ROLL_OFF_FACTOR = 4.0;

const _v = new Vector3();

class SpatialAudioManager {
  _soundActors: Record<ActorID, SpatialAudioActor>;
  _context: BaseAudioContext;

  constructor() {
    this._soundActors = {};
    this._context = new AudioContext();
  }

  addActor(
    actorId: ActorID,
    input: AudioNode,
    trueSpatial: boolean = false
  ): SpatialAudioActor {
    const { context } = input;
    this._context = context;
    const analyser = new AnalyserNode(context);
    const output = new GainNode(context);
    input.connect(analyser);

    output.connect(context.destination);

    let panner = null;
    if (trueSpatial) {
      panner = new PannerNode(context);
      panner.distanceModel = 'exponential';
      panner.refDistance = REF_DISTANCE;
      panner.coneOuterAngle = 250;
      panner.coneInnerAngle = 120;
      panner.coneOuterGain = 0.3;
      panner.rolloffFactor = ROLL_OFF_FACTOR;
      analyser.connect(panner);
      panner.connect(output);
    } else {
      analyser.connect(output);
    }

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
    const listenerPose = renderer.getRendererPose(activeActorId);
    const { currentTime } = this._context;
    if (!listenerPose) {
      return;
    }
    let { listener } = this._context;
    if (!listener) {
      return;
    }
    const p1 = listenerPose.position;
    const q1 = listenerPose.quaternion;
    _v.set(0, 0, 1).applyQuaternion(q1);
    listener.positionX.value = p1.x;
    listener.positionY.value = p1.y;
    listener.positionZ.value = p1.z;
    listener.forwardX.value = _v.x;
    listener.forwardY.value = _v.y;
    listener.forwardZ.value = _v.z;

    animated.forEach((actorId) => {
      const pose = renderer.getRendererPose(actorId);
      const soundActor = this._soundActors[actorId];
      if (!pose || !soundActor) {
        return;
      }

      const p2 = pose.position;
      const q2 = pose.quaternion;
      const { panner, output } = soundActor;
      if (panner) {
        _v.set(0, 0, 1).applyQuaternion(q2);
        panner.positionX.value = p2.x;
        panner.positionY.value = p2.y;
        panner.positionZ.value = p2.z;
        panner.orientationX.value = _v.x;
        panner.orientationY.value = _v.y;
        panner.orientationZ.value = _v.z;
      } else {
        _v.copy(p1).sub(p2);
        const d = _v.length();
        const gain = Math.pow(
          Math.max(d, REF_DISTANCE) / REF_DISTANCE,
          -ROLL_OFF_FACTOR
        );
        output.gain.setValueAtTime(gain, currentTime);
      }
    });
  };
}

export default SpatialAudioManager;
