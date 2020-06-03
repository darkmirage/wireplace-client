import React from 'react';
import { WirePlaceScene, ActorID } from 'wireplace-scene';

import { Notification } from 'components/ui';
import { getGlobalEmitter, Events } from 'wireplace/TypedEventsEmitter';
import GameplayRuntime from 'wireplace/GameplayRuntime';
import WirePlaceClient from 'wireplace/WirePlaceClient';

type ChildProps = {
  client: WirePlaceClient;
  actorId: ActorID;
};

type Props = {
  children: (props: ChildProps) => React.ReactNode;
  hostname: string;
  port: number;
  roomId: string;
  spinner: React.ReactNode | null;
};

const ClientProvider = (props: Props) => {
  const { hostname, port, roomId } = props;

  let [client, setClient] = React.useState<WirePlaceClient | null>(null);
  let [actorId, setActorId] = React.useState<ActorID | null>(null);
  const emitter = getGlobalEmitter();

  React.useEffect(() => {
    emitter.on(Events.SET_ACTIVE_ACTOR, setActorId);
  }, [emitter]);

  React.useEffect(() => {
    const scene = new WirePlaceScene();
    const runtime = new GameplayRuntime({ scene, emitter });
    const newClient = new WirePlaceClient({
      emitter,
      hostname,
      port,
      roomId,
      runtime,
      scene,
    });
    newClient.connect().then((success) => {
      console.log('success', success);
      if (!success) {
        Notification.error({
          title: 'Failed to connect',
          description: 'Your account has not been set up for Wireplace yet.',
          duration: 100000,
        });
        return;
      }
      setClient(newClient);
    });

    return () => newClient.disconnect();
  }, [hostname, port, emitter, roomId]);

  return (
    <>
      {client && actorId ? props.children({ client, actorId }) : props.spinner}
    </>
  );
};

ClientProvider.defaultProps = {
  port: 8000,
  spinner: null,
} as Partial<Props>;

export default ClientProvider;
