import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import { Object3D, Camera, Vector3 } from 'three';

import { Icon } from 'components/ui';
import WirePlaceClient from 'wireplace/WirePlaceClient';
import hexToRGB from 'utils/hexToRGB';
import type { Theme } from 'themes';
import { PreventPropagation } from 'components/ui';

type ActorID = string;

type OverlayActor = {
  actorId: string;
  x: number;
  y: number;
  color: number;
  username?: string;
  distance: number;
  audioLevel?: number;
};

type OverlayProps = {
  delta: number;
  actors: Array<OverlayActor>;
};

interface UserInfo {
  actorId: ActorID;
  username: string;
}

const v = new Vector3();

const Overlay = (props: OverlayProps) => {
  const classes = useStyles({ theme: useTheme() });

  const overlays = props.actors.map(
    ({ audioLevel, distance, username, actorId, x, y, color = 0 }, i) => {
      if (!username) {
        return null;
      }

      let audioIndicator = null;
      if (audioLevel !== undefined) {
        const style = { opacity: Math.min(1, Math.max(0, audioLevel)) };
        if (audioLevel >= 0.5) {
          audioIndicator = <Icon size="3x" style={style} icon="volume-up" />;
        } else if (audioLevel > 0.01) {
          audioIndicator = <Icon size="3x" style={style} icon="volume-down" />;
        } else {
          audioIndicator = <Icon size="3x" style={style} icon="volume-off" />;
        }
      }

      return (
        <PreventPropagation
          className={classes.actor}
          key={actorId}
          style={{
            zIndex: distance + 3,
            top: y,
            left: x,
          }}
        >
          {audioIndicator}
          <div
            className={classes.nameplate}
            style={{ background: hexToRGB(color) }}
          >
            {username}
          </div>
        </PreventPropagation>
      );
    }
  );
  return <div className={classes.container}>{overlays}</div>;
};

class OverlayRenderer {
  _setOverlayContent: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  _domElement: HTMLDivElement;
  _getClient: () => WirePlaceClient;
  _userInfo: Record<ActorID, UserInfo>;
  _audioLevels: Record<ActorID, number>;

  constructor(
    setOverlayContent: React.Dispatch<React.SetStateAction<React.ReactNode>>,
    domElement: HTMLDivElement,
    getClient: () => WirePlaceClient
  ) {
    this._setOverlayContent = setOverlayContent;
    this._domElement = domElement;
    this._getClient = getClient;
    this._userInfo = {};
    this._audioLevels = {};
  }

  _updateUserInfo(actors: Array<OverlayActor>) {
    const actorIds = actors
      .map(({ actorId }) => {
        if (actorId in this._userInfo) {
          return '';
        } else {
          // Cache a placeholder empty username before server returns
          this._userInfo[actorId] = { actorId, username: '' };
          return actorId;
        }
      })
      .filter(Boolean);

    this._getClient()
      .fetchUsersInfo(actorIds)
      .then((userInfo) => {
        Object.assign(this._userInfo, userInfo);
      });
  }

  updateAudioLevels(audioLevels: Record<ActorID, number>) {
    this._audioLevels = audioLevels;
  }

  update(
    tick: number,
    delta: number,
    actorObjects: Object3D[],
    camera: Camera
  ) {
    const actorInfo: Array<OverlayActor> = [];

    for (const child of actorObjects) {
      if (child.name) {
        v.copy(child.up).multiplyScalar(2.2);
        v.add(child.position);
        v.project(camera);
        const widthHalf = this._domElement.clientWidth / 2;
        const heightHalf = this._domElement.clientHeight / 2;
        let { x, y } = v;
        x = x * widthHalf + widthHalf;
        y = -(y * heightHalf) + heightHalf;
        if (
          x < 0 ||
          x > this._domElement.clientWidth ||
          y < 0 ||
          y > this._domElement.clientHeight
        ) {
          continue;
        }
        v.copy(child.position).sub(camera.position);
        const actorId = child.name;
        const distance = v.length();
        const color: number = child.userData.color as any; // TODO: make this type safe
        const audioLevel = this._audioLevels[actorId];
        actorInfo.push({ audioLevel, x, y, actorId, color, distance });
      }
    }

    actorInfo.sort((a, b) => b.distance - a.distance);
    this._updateUserInfo(actorInfo);

    for (const ui of actorInfo) {
      if (this._userInfo[ui.actorId]) {
        ui.username = this._userInfo[ui.actorId].username;
      }
    }

    const content = <Overlay delta={delta} actors={actorInfo} />;
    this._setOverlayContent(content);
  }
}

const useStyles = createUseStyles<Theme>((theme) => ({
  container: {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    outline: 'none',
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: theme.zIndices.middle,
  },
  actor: {
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'auto',
    position: 'absolute',
    transform: 'translate(-50%, -100px)',
    alignItems: 'center',
    height: '100px',
    justifyContent: 'flex-end',
  },
  nameplate: {
    marginTop: theme.spacing.normal,
    color: '#ffffff',
    fontWeight: 500,
    opacity: 0.8,
    borderRadius: theme.spacing.normal,
    paddingBottom: theme.spacing.narrow,
    paddingLeft: theme.spacing.normal,
    paddingRight: theme.spacing.normal,
    paddingTop: theme.spacing.narrow,
  },
}));

export default OverlayRenderer;
