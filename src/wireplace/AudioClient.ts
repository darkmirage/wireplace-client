import AgoraRTC, { IAgoraRTCClient, ILocalAudioTrack } from 'agora-rtc-sdk-ng';
import { ActorID } from 'wireplace-scene';

import SpatialAudioManager from 'wireplace/SpatialAudioManager';

const AGORA_APP_ID = '2fe980bdfc9f40f9bde6d0348f8f2f9d';

interface IAudioTrack {
  _source: {
    analyserNode: AnalyserNode;
    context: AudioContext;
    outputNode: GainNode;
    playNode: AudioDestinationNode;
  };
}

class AudioClient {
  sam: SpatialAudioManager;
  connected: boolean;
  _agora: IAgoraRTCClient;
  _local: ILocalAudioTrack | null;
  _fetchToken: () => Promise<string>;

  constructor(sam: SpatialAudioManager, fetchToken: () => Promise<string>) {
    this.sam = sam;
    this.connected = false;
    this._agora = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    this._local = null;
    this._fetchToken = fetchToken;

    this._agora.on('user-published', async (user, mediaType) => {
      await this._agora.subscribe(user);
      const actorId = user.uid as ActorID;

      const remoteAudioTrack = user.audioTrack;
      if (remoteAudioTrack) {
        const source = ((remoteAudioTrack as any) as IAudioTrack)._source;
        const { output } = sam.addActor(actorId, source.outputNode);
        source.outputNode = output;
      }
    });

    this._agora.on('user-unpublished', async (user) => {
      const actorId = user.uid as ActorID;
      this.sam.removeActor(actorId);
    });
  }

  async join(actorId: ActorID, roomId: string) {
    const token = await this._fetchToken();
    this._local = await AgoraRTC.createMicrophoneAudioTrack();
    await this._agora.join(AGORA_APP_ID, roomId, token, actorId);
    this._agora.publish([this._local]);
    this.connected = true;
  }

  async leave() {
    if (!this.connected) {
      return;
    }
    if (this._local) {
      this._local.close();
    }
    await this._agora.leave();
    this.connected = false;
  }

  mute = (muted: boolean = true) => {
    this._local?.setMute(muted);
  };
}

export default AudioClient;
