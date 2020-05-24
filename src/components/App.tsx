import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import Chat from 'components/Chat';
import ClientProvider from 'components/ClientProvider';
import RenderView from 'components/RenderView';
import Spinner from 'components/Spinner';
import type { Theme } from 'themes';

const HOSTNAME = 'localhost';
const PORT = 8000;

const App = () => {
  const classes = useStyles({ theme: useTheme() });

  return (
    <div className={classes.app}>
      <ClientProvider
        username={Date.now().toString()}
        token="foobar"
        hostname={HOSTNAME}
        port={PORT}
        spinner={<Spinner />}
      >
        {({ client }) => (
          <>
            <div className={classes.panel}>
              WirePlace
              <Chat client={client} />
            </div>
            <div className={classes.main}>
              <div
                className={classes.eventArea}
                tabIndex={0}
                onKeyDown={client.handleKeyDown}
                onKeyUp={client.handleKeyUp}
              >
                <RenderView client={client} />
              </div>
            </div>
          </>
        )}
      </ClientProvider>
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
