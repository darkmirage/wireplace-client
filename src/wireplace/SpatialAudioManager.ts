import { Vector3 } from 'three';
import { ActorID } from 'wireplace-scene';

import { IRenderer } from './IRenderer';

interface SpatialAudioActor {
  actorId: ActorID;
  analyser: AnalyserNode | null;
  panner: PannerNode | null;
  output: GainNode;
  gain: number;
}

const REF_DISTANCE = 4.0;
const ROLL_OFF_FACTOR = 5.0;
const FFT_SIZE = 2 ** 5;

const _v = new Vector3();

class SpatialAudioManager {
  _soundActors: Record<ActorID, SpatialAudioActor>;
  _context: BaseAudioContext | null;
  _usePanner: boolean;
  _useAnalyser: boolean;

  constructor() {
    this._soundActors = {};
    this._context = null;
    this._usePanner = false;
    this._useAnalyser = false;
  }

  addActor(actorId: ActorID, input: AudioNode): SpatialAudioActor {
    const { context } = input;
    this._context = context;

    const nodes: AudioNode[] = [input];

    let panner = null;
    if (this._usePanner) {
      panner = new PannerNode(context);
      panner.distanceModel = 'exponential';
      panner.refDistance = REF_DISTANCE;
      panner.coneOuterAngle = 250;
      panner.coneInnerAngle = 120;
      panner.coneOuterGain = 0.3;
      panner.rolloffFactor = ROLL_OFF_FACTOR;
      nodes.push(panner);
    }

    const output = new GainNode(context);
    nodes.push(output);

    let analyser = null;
    if (this._useAnalyser) {
      analyser = new AnalyserNode(context);
      analyser.fftSize = FFT_SIZE;
      nodes.push(analyser);
    }

    for (let i = 0; i < nodes.length; i += 1) {
      if (i === nodes.length - 1) {
        nodes[i].connect(context.destination);
      } else {
        nodes[i].connect(nodes[i + 1]);
      }
    }

    const audioActor = { actorId, panner, analyser, output, gain: 0 };
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

  clearActors() {
    Object.values(this._soundActors).forEach(({ output }) => {
      output.disconnect();
    });
    this._soundActors = {};
  }

  getAudioLevels(): Record<ActorID, number> {
    const levels: Record<ActorID, number> = {};
    for (const actorId in this._soundActors) {
      const { gain } = this._soundActors[actorId];
      levels[actorId] = gain;
    }
    return levels;
  }

  updateEnvironment = (
    tick: number,
    delta: number,
    activeActorId: ActorID,
    animated: Set<ActorID>,
    renderer: IRenderer
  ) => {
    const listenerPose = renderer.getRendererPose(activeActorId);
    if (!this._context) {
      return;
    }
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

    // listener API is missing (Firefox)
    if (listener.positionX) {
      listener.positionX.value = p1.x;
      listener.positionY.value = p1.y;
      listener.positionZ.value = p1.z;
      listener.forwardX.value = _v.x;
      listener.forwardY.value = _v.y;
      listener.forwardZ.value = _v.z;
    }

    const updateActor = this._updateActor.bind(this, p1, renderer, currentTime);

    if (animated.has(activeActorId)) {
      Object.keys(this._soundActors).forEach(updateActor);
    } else {
      animated.forEach(updateActor);
    }
  };

  _updateActor = (
    listenerPose: Vector3,
    renderer: IRenderer,
    currentTime: number,
    actorId: ActorID
  ) => {
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
      _v.copy(listenerPose).sub(p2);
      const d = _v.length();
      const gain = Math.pow(
        Math.max(d, REF_DISTANCE) / REF_DISTANCE,
        -ROLL_OFF_FACTOR
      );
      soundActor.gain = gain;
      output.gain.setValueAtTime(gain, currentTime);
    }
  };
}

export default SpatialAudioManager;
