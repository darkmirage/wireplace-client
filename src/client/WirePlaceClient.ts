import { WirePlaceScene } from 'wireplace-scene';
import socketClusterClient from 'socketcluster-client';
import type { AGClientSocket } from 'socketcluster-client';
import type { KeyboardEvent } from 'react';

import WirePlaceRuntime from './WirePlaceRuntime';
import WirePlaceThreeRenderer from './WirePlaceThreeRenderer';

class WirePlaceClient {
  socket: AGClientSocket;
  renderer: WirePlaceThreeRenderer;
  runtime: WirePlaceRuntime;
  scene: WirePlaceScene;
  _actorId: string | null;

  constructor(hostname: string = 'localhost', port: number = 8000) {
    this.socket = socketClusterClient.create({ hostname, port, autoConnect: false });
    this.renderer = new WirePlaceThreeRenderer();
    this.scene = new WirePlaceScene();
    this.runtime = new WirePlaceRuntime(this.renderer, this.scene);
    this._actorId = null;
    (window as any).client = this;
  }

  disconnect() {
    console.log('[Client] Disconnect');
    this.socket.closeAllChannels();
  }

  async connect() {
    console.log('[Client] Connect');
    this._actorId = await this.socket.invoke('join', {});
    const initialDiff = await this.socket.invoke('sync', {});
    console.log('Initial sync', initialDiff);
    this.scene.applyDiff(initialDiff);
    this.listen();
  }

  async listen() {
    const channel = this.socket.subscribe('update');
    for await (let data of channel) {
      this.scene.applyDiff(data);
      console.log('update', data);
    }
  }

  handleKeyDown = (event: KeyboardEvent) => {
    console.log(event.key);
  };

  handleKeyUp = (event: KeyboardEvent) => {
    console.log(event.key);
  };
}

export default WirePlaceClient;
