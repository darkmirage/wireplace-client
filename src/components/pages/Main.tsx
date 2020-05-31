import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import TextChat from 'components/chat/TextChat';
import ClientProvider from 'components/ClientProvider';
import GlobalInputs from 'components/ui/GlobalInputs';
import RenderView from 'components/RenderView';
import Spinner from 'components/ui/Spinner';
import { VoiceChatProvider } from 'components/chat/VoiceChatProvider';
import type { Theme } from 'themes';
import SpatialAudioManager from 'wireplace/SpatialAudioManager';

const HOSTNAME = 'server.wireplace.net';
const PORT = 8080;

type Props = {
  username: string;
};

const Main = (props: Props) => {
  const classes = useStyles({ theme: useTheme() });
  const { username } = props;
  const [sam] = React.useState<SpatialAudioManager>(new SpatialAudioManager());

  return (
    <GlobalInputs>
      <div className={classes.root}>
        <ClientProvider
          username={username}
          token="foobar"
          hostname={HOSTNAME}
          port={PORT}
          spinner={<Spinner />}
        >
          {({ client, actorId }) => (
            <>
              <div className={classes.panel}>
                <VoiceChatProvider actorId={actorId} sam={sam} />
                <TextChat client={client} username={username} />
              </div>
              <div className={classes.main}>
                <RenderView client={client} sam={sam} />
              </div>
            </>
          )}
        </ClientProvider>
      </div>
    </GlobalInputs>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  root: {
    alignItems: 'center',
    background: theme.color.background,
    color: '#ddd',
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
