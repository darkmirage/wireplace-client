import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import { Scene, Camera, Vector3 } from 'three';

import WirePlaceClient from 'wireplace/WirePlaceClient';
import type { Theme } from 'themes';

type OverlayActor = {
  actorId: string;
  x: number;
  y: number;
  color: number;
  username?: string;
};

type OverlayProps = {
  delta: number;
  actors: Array<OverlayActor>;
};

const v = new Vector3();

const Overlay = (props: OverlayProps) => {
  const classes = useStyles({ theme: useTheme() });

  const overlays = props.actors.map(
    ({ username, actorId, x, y, color = 0 }) => {
      if (!username) {
        return null;
      }

      const r = (color >> 16) & 255;
      const g = (color >> 8) & 255;
      const b = color & 255;

      return (
        <div
          className={classes.actor}
          key={actorId}
          style={{ top: y, left: x, background: `rgba(${r}, ${g}, ${b}, 1.0)` }}
        >
          {username}
        </div>
      );
    }
  );
  return <div className={classes.container}>{overlays}</div>;
};

class WirePlaceReactRenderer {
  _setOverlayContent: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  _domElement: HTMLDivElement;
  _getClient: () => WirePlaceClient;
  _lastTick: number;

  constructor(
    setOverlayContent: React.Dispatch<React.SetStateAction<React.ReactNode>>,
    domElement: HTMLDivElement,
    getClient: () => WirePlaceClient
  ) {
    this._setOverlayContent = setOverlayContent;
    this._domElement = domElement;
    this._getClient = getClient;
    this._lastTick = -Infinity;
  }

  async update(tick: number, delta: number, scene: Scene, camera: Camera) {
    const userInfo: Array<OverlayActor> = [];

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
        const color: number = child.userData.color as any; // TODO: make this type safe
        userInfo.push({ x, y, actorId: child.name, color });
      }
    }

    this._lastTick = Math.max(this._lastTick, tick);
    const users = await this._getClient().fetchUsersInfo(
      userInfo.map(({ actorId }) => actorId)
    );
    if (this._lastTick !== tick) {
      return;
    }

    for (const ui of userInfo) {
      if (users[ui.actorId]) {
        ui.username = users[ui.actorId].username;
      }
    }

    const content = <Overlay delta={delta} actors={userInfo} />;
    this._setOverlayContent(content);
  }
}

const useStyles = createUseStyles<Theme>((theme) => ({
  container: {
    position: 'absolute',
    zIndex: theme.zIndices.middle,
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    outline: 'none',
    width: '100%',
    pointerEvents: 'none',
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
    position: 'absolute',
    transform: 'translateX(-50%)',
  },
}));

export default WirePlaceReactRenderer;
