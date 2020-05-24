import React from 'react';
import WirePlaceClient from 'client/WirePlaceClient';

type ChildProps = {
  client: WirePlaceClient;
};

type Props = {
  children: (props: ChildProps) => React.ReactNode;
  hostname: string;
  port: number;
  spinner: React.ReactNode | null;
};

const ClientProvider = (props: Props) => {
  const { hostname, port } = props;

  let [client, setClient] = React.useState<WirePlaceClient | null>(null);

  React.useEffect(() => {
    const newClient = new WirePlaceClient(hostname, port);
    newClient.connect();
    setClient(newClient);

    return () => newClient.disconnect();
  }, [hostname, port]);

  return <>{client ? props.children({ client }) : props.spinner}</>;
};

ClientProvider.defaultProps = {
  port: 8000,
  spinner: null,
} as Partial<Props>;

export default ClientProvider;
