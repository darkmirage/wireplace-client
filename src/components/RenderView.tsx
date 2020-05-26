import React from 'react';
import { createUseStyles } from 'react-jss';

import type WirePlaceClient from 'wireplace/WirePlaceClient';
import WirePlaceThreeRenderer from 'wireplace/WirePlaceThreeRenderer';

type Props = {
  client: WirePlaceClient;
};

const RenderView = (props: Props) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const classes = useStyles();
  const { client } = props;

  React.useEffect(() => {
    const { current } = ref;
    if (!current) {
      throw new Error('ref.current is undefined');
    }

    const renderer = new WirePlaceThreeRenderer();
    renderer.setDOMElement(current);
    window.addEventListener('resize', renderer.resize);
    client.runtime.startLoop();
    client.runtime.setRenderer(renderer);

    return () => {
      client.runtime.stopLoop();
      window.removeEventListener('resize', renderer.resize);
    };
  }, [client]);

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
