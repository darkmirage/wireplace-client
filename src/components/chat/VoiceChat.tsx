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
  const [audio, setAudio] = React.useState<AudioClient | null>(null);
  const [connected, setConnected] = React.useState<boolean>(false);
  const [muted, setMuted] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const { actorId, sam } = props;

  React.useEffect(() => {
    const newAudio = new AudioClient(sam, props.client.joinAudio);
    newAudio.onConnection((connected) => {
      setConnected(connected);
      setLoading(false);
      if (!connected) {
        setMuted(false);
      }
    });
    setAudio(newAudio);
  }, [props.client, sam]);

  if (!audio) {
    return <div className={classes.root} />;
  }

  const handleJoin = () => {
    setLoading(true);
    audio.join(actorId, props.client.roomId);
  };

  const handleExit = () => {
    audio.leave();
  };

  const handleMute = () => {
    let m = !muted;
    audio.mute(m);
    setMuted(m);
  };

  const content = connected ? (
    <>
      <Tooltip
        content={muted ? 'Unmute myself' : 'Mute myself'}
        placement="bottom"
      >
        <Button
          icon={
            muted ? (
              <Icon icon="microphone" />
            ) : (
              <Icon icon="microphone-slash" />
            )
          }
          color={muted ? undefined : 'red'}
          onClick={handleMute}
          size="lg"
          loading={loading}
        />
      </Tooltip>
      <Tooltip content="Exit voice chat" placement="bottom">
        <Button
          icon={<Icon icon="exit" />}
          onClick={handleExit}
          loading={loading}
          size="lg"
        />
      </Tooltip>
    </>
  ) : (
    <Tooltip content="Talk to people" placement="bottom">
      <Button
        circle
        icon={<Icon icon="microphone" />}
        onClick={handleJoin}
        loading={loading}
        size="lg"
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
