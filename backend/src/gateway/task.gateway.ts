import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow from anywhere (for development)
  },
})
export class TaskGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('TaskGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // emitTaskUpdate(event: string, payload: any) {
  //   this.server.emit(event, payload);
  // }
  emitTaskUpdate(event: string, payload: any) {
    try {
      this.server.emit(event, payload);
    } catch (err) {
      this.logger.error(`emitTaskUpdate failed: ${err.message}`);
    }
  }
}
