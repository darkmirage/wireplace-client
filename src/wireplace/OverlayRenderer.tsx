import { create } from 'jss';
import preset from 'jss-preset-default';
import { Object3D, Camera, Vector3 } from 'three';

import WirePlaceClient from 'wireplace/WirePlaceClient';
import hexToRGB from 'utils/hexToRGB';
import { Events, getGlobalEmitter } from 'wireplace/TypedEventsEmitter';

type ActorID = string;

interface UserInfo {
  actorId: ActorID;
  username: string;
}

const _v = new Vector3();

function handleClick(event: MouseEvent) {
  event.stopPropagation();
  getGlobalEmitter().emit(
    Events.SET_CAMERA_TARGET,
    (event.target as HTMLDivElement).dataset.actorId
  );
}

class OverlayRenderer {
  _domElement: HTMLDivElement;
  _listElement: HTMLDivElement;
  _getClient: () => WirePlaceClient;
  _userInfo: Record<ActorID, UserInfo>;
  _audioLevels: Record<ActorID, number>;

  constructor(getClient: () => WirePlaceClient) {
    this._domElement = document.getElementById('overlay') as any;
    this._listElement = document.getElementById('user-list') as any;
    this._listElement.className = classes.userList;
    this._domElement.className = classes.overlayContainer;

    const header = document.createElement('div');
    header.innerText = 'Online users';
    header.className = classes.userListHeader;
    this._listElement.append(header);

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
    const entry = document.getElementById('user-list-' + actorId);
    if (entry) {
      entry.remove();
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
      let listEntry = document.getElementById('user-list-' + actorId);

      if (!element) {
        element = document.createElement('div');
        element.id = 'actor-' + actorId;
        element.className = classes.overlayActor;
        this._domElement.append(element);
      }

      if (!audioIndicator) {
        audioIndicator = document.createElement('i');
        audioIndicator.id = 'audio-' + actorId;
        element.append(audioIndicator);
      }

      if (!nameplate) {
        nameplate = document.createElement('div');
        nameplate.id = 'nameplate-' + actorId;
        nameplate.className = classes.overlayNameplate;
        element.append(nameplate);
      }

      if (!listEntry) {
        listEntry = document.createElement('div');
        listEntry.id = 'user-list-' + actorId;
        listEntry.className = classes.userListEntry;
        listEntry.dataset.actorId = actorId;
        listEntry.addEventListener('click', handleClick, true);
        this._listElement.append(listEntry);
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

      const backgroundColor = hexToRGB(color);
      nameplate.style.backgroundColor = backgroundColor;
      listEntry.style.backgroundColor = backgroundColor;

      if (this._userInfo[actorId]) {
        if (!nameplate.innerText) {
          nameplate.innerText = this._userInfo[actorId].username;
          listEntry.innerText = this._userInfo[actorId].username;
        }
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
jss.setup(preset());
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
    userList: {
      maxHeight: '70%',
      overflowY: 'scroll',
      position: 'absolute',
      right: 8,
      top: 100,
      zIndex: 6,
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 4,
        pointerEvents: 'auto',
        width: 8,
      },
      '&::-webkit-scrollbar': {
        background: 'rgba(0, 0, 0, 0)',
        pointerEvents: 'auto',
        width: 8,
      },
    },
    userListEntry: {
      borderRadius: 8,
      color: '#ffffff',
      cursor: 'pointer',
      fontWeight: 500,
      marginTop: 8,
      opacity: 0.5,
      paddingBottom: 4,
      paddingLeft: 8,
      paddingRight: 8,
      paddingTop: 4,
      transition: '200ms',
      '&:hover': {
        opacity: 1,
      },
    },
    userListHeader: {
      color: '#333',
      fontWeight: 'bold',
    },
    '@media (max-width: 400px)': {
      userList: {
        display: 'none',
      },
    },
  },
  {
    classNamePrefix: 'OverlayRenderer-',
  }
);
const classes = sheet.classes;
sheet.attach();

export default OverlayRenderer;
