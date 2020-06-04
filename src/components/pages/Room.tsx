import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import {
  Centered,
  GlobalInputs,
  PreventPropagation,
  Spinner,
} from 'components/ui';
import { PageProps } from 'components/auth/PageProps';
import { HOSTNAME, PORT } from 'constants/ServerConfigs';
import { Theme } from 'themes';
import AvatarMenu from 'components/AvatarMenu';
import ClientProvider from 'components/ClientProvider';
import EmoteMenu from 'components/EmoteMenu';
import RenderView from 'components/RenderView';
import SpatialAudioManager from 'wireplace/SpatialAudioManager';
import TextChat from 'components/chat/TextChat';
import TopToolbar from 'components/TopToolbar';
import VoiceChat from 'components/chat/VoiceChat';

const Room = (props: PageProps) => {
  const classes = useStyles({ theme: useTheme() });

  const roomId = props.match.params['roomId'];

  const [sam] = React.useState<SpatialAudioManager>(new SpatialAudioManager());

  return (
    <GlobalInputs>
      <Centered className={classes.root}>
        <ClientProvider
          roomId={roomId}
          hostname={HOSTNAME}
          port={PORT}
          spinner={<Spinner />}
        >
          {({ client, actorId, username }) => (
            <>
              <div className={classes.panel}>
                <TopToolbar>
                  {(menuProps) => (
                    <PreventPropagation>
                      <AvatarMenu {...menuProps} />
                      <EmoteMenu {...menuProps} />
                      <VoiceChat actorId={actorId} sam={sam} client={client} />
                    </PreventPropagation>
                  )}
                </TopToolbar>
                <TextChat client={client} username={username} />
              </div>
              <div className={classes.main}>
                <RenderView
                  scene={client.scene}
                  client={client}
                  sam={sam}
                  actorId={actorId}
                />
              </div>
            </>
          )}
        </ClientProvider>
      </Centered>
    </GlobalInputs>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  root: {
    background: theme.color.backgroundDark,
    color: theme.color.textLight,
    outline: 'none',
  },
  main: {
    background: theme.color.backgroundDark,
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
}));

export default Room;
