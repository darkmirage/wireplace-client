import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import AudioClient from 'wireplace/AudioClient';
import WirePlaceClient from 'wireplace/WirePlaceClient';
import SpatialAudioManager from 'wireplace/SpatialAudioManager';
import Button from 'components/ui/Button';
import { Theme } from 'themes';
import PreventPropagation from 'components/ui/PreventPropagation';

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
  const { actorId, sam } = props;

  React.useEffect(() => {
    const newClient = new AudioClient(sam, props.client.joinAudio);
    setClient(newClient);
  }, [props.client, sam]);

  if (!client) {
    return <div className={classes.root} />;
  }

  const handleJoin = () => {
    client.join(actorId, props.client.roomId).then(() => setConnected(true));
  };

  const handleExit = () => {
    client.leave().then(() => setConnected(false));
  };

  const handleMute = () => {
    let m = !muted;
    client.mute(m);
    setMuted(m);
  };

  const content = connected ? (
    <>
      <Button
        className={classes.button}
        label={muted ? 'Unmute' : 'Mute'}
        onClick={handleMute}
      />
      <Button
        className={classes.button}
        label="Leave Audio"
        onClick={handleExit}
      />
    </>
  ) : (
    <Button
      className={classes.button}
      label="Join Audio"
      onClick={handleJoin}
    />
  );

  return (
    <PreventPropagation>
      <div className={classes.root}>{content}</div>
    </PreventPropagation>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  root: {
    pointerEvents: 'all',
    padding: theme.spacing.narrow,
  },
  button: {
    margin: theme.spacing.narrow,
  },
}));

export default VoiceChat;
