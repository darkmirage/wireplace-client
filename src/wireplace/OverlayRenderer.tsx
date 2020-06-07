import { create } from 'jss';
import camelCase from 'jss-plugin-camel-case';
import defaultUnit from 'jss-plugin-default-unit';
import { Object3D, Camera, Vector3 } from 'three';

import WirePlaceClient from 'wireplace/WirePlaceClient';
import hexToRGB from 'utils/hexToRGB';

type ActorID = string;

interface UserInfo {
  actorId: ActorID;
  username: string;
}

const _v = new Vector3();

class OverlayRenderer {
  _domElement: HTMLDivElement;
  _getClient: () => WirePlaceClient;
  _userInfo: Record<ActorID, UserInfo>;
  _audioLevels: Record<ActorID, number>;

  constructor(domElement: HTMLDivElement, getClient: () => WirePlaceClient) {
    this._domElement = document.createElement('div');
    domElement.append(this._domElement);
    this._domElement.className = classes.overlayContainer;
    this._getClient = getClient;
    this._userInfo = {};
    this._audioLevels = {};
  }

  updateAudioLevels(audioLevels: Record<ActorID, number>) {
    this._audioLevels = audioLevels;
  }

  removeOverlay(actorId: ActorID) {
    const element = document.getElementById('actor-' + actorId);
    if (element) {
      element.remove();
    }
  }

  update(
    tick: number,
    delta: number,
    actorObjects: Object3D[],
    camera: Camera
  ) {
    const fetchIds: ActorID[] = [];

    for (const child of actorObjects) {
      if (!child.name) {
        continue;
      }

      const actorId = child.name;

      let element = document.getElementById('actor-' + actorId);
      let nameplate = document.getElementById('nameplate-' + actorId);
      let audioIndicator = document.getElementById('audio-' + actorId);
      if (!element || !nameplate || !audioIndicator) {
        element = document.createElement('div');
        element.id = 'actor-' + actorId;
        element.className = classes.overlayActor;
        this._domElement.append(element);

        audioIndicator = document.createElement('i');
        audioIndicator.id = 'audio-' + actorId;
        element.append(audioIndicator);

        nameplate = document.createElement('div');
        nameplate.id = 'nameplate-' + actorId;
        nameplate.className = classes.overlayNameplate;
        element.append(nameplate);
      }

      _v.copy(child.up).multiplyScalar(2.2);
      _v.add(child.position);
      _v.project(camera);
      const widthHalf = this._domElement.clientWidth / 2;
      const heightHalf = this._domElement.clientHeight / 2;
      let { x, y } = _v;
      x = x * widthHalf + widthHalf;
      y = -(y * heightHalf) + heightHalf;
      if (
        x < 0 ||
        x > this._domElement.clientWidth ||
        y < 0 ||
        y > this._domElement.clientHeight
      ) {
        element.style.display = 'none';
        continue;
      } else {
        element.style.display = '';
      }
      _v.copy(child.position).sub(camera.position);

      const distance = _v.length();
      const color: number = child.userData.color as any; // TODO: make this type safe
      const audioLevel = this._audioLevels[actorId];

      if (audioLevel !== undefined) {
        audioIndicator.style.visibility = 'visible';
        const opacity = Math.min(1, Math.max(0, audioLevel));
        audioIndicator.style.opacity = opacity.toString();
        if (audioLevel >= 0.5) {
          audioIndicator.className =
            'rs-icon rs-icon-volume-up rs-icon-size-3x';
        } else if (audioLevel > 0.01) {
          audioIndicator.className =
            'rs-icon rs-icon-volume-down rs-icon-size-3x';
        } else {
          audioIndicator.className =
            'rs-icon rs-icon-volume-off rs-icon-size-3x';
        }
      } else {
        audioIndicator.style.visibility = 'hidden';
      }

      element.style.zIndex = Math.floor(10000 - distance + 3).toString();
      element.style.top = `${y}px`;
      element.style.left = `${x}px`;
      nameplate.style.backgroundColor = hexToRGB(color);

      if (this._userInfo[actorId]) {
        nameplate.innerText = this._userInfo[actorId].username;
      } else {
        this._userInfo[actorId] = { actorId, username: '' };
        fetchIds.push(actorId);
      }
    }

    this._getClient()
      .fetchUsersInfo(fetchIds)
      .then((userInfo) => {
        Object.assign(this._userInfo, userInfo);
      });
  }
}
const jss = create();
jss.use(camelCase(), defaultUnit());
const sheet = jss.createStyleSheet(
  {
    overlayContainer: {
      alignItems: 'center',
      display: 'flex',
      height: '100%',
      justifyContent: 'center',
      outline: 'none',
      pointerEvents: 'none',
      position: 'absolute',
      top: 0,
      width: '100%',
      zIndex: 5,
    },
    overlayActor: {
      display: 'flex',
      flexDirection: 'column',
      pointerEvents: 'auto',
      position: 'absolute',
      transform: 'translate(-50%, -100px)',
      alignItems: 'center',
      height: '100px',
      justifyContent: 'flex-end',
    },
    overlayNameplate: {
      marginTop: 8,
      color: '#ffffff',
      fontWeight: 500,
      opacity: 0.8,
      borderRadius: 8,
      paddingBottom: 4,
      paddingLeft: 8,
      paddingRight: 8,
      paddingTop: 4,
    },
  },
  {
    classNamePrefix: 'OverlayRenderer',
  }
);
const classes = sheet.classes;
sheet.attach();

export default OverlayRenderer;
