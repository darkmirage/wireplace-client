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
  _agora: IAgoraRTCClient;
  _local: ILocalAudioTrack | null;

  constructor(sam: SpatialAudioManager) {
    this.sam = sam;
    this._agora = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    this._local = null;

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

  async join(actorId: ActorID, channel: string = 'wireplace') {
    this._local = await AgoraRTC.createMicrophoneAudioTrack();
    await this._agora.join(AGORA_APP_ID, 'wireplace', null, actorId);
    this._agora.publish([this._local]);
  }

  async leave() {
    if (this._local) {
      this._local.close();
    }
    this._agora.leave();
  }
}

export default AudioClient;
