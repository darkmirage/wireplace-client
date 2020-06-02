import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import AudioClient from 'wireplace/AudioClient';
import WirePlaceClient from 'wireplace/WirePlaceClient';
import SpatialAudioManager from 'wireplace/SpatialAudioManager';
import { Theme } from 'themes';
import { Tooltip, Button, ButtonGroup, Icon } from 'components/ui';

type Props = {
  actorId: string;
  sam: SpatialAudioManager;
  client: WirePlaceClient;
};

const VoiceChat = (props: Props) => {
  const classes = useStyles({ theme: useTheme() });
  const [client, setClient] = React.useState<AudioClient | null>(null);
  const [connected, setConnected] = React.useState<boolean>(false);
  const [muted, setMuted] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const { actorId, sam } = props;

  React.useEffect(() => {
    const newClient = new AudioClient(sam, props.client.joinAudio);
    setClient(newClient);
  }, [props.client, sam]);

  if (!client) {
    return <div className={classes.root} />;
  }

  const handleJoin = () => {
    setLoading(true);
    client.join(actorId, props.client.roomId).then(() => {
      setConnected(true);
      setLoading(false);
    });
  };

  const handleExit = () => {
    client.leave().then(() => {
      setMuted(false);
      setConnected(false);
    });
  };

  const handleMute = () => {
    let m = !muted;
    client.mute(m);
    setMuted(m);
  };

  const content = connected ? (
    <>
      <Tooltip content={muted ? 'Unmute' : 'Mute'} placement="bottom">
        <Button
          icon={
            muted ? (
              <Icon icon="microphone" />
            ) : (
              <Icon icon="microphone-slash" />
            )
          }
          color={muted ? 'green' : 'red'}
          onClick={handleMute}
          loading={loading}
        />
      </Tooltip>
      <Tooltip content="Exit Voice Chat" placement="bottom">
        <Button
          icon={<Icon icon="sign-out" />}
          onClick={handleExit}
          loading={loading}
        />
      </Tooltip>
    </>
  ) : (
    <Tooltip content="Join Voice Chat" placement="bottom">
      <Button
        circle
        icon={<Icon icon="microphone" />}
        onClick={handleJoin}
        loading={loading}
      />
    </Tooltip>
  );

  return <ButtonGroup className={classes.root}>{content}</ButtonGroup>;
};

const useStyles = createUseStyles<Theme>((theme) => ({
  root: {
    marginRight: theme.spacing.normal,
  },
}));

export default VoiceChat;
