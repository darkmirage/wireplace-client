import { WirePlaceScene } from 'wireplace-scene';
import socketClusterClient from 'socketcluster-client';
import type { AGClientSocket } from 'socketcluster-client';
import type { KeyboardEvent } from 'react';

import WirePlaceRuntime, { Directions } from './WirePlaceRuntime';
import WirePlaceThreeRenderer from './WirePlaceThreeRenderer';

class WirePlaceClient {
  socket: AGClientSocket;
  renderer: WirePlaceThreeRenderer;
  runtime: WirePlaceRuntime;
  scene: WirePlaceScene;

  constructor(hostname: string = 'localhost', port: number = 8000) {
    this.socket = socketClusterClient.create({
      hostname,
      port,
      autoConnect: false,
    });
    this.renderer = new WirePlaceThreeRenderer();
    this.scene = new WirePlaceScene();
    this.runtime = new WirePlaceRuntime(this.renderer, this.scene);
    (window as any).client = this;
  }

  disconnect() {
    console.log('[Client] Disconnect');
    this.socket.closeAllChannels();
  }

  async connect() {
    console.log('[Client] Connect');
    const actorId: string = await this.socket.invoke('join', {});
    this.runtime.setActor(actorId);
    const initialDiff = await this.socket.invoke('sync', {});
    this.scene.applyDiff(initialDiff);

    this.listen();
    this.scene.onActorUpdate(actorId, (update, actor) => {
      this.socket.transmit('move', { id: actorId, u: update });
    });
  }

  async listen() {
    const channel = this.socket.subscribe('update');
    for await (let data of channel) {
      this.scene.applyDiff(
        data,
        this.runtime.isMoving() ? this.runtime.actorId : null
      );
    }
  }

  handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp': {
        this.runtime.move(Directions.Up, true);
        break;
      }
      case 'ArrowDown': {
        this.runtime.move(Directions.Down, true);
        break;
      }
      case 'ArrowLeft': {
        this.runtime.move(Directions.Left, true);
        break;
      }
      case 'ArrowRight': {
        this.runtime.move(Directions.Right, true);
        break;
      }
    }
  };

  handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp': {
        this.runtime.move(Directions.Up, false);
        break;
      }
      case 'ArrowDown': {
        this.runtime.move(Directions.Down, false);
        break;
      }
      case 'ArrowLeft': {
        this.runtime.move(Directions.Left, false);
        break;
      }
      case 'ArrowRight': {
        this.runtime.move(Directions.Right, false);
        break;
      }
    }
  };
}

export default WirePlaceClient;
