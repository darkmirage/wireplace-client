import React from 'react';
import { WirePlaceScene, ActorID } from 'wireplace-scene';
import { useHistory, useLocation } from 'react-router-dom';

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
  const history = useHistory();
  const location = useLocation();

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
    newClient.connect().then((result) => {
      switch (result) {
        case 'FAILURE': {
          Notification.error({
            title: 'Failed to connect',
            description:
              'An error occured while trying to connect to the room.',
            duration: 100000,
          });
          break;
        }
        case 'ON_WAITLIST': {
          history.push('/waitlist');
          break;
        }
        case 'NEW_USER': {
          history.push('/profile', { from: location.pathname });
          break;
        }
        case 'SUCCESS': {
          setClient(newClient);
          break;
        }
      }
    });

    return () => newClient.disconnect();
  }, [hostname, port, emitter, roomId, history, location]);

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
