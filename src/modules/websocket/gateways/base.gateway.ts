import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Injectable, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { JoinRoomDTO } from '../dto/join-room.dto';
import { Server, Socket } from 'socket.io';

@Injectable()
export abstract class BaseGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    protected readonly logger = new Logger(this.constructor.name)


    handleDisconnect() {
        this.logger.log(`Disconnect ${Date.now()}`);
    }

    handleConnection(@ConnectedSocket() client: Socket) {
        client.join('rom:anthony');
        return true;
    }

    afterInit() {
        this.logger.log('Initialize Success');
    }


    @UsePipes(new ValidationPipe())
    @SubscribeMessage('JoinRoom')
    async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() dto: JoinRoomDTO) {
        client.join(dto.values.map(value => `${dto.type}:${value}`));
    }

    @UsePipes(new ValidationPipe())
    @SubscribeMessage('LeaveRoom')
    async leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() dto: JoinRoomDTO) {
        dto.values.forEach(value => {
            client.leave(`${dto.type}:${value}`);
        })
    }

}