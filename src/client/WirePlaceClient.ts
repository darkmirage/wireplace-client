import { WirePlaceScene } from 'wireplace-scene';
import socketClusterClient from 'socketcluster-client';
import type { AGClientSocket } from 'socketcluster-client';
import type { KeyboardEvent } from 'react';

import WirePlaceRuntime from './WirePlaceRuntime';
import WirePlaceRenderer from './WirePlaceRenderer';

class WirePlaceClient {
  socket: AGClientSocket;
  renderer: WirePlaceRenderer;
  runtime: WirePlaceRuntime;
  scene: WirePlaceScene;

  constructor(hostname: string = 'localhost', port: number = 8000) {
    this.socket = socketClusterClient.create({ hostname, port, autoConnect: false });
    this.renderer = new WirePlaceRenderer();
    this.scene = new WirePlaceScene();
    this.runtime = new WirePlaceRuntime(this.renderer, this.scene);
  }

  async connect() {
    const actorId = await this.socket.invoke('join', {});
    console.log(actorId);
    this.scene.addActor(actorId);
    console.log(this.scene.retrieveDiff());
  }

  handleKeyDown = (event: KeyboardEvent) => {
    console.log(event.key);
  };

  handleKeyUp = (event: KeyboardEvent) => {
    console.log(event.key);
  };
}

export default WirePlaceClient;
