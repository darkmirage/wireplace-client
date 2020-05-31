import React from 'react';

import AudioClient from 'wireplace/AudioClient';
import SpatialAudioManager from 'wireplace/SpatialAudioManager';

type Props = {
  children?: React.ReactNode;
  actorId: string;
  sam: SpatialAudioManager;
};

const VoiceChatProvider = (props: Props) => {
  const [, setClient] = React.useState<AudioClient | null>(null);
  const { actorId, sam } = props;

  React.useEffect(() => {
    const newClient = new AudioClient(sam);
    newClient.join(actorId).then(() => {
      setClient(newClient);
    });
  }, [sam, actorId]);

  return <>{props.children}</>;
};

export { VoiceChatProvider };
