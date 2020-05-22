import React from 'react';
import WirePlaceClient from 'client/WirePlaceClient';

type ChildProps = {
  client: WirePlaceClient | null;
};

type Props = {
  children: (props: ChildProps) => React.ReactNode;
  hostname: string;
  port: number;
};

const ClientProvider = (props: Props) => {
  const { hostname, port } = props;

  let [client, setClient] = React.useState<WirePlaceClient | null>(null);

  React.useEffect(() => {
    const client = new WirePlaceClient(hostname, port);
    setClient(client);
  }, [hostname, port]);

  return <>{props.children({ client })}</>;
};

ClientProvider.defaultProps = {
  port: 8000,
} as Partial<Props>;

export default ClientProvider;
