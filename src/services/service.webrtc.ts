import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MediasoupService } from './service.mediasoup';

@WebSocketGateway({ cors: true })
export class WebrtcGatewayService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('WebrtcGateway');
  constructor(private readonly mediasoupService: MediasoupService) {}

  // afterInit(server: Server) {
  //     this.logger.log('WebSocket Gateway Initialized');
  // }

  async afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');

    // Initialisation de mediasoup
    await this.mediasoupService.init();
    this.logger.log('Mediasoup initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.room);
    client.to(data.room).emit('user-joined', client.id);
    this.logger.log(`Client ${client.id} joined room ${data.room}`);
  }

  @SubscribeMessage('signal')
  handleSignal(
    @MessageBody() data: { room: string; signal: any; sender: string },
    @ConnectedSocket() client: Socket,
  ) {
    client
      .to(data.room)
      .emit('signal', { signal: data.signal, sender: data.sender });
  }

  @SubscribeMessage('get-rtp-capabilities')
  handleGetRtpCapabilities(@ConnectedSocket() client: Socket) {
    const router = this.mediasoupService.getRouter();

    if (!router) {
      this.logger.error('Router not initialized');
      return;
    }

    client.emit('rtp-capabilities', router.rtpCapabilities);
    this.logger.log(`Sent RTP Capabilities to client ${client.id}`);
  }

  @SubscribeMessage('create-send-transport')
  async handleCreateSendTransport(@ConnectedSocket() client: Socket) {
    const transportInfo = await this.mediasoupService.createSendTransport(
      client.id,
    );
    client.emit('send-transport-created', transportInfo);
    this.logger.log(`Send transport created for client ${client.id}`);
  }

  @SubscribeMessage('connect-transport')
  async handleConnectTransport(
    @MessageBody()
    data: { transportType: 'send' | 'recv'; dtlsParameters: any },
    @ConnectedSocket() client: Socket,
  ) {
    const transport = this.mediasoupService.getTransport(
      client.id,
      data.transportType,
    ); // ✅ Correction ici

    if (!transport) {
      this.logger.error(
        `No ${data.transportType} transport found for client ${client.id}`,
      );
      return;
    }

    await transport.connect({ dtlsParameters: data.dtlsParameters });

    this.logger.log(
      `${data.transportType} transport connected for client ${client.id}`,
    );
    client.emit('transport-connected');
  }

  @SubscribeMessage('produce')
  async handleProduce(
    @MessageBody()
    data: {
      transportId: string;
      kind: 'audio' | 'video';
      rtpParameters: any;
      appData?: any;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const result = await this.mediasoupService.produce(
        client.id,
        'send',
        data.kind,
        data.rtpParameters,
        data.appData,
      );

      client.emit('produced', { id: result.id });
      this.logger.log(
        `Producer created for client ${client.id}, kind: ${data.kind}`,
      );
    } catch (err) {
      this.logger.error(`Produce error: ${err.message}`);
      client.emit('produce-error', { error: err.message });
    }
  }
}
