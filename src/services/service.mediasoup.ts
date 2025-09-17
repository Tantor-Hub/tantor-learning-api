import { Injectable } from '@nestjs/common';
import * as mediasoup from 'mediasoup';

@Injectable()
export class MediasoupService {
  private worker: mediasoup.types.Worker;
  private router: mediasoup.types.Router;
  private transports: Map<string, mediasoup.types.WebRtcTransport> = new Map();
  private producers: Map<string, mediasoup.types.Producer> = new Map();

  async init() {
    // Initialisation du Worker
    this.worker = await mediasoup.createWorker();
    this.worker.on('died', () => {
      console.error('mediasoup worker died');
      process.exit(1);
    });

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
