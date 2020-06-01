import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import AudioClient from 'wireplace/AudioClient';
import WirePlaceClient from 'wireplace/WirePlaceClient';
import SpatialAudioManager from 'wireplace/SpatialAudioManager';
import Button from 'components/ui/Button';
import { Theme } from 'themes';
import PreventPropagation from 'components/ui/PreventPropagation';
import Tooltip from 'components/ui/Tooltip';

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
      <Tooltip content={muted ? 'Unmute' : 'Mute'} placement="bottomStart">
        <Button
          className={classes.button}
          label={
            !muted ? (
              <i className="fas fa-microphone-alt-slash"></i>
            ) : (
              <i className="fas fa-microphone-alt"></i>
            )
          }
          onClick={handleMute}
        />
      </Tooltip>
      <Tooltip content="Exit Voice Chat" placement="bottom">
        <Button
          className={classes.button}
          label={<i className="fas fa-sign-out-alt"></i>}
          onClick={handleExit}
        />
      </Tooltip>
    </>
  ) : (
    <div>
      <Tooltip content="Join Voice Chat" placement="bottomStart">
        <Button
          className={classes.button}
          label={<i className="fas fa-microphone-alt"></i>}
          onClick={handleJoin}
        />
      </Tooltip>
    </div>
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
  tooltip: {
    position: 'absolute',
  },
}));

export default VoiceChat;
