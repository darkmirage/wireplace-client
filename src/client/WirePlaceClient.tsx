import socketClusterClient from 'socketcluster-client';
import type { AGClientSocket } from 'socketcluster-client';

class WirePlaceClient {
  socket: AGClientSocket;

  constructor(hostname: string = 'localhost', port: number = 8000) {
    this.socket = socketClusterClient.create({ hostname, port });
    console.log('transmit', hostname, port);
    this.socket.transmit('move', 123);
  }

  handleKeyDown = (event: any) => {
    console.log(event);
  };

  handleKeyUp = (event: any) => {
    console.log(event);
  };
}

export default WirePlaceClient;
