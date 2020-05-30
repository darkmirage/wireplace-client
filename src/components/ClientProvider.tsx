import React from 'react';
import { WirePlaceScene } from 'wireplace-scene';

import WirePlaceClient from 'wireplace/WirePlaceClient';
import GameplayRuntime from 'wireplace/GameplayRuntime';
import { getGlobalEmitter } from 'wireplace/TypedEventsEmitter';

type ChildProps = {
  client: WirePlaceClient;
};

type Props = {
  children: (props: ChildProps) => React.ReactNode;
  hostname: string;
  port: number;
  username: string;
  token: string;
  spinner: React.ReactNode | null;
};

const ClientProvider = (props: Props) => {
  const { hostname, port, username, token } = props;

  let [client, setClient] = React.useState<WirePlaceClient | null>(null);

  React.useEffect(() => {
    const scene = new WirePlaceScene();
    const emitter = getGlobalEmitter();
    const runtime = new GameplayRuntime({ scene, emitter });
    const newClient = new WirePlaceClient({
      emitter,
      scene,
      runtime,
      username,
      token,
      hostname,
      port,
    });
    newClient.connect();
    setClient(newClient);

    return () => newClient.disconnect();
  }, [hostname, port, username, token]);

  return <>{client ? props.children({ client }) : props.spinner}</>;
};

ClientProvider.defaultProps = {
  port: 8000,
  spinner: null,
} as Partial<Props>;

export default ClientProvider;
