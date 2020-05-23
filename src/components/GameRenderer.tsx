import React from 'react';
import { createUseStyles } from 'react-jss';

import type WirePlaceClient from 'client/WirePlaceClient';

type Props = {
  client: WirePlaceClient;
}

const GameRenderer = (props: Props) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const classes = useStyles();
  const { client } = props;

  React.useEffect(() => {
    const { current } = ref;
    if (!current) {
      throw new Error('ref.current is undefined');
    }

    client.renderer.setDOMElement(current);
    window.addEventListener('resize', client.renderer.resize);
    client.engine.startLoop();
  
    return () => {
      client.engine.stopLoop();
      window.removeEventListener('resize', client.renderer.resize);
    };
  }, [client]);

  return (<div ref={ref} className={classes.canvas} />);
}

const useStyles = createUseStyles({
  canvas: {
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  }
});

export default GameRenderer;