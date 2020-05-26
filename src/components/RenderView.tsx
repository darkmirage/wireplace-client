import React from 'react';
import { createUseStyles } from 'react-jss';

import type WirePlaceClient from 'wireplace/WirePlaceClient';
import WirePlaceThreeRenderer from 'wireplace/WirePlaceThreeRenderer';
import WirePlaceReactRenderer from 'wireplace/WirePlaceReactRenderer';

type Props = {
  client: WirePlaceClient;
};

const RenderView = (props: Props) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const classes = useStyles();
  const [overlayContent, setOverlayContent] = React.useState<React.ReactNode>(
    null
  );
  const { client } = props;

  React.useEffect(() => {
    const { current } = ref;
    if (!current) {
      throw new Error('ref.current is undefined');
    }

    const reacter = new WirePlaceReactRenderer(setOverlayContent, current);
    const renderer = new WirePlaceThreeRenderer(reacter);
    renderer.setDOMElement(current);
    window.addEventListener('resize', renderer.resize);
    client.runtime.startLoop();
    client.runtime.setRenderer(renderer);
    return () => {
      client.runtime.stopLoop();
      window.removeEventListener('resize', renderer.resize);
    };
  }, [client]);

  return (
    <>
      <div ref={ref} className={classes.canvas} />
      {overlayContent}
    </>
  );
};

const useStyles = createUseStyles({
  canvas: {
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  },
});

export default RenderView;
