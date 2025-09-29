import { Injectable } from '@nestjs/common';
import * as mediasoup from 'mediasoup';

@Injectable()
export class MediasoupService {
  private worker: mediasoup.types.Worker;
  private router: mediasoup.types.Router;
  private transports: Map<string, mediasoup.types.WebRtcTransport> = new Map();
  private producers: Map<string, mediasoup.types.Producer> = new Map();

  async init() {
    try {
      // Initialisation du Worker with memory optimization
      this.worker = await mediasoup.createWorker({
        rtcMinPort: 10000,
        rtcMaxPort: 10100,
        logLevel: 'warn', // Reduce logging to save memory
        logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
      });
      
      this.worker.on('died', () => {
        console.error('mediasoup worker died');
        // Don't exit the process, just log the error
        console.log('Attempting to restart mediasoup worker...');
        this.restartWorker();
      });
    } catch (error) {
      console.error('Failed to initialize mediasoup worker:', error);
      throw error;
    }

    const mediaCodecs: mediasoup.types.RtpCodecCapability[] = [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
        preferredPayloadType: 111,
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {},
        preferredPayloadType: 96,
      },
    ];

    // Création du Router
    this.router = await this.worker.createRouter({ mediaCodecs });
    console.log(
      '[mediasoup worker & router initialized]',
      'WebRTC Initialized',
    );
  }

  private async restartWorker() {
    try {
      if (this.worker) {
        await this.worker.close();
      }
      await this.init();
    } catch (error) {
      console.error('Failed to restart mediasoup worker:', error);
    }
  }

  // Méthode pour récupérer les RTP capabilities du Router
  async getRtpCapabilities() {
    if (!this.router) {
      throw new Error('Router not initialized');
    }
    return this.router.rtpCapabilities; // Devrait retourner les capacités RTP du router
  }

  async createSendTransport(clientId: string) {
    const transport = await this.router.createWebRtcTransport({
      listenIps: [{ ip: '127.0.0.1', announcedIp: undefined }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    // Log erreurs
    transport.on('dtlsstatechange', (state) => {
      if (state === 'closed') {
        console.log('Transport DTLS closed');
        transport.close();
      }
    });

    transport.on('@close', () => {
      console.log('Transport closed');
    });

    this.transports.set(clientId, transport);

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    };
  }

  async produce(
    clientId: string,
    transportType: 'send', // ou 'recv' si jamais
    kind: mediasoup.types.MediaKind,
    rtpParameters: mediasoup.types.RtpParameters,
    appData?: any,
  ) {
    const transport = this.getTransport(clientId, transportType);
    if (!transport) throw new Error('Transport not found');

    const producer = await transport.produce({ kind, rtpParameters, appData });

    this.producers.set(`${clientId}:${kind}`, producer);

    return {
      id: producer.id,
    };
  }

  getTransport(clientId: string, type: 'send' | 'recv') {
    return this.transports.get(`${clientId}:${type}`);
  }

  // Cleanup method to free memory
  async cleanup() {
    try {
      // Close all producers
      for (const [key, producer] of this.producers) {
        producer.close();
      }
      this.producers.clear();

      // Close all transports
      for (const [key, transport] of this.transports) {
        transport.close();
      }
      this.transports.clear();

      // Close router
      if (this.router) {
        this.router.close();
      }

      // Close worker
      if (this.worker) {
        await this.worker.close();
      }

      console.log('MediasoupService cleanup completed');
    } catch (error) {
      console.error('Error during MediasoupService cleanup:', error);
    }
  }

  addTransport(
    clientId: string,
    type: 'send' | 'recv',
    transport: mediasoup.types.WebRtcTransport,
  ) {
    this.transports.set(`${clientId}:${type}`, transport);
  }

  getRouter(): mediasoup.types.Router {
    return this.router;
  }
}
