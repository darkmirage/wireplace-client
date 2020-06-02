import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import { Scene, Camera, Vector3 } from 'three';

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
    ({ distance, username, actorId, x, y, color = 0 }, i) => {
      if (!username) {
        return null;
      }

      return (
        <PreventPropagation
          className={classes.actor}
          key={actorId}
          style={{
            zIndex: distance + 3,
            top: y,
            left: x,
            background: hexToRGB(color),
          }}
        >
          {username}
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
  _lastTick: number;
  _lastFetched: number;
  _userInfo: Record<ActorID, UserInfo>;

  constructor(
    setOverlayContent: React.Dispatch<React.SetStateAction<React.ReactNode>>,
    domElement: HTMLDivElement,
    getClient: () => WirePlaceClient
  ) {
    this._setOverlayContent = setOverlayContent;
    this._domElement = domElement;
    this._getClient = getClient;
    this._lastTick = -Infinity;
    this._userInfo = {};
    this._lastFetched = -Infinity;
  }

  _updateUserInfo(actors: Array<OverlayActor>) {
    const tick = this._lastTick;
    const now = Date.now();
    if (now - this._lastFetched < 1000) {
      return;
    }
    this._getClient()
      .fetchUsersInfo(actors.map(({ actorId }) => actorId))
      .then((userInfo) => {
        if (this._lastTick !== tick) {
          return;
        }
        this._lastFetched = Date.now();
        Object.assign(this._userInfo, userInfo);
      });
  }

  update(tick: number, delta: number, scene: Scene, camera: Camera) {
    const actorInfo: Array<OverlayActor> = [];

    for (const child of scene.children) {
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
        const distance = v.length();
        const color: number = child.userData.color as any; // TODO: make this type safe
        actorInfo.push({ x, y, actorId: child.name, color, distance });
      }
    }

    actorInfo.sort((a, b) => b.distance - a.distance);

    // TODO: Remove this extreme hack for rate-limiting
    this._lastTick = Math.max(this._lastTick, tick);
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
    borderRadius: theme.spacing.normal,
    color: '#ffffff',
    display: 'flex',
    fontWeight: 500,
    opacity: 0.8,
    paddingBottom: theme.spacing.narrow,
    paddingLeft: theme.spacing.normal,
    paddingRight: theme.spacing.normal,
    paddingTop: theme.spacing.narrow,
    pointerEvents: 'auto',
    position: 'absolute',
    transform: 'translateX(-50%)',
  },
}));

export default OverlayRenderer;
