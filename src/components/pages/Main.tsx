import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import TextChat from 'components/chat/TextChat';
import ClientProvider from 'components/ClientProvider';
import EventArea from 'components/ui/EventArea';
import GlobalInputs from 'components/ui/GlobalInputs';
import RenderView from 'components/RenderView';
import Spinner from 'components/Spinner';
import type { Theme } from 'themes';

const HOSTNAME = 'server.wireplace.net';
const PORT = 8000;

type Props = {
  username: string;
};

const Main = (props: Props) => {
  const classes = useStyles({ theme: useTheme() });
  const { username } = props;

  return (
    <GlobalInputs>
      <ClientProvider
        username={username}
        token="foobar"
        hostname={HOSTNAME}
        port={PORT}
        spinner={<Spinner />}
      >
        {({ client }) => (
          <>
            <div className={classes.panel}>
              <TextChat client={client} username={username} />
            </div>
            <div className={classes.main}>
              <EventArea
                maintainFocus
                className={classes.eventArea}
                onKeyDown={client.handleKeyDown}
                onKeyPress={client.handleKeyPress}
                onKeyUp={client.handleKeyUp}
                tabIndex={1}
              >
                <RenderView client={client} />
              </EventArea>
            </div>
          </>
        )}
      </ClientProvider>
    </GlobalInputs>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
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
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: theme.zIndices.bottom,
  },
  panel: {
    bottom: 0,
    left: 0,
    height: '100%',
    maxWidth: '100%',
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: theme.zIndices.middle,
  },
}));

export default Main;
