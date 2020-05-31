import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import AudioClient from 'wireplace/AudioClient';
import WirePlaceClient from 'wireplace/WirePlaceClient';
import SpatialAudioManager from 'wireplace/SpatialAudioManager';
import Button from 'components/ui/Button';
import { Theme } from 'themes';

type Props = {
  actorId: string;
  sam: SpatialAudioManager;
  client: WirePlaceClient;
};

const preventPropagation = (event: React.MouseEvent<any>) => {
  event.stopPropagation();
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
    client.join(actorId).then(() => setConnected(true));
  };

  const handleExit = () => {
    client.leave().then(() => setConnected(false));
  };

  const handleMute = () => {
    let m = !muted;
    client.mute(m);
    setMuted(m);
  };

  if (!connected) {
    return (
      <div className={classes.root} onMouseDown={preventPropagation}>
        <Button
          className={classes.button}
          label="Join Audio"
          onClick={handleJoin}
        />
      </div>
    );
  } else {
    return (
      <div className={classes.root} onMouseDown={preventPropagation}>
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
      </div>
    );
  }
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
