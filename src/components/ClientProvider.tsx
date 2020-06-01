import React from 'react';
import { WirePlaceScene, ActorID } from 'wireplace-scene';

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
  username: string;
  token: string;
  roomId: string;
  spinner: React.ReactNode | null;
};

const ClientProvider = (props: Props) => {
  const { hostname, port, username, token, roomId } = props;

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
      token,
      username,
    });
    newClient.connect();
    setClient(newClient);

    return () => newClient.disconnect();
  }, [hostname, port, username, token, emitter, roomId]);

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
