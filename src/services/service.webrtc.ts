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

@WebSocketGateway({ cors: true })
export class WebrtcGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private logger: Logger = new Logger('WebrtcGateway');

    afterInit(server: Server) {
        this.logger.log('WebSocket Gateway Initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join-room')
    handleJoinRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
        client.join(data.room);
        client.to(data.room).emit('user-joined', client.id);
        this.logger.log(`Client ${client.id} joined room ${data.room}`);
    }

    @SubscribeMessage('signal')
    handleSignal(@MessageBody() data: { room: string; signal: any; sender: string }, @ConnectedSocket() client: Socket) {
        client.to(data.room).emit('signal', { signal: data.signal, sender: data.sender });
    }
}
