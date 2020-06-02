import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import { HOSTNAME, PORT } from 'constants/ServerConfigs';
import {
  ButtonToolbar,
  Spinner,
  GlobalInputs,
  PreventPropagation,
} from 'components/ui';
import { Theme } from 'themes';
import ClientProvider from 'components/ClientProvider';
import RenderView from 'components/RenderView';
import SpatialAudioManager from 'wireplace/SpatialAudioManager';
import TextChat from 'components/chat/TextChat';
import VoiceChat from 'components/chat/VoiceChat';
import AvatarMenu from 'components/AvatarMenu';

type Props = {
  username: string;
  roomId: string;
};

const Main = (props: Props) => {
  const classes = useStyles({ theme: useTheme() });
  const { username, roomId } = props;
  const [sam] = React.useState<SpatialAudioManager>(new SpatialAudioManager());

  return (
    <GlobalInputs>
      <div className={classes.root}>
        <ClientProvider
          username={username}
          token="foobar"
          roomId={roomId}
          hostname={HOSTNAME}
          port={PORT}
          spinner={<Spinner />}
        >
          {({ client, actorId }) => (
            <>
              <div className={classes.panel}>
                <ButtonToolbar className={classes.toolbar}>
                  <PreventPropagation>
                    <AvatarMenu />
                    <VoiceChat actorId={actorId} sam={sam} client={client} />
                  </PreventPropagation>
                </ButtonToolbar>
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
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
    width: 300,
    zIndex: theme.zIndices.middle,
  },
  '@media (max-width: 400px)': {
    panel: {
      width: '100%',
    },
  },
  toolbar: {
    padding: theme.spacing.normal,
    pointerEvents: 'auto',
  },
}));

export default Main;
