import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import ClientProvider from 'components/ClientProvider';
import GameRenderer from 'components/GameRenderer';
import Spinner from 'components/Spinner';
import type { Theme } from 'themes';

const HOSTNAME = 'raven-ubuntu';
const PORT = 8000;

const App = () => {
  const classes = useStyles({ theme: useTheme() });

  return (
    <div className={classes.app}>
      <div className={classes.panel}>WirePlace</div>
      <div className={classes.main}>
        <ClientProvider hostname={HOSTNAME} port={PORT} spinner={<Spinner />}>
          {({ client }) => (
            <div
              className={classes.eventArea}
              tabIndex={0}
              onKeyDown={client.handleKeyDown}
              onKeyUp={client.handleKeyUp}
            >
              <GameRenderer client={client} />
            </div>
          )}
        </ClientProvider>
      </div>
    </div>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  app: {
    fontFamily: theme.fontFamily,
  },
  eventArea: {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    outline: 'none',
    width: '100%',
  },
  main: {
    background: theme.color.background,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: theme.zIndices.bottom,
  },
  panel: {
    background: theme.color.panel,
    left: 0,
    padding: theme.spacing.normal,
    position: 'absolute',
    top: 0,
    zIndex: theme.zIndices.middle,
  },
}));

export default App;
