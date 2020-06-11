import React from 'react';
import { createUseStyles } from 'react-jss';
import { IScene, ActorID, WirePlaceSceneSerialized } from 'wireplace-scene';

import { getGlobalEmitter } from 'wireplace/TypedEventsEmitter';
import GameplayRuntime from 'wireplace/GameplayRuntime';
import WirePlaceClient from 'wireplace/WirePlaceClient';
import OverlayRenderer from 'wireplace/OverlayRenderer';
import ThreeRenderer from 'wireplace/ThreeRenderer';
import SpatialAudioManager from 'wireplace/SpatialAudioManager';

type Props = {
  client: WirePlaceClient;
  sam: SpatialAudioManager;
  scene: IScene<WirePlaceSceneSerialized>;
  actorId: ActorID;
};

const RenderView = (props: Props) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const classes = useStyles();

  const { client, sam, scene, actorId } = props;
  const emitter = getGlobalEmitter();

  React.useEffect(() => {
    const { current } = ref;
    if (!current) {
      throw new Error('ref.current is undefined');
    }

    const runtime = new GameplayRuntime({ scene, emitter, actorId });
    const overlay = new OverlayRenderer(() => client);
    const renderer = new ThreeRenderer({ overlay, sam });
    renderer.setDOMElement(current);
    window.addEventListener('resize', renderer.resize);
    runtime.startLoop();
    runtime.setRenderer(renderer);
    return () => {
      runtime.stopLoop();
      window.removeEventListener('resize', renderer.resize);
    };
  }, [client, sam, scene, emitter, actorId]);

  return <div ref={ref} className={classes.canvas} />;
};

const useStyles = createUseStyles({
  canvas: {
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  },
});

export default RenderView;
