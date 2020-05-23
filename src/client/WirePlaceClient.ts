import socketClusterClient from 'socketcluster-client';
import type { AGClientSocket } from 'socketcluster-client';

import WirePlaceEngine from './WirePlaceEngine';
import WirePlaceRenderer from './WirePlaceRenderer';
import { SyntheticEvent, KeyboardEvent } from 'react';

class WirePlaceClient {
  socket: AGClientSocket;
  renderer: WirePlaceRenderer;
  engine: WirePlaceEngine;

  constructor(hostname: string = 'localhost', port: number = 8000) {
    this.socket = socketClusterClient.create({ hostname, port });
    console.log('transmit', hostname, port);
    this.socket.transmit('move', 123);
    this.renderer = new WirePlaceRenderer();
    this.engine = new WirePlaceEngine(this.renderer);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    console.log(event.key);
  };

  handleKeyUp = (event: KeyboardEvent) => {
    console.log(event.key);
  };
}

export default WirePlaceClient;
