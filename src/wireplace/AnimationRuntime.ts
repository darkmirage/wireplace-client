import { AnimationMixer, LoopRepeat, Object3D, Group, Vector3 } from 'three';
import { Update, ActorID } from 'wireplace-scene';

import Tween, { TweenTarget } from 'wireplace/Tween';
import { getGlobalEmitter, Events } from 'wireplace/TypedEventsEmitter';
import { AnimationAction, AnimationActions } from 'constants/Animation';
import { loadAsset } from 'loaders/PreconfiguredAssets';
import {
  getMetadata,
  getAndAssertMetadata,
  getThreeAnimationActionFromMetadata,
} from './RendererMetadata';

const SMOOTHING_CONSTANT = 5.0;
const ANIMATION_FADE_TIME = 0.3;

const _v = new Vector3();

class AnimationRuntime {
  _actorObjects: Array<Object3D>;
  _activeTweens: Array<Tween>;

  constructor(actorGroup: Group) {
    this._actorObjects = actorGroup.children;
    this._activeTweens = [];
  }

  _updateAnimation(delta: number, obj: Object3D) {
    const data = getAndAssertMetadata(obj);
    if (!data.mixer) {
      return;
    }

    const { playing } = data;
    if (playing) {
      const action = data.mixer.clipAction(playing.clip);
      if (action.paused) {
        this.startAction(obj, AnimationActions.IDLE);
      }
    }

    data.mixer.update(delta);
  }

  loadAsset(obj: Object3D, u: Update) {
    let data = getAndAssertMetadata(obj);

    const assetId = u.assetId || 0;
    if (data.assetId === assetId) {
      return;
    }

    loadAsset(assetId).then((g) => {
      data = getAndAssertMetadata(obj);

      if (data.assetId === assetId) {
        return;
      }

      if (data.asset) {
        obj.remove(data.asset);
      }

      obj.add(g);
      data.assetId = assetId;
      data.asset = g;
      data.mixer = new AnimationMixer(g);
      this.startAction(obj, data.actionType, data.actionState);
    });
  }

  tween(obj: Object3D, target: TweenTarget, duration: number = 1000): Tween {
    const tween = new Tween(obj, duration).to(target);
    this._activeTweens.push(tween);
    return tween;
  }

  startAction(
    obj: Object3D,
    actionType: AnimationAction,
    actionState: number = -1
  ) {
    const data = getAndAssertMetadata(obj);
    const { playing, mixer } = data;
    if (!mixer) {
      return;
    }
    const action = getThreeAnimationActionFromMetadata(obj, actionType);

    if (!action) {
      return;
    }

    if (playing) {
      if (playing.clip !== action.getClip()) {
        const prevAction = getThreeAnimationActionFromMetadata(
          obj,
          playing.actionType
        );
        if (prevAction) {
          prevAction.fadeOut(ANIMATION_FADE_TIME);
        }
      } else {
        return;
      }
    }

    action.reset();
    action.clampWhenFinished = true;
    if (actionState > 0) {
      action.setLoop(LoopRepeat, actionState);
    } else {
      action.setLoop(LoopRepeat, Infinity);
    }

    action.fadeIn(ANIMATION_FADE_TIME);
    action.play();
    data.playing = { clip: action.getClip(), actionType };
  }

  resumeAction(obj: Object3D, actionType: AnimationActions) {
    const action = getThreeAnimationActionFromMetadata(obj, actionType);
    if (action && action.paused) {
      action.timeScale = 1;
    }
  }

  pauseAction(obj: Object3D, actionType: AnimationActions) {
    const action = getThreeAnimationActionFromMetadata(obj, actionType);
    if (action && !action.paused) {
      action.halt(ANIMATION_FADE_TIME);
    }
  }

  applyUpdate(obj: Object3D, u: Update) {
    const data = getAndAssertMetadata(obj);

    if (u.revision === undefined) {
      throw new Error('Missing revision number');
    }
    data.revision = u.revision;

    if (u.color) {
      data.color = u.color;
    }
    if (u.assetId !== undefined) {
      this.loadAsset(obj, u);
    }
    if (u.speed !== undefined) {
      data.speed = u.speed;
    }
    if (u.movable !== undefined) {
      data.movable = u.movable;
    }
    if (u.position) {
      if (data.movable) {
        obj.position.set(u.position.x, u.position.y, u.position.z);
      } else {
        data.target.position.set(u.position.x, u.position.y, u.position.z);
      }
    }
    if (u.rotation) {
      if (data.movable) {
        obj.rotation.set(u.rotation.x, u.rotation.y, u.rotation.z, 'XYZ');
      } else {
        data.target.rotation.set(
          u.rotation.x,
          u.rotation.y,
          u.rotation.z,
          'XYZ'
        );
      }
    }
    if (u.scale) {
      data.target.scale.set(u.scale.x, u.scale.y, u.scale.z);
    }
    if (u.up) {
      data.target.up.set(u.up.x, u.up.y, u.up.z);
    }
    if (u.action) {
      this.startAction(obj, u.action.type, u.action.state);
    }
  }

  update = (tick: number, delta: number): Set<ActorID> | null => {
    const updated = new Set<ActorID>();
    for (const t of this._activeTweens) {
      const tween = t as Tween;
      tween.update(delta);
      if (tween.ended) {
        this._activeTweens = this._activeTweens.filter((t_) => t_ !== t);
      }
    }

    for (const obj of this._actorObjects) {
      const data = getMetadata(obj);
      if (!data) {
        continue;
      }

      const { target, speed, actionType, movable } = data;

      // Objects that are movable by user selection should not be tweened
      if (movable) {
        continue;
      }

      _v.copy(target.position).sub(obj.position);
      if (!obj.position.equals(target.position)) {
        data.lastTickMoved = tick;
        updated.add(obj.name);

        _v.copy(target.position).sub(obj.position);
        const distance = _v.length();
        const progress = Math.min(distance, speed * delta);
        _v.normalize();
        _v.multiplyScalar(progress);
        obj.position.add(_v);

        _v.copy(target.position).sub(obj.position);
        if (_v.length() <= 0.005) {
          obj.position.copy(target.position);
        } else {
          if (actionType === AnimationActions.WALK) {
            this.resumeAction(obj, AnimationActions.WALK);
          } else {
            this.startAction(obj, AnimationActions.WALK);
          }
        }
      } else if (tick - data.lastTickMoved > 10) {
        getGlobalEmitter().emit(Events.ANIMATION_STOPPED, {
          actorId: obj.name,
          actionType: AnimationActions.WALK,
        });
        data.lastTickMoved = Infinity;
      } else if (actionType === AnimationActions.WALK) {
        this.pauseAction(obj, AnimationActions.WALK);
      }

      if (!obj.quaternion.equals(target.quaternion)) {
        updated.add(obj.name);
        if (target.quaternion.angleTo(obj.quaternion) < 0.01) {
          obj.quaternion.copy(target.quaternion);
        } else {
          obj.quaternion.slerp(target.quaternion, 1 / SMOOTHING_CONSTANT);
        }
      }

      this._updateAnimation(delta, obj);
      // TODO:
      // - Update scale and up
      // - Implement proper interpolation and easing
    }
    return updated.size === 0 ? null : updated;
  };
}

export default AnimationRuntime;
