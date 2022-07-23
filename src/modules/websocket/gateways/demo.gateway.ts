import { BaseGateway } from './base.gateway';
import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({ transport: ['websocket'] })
@Injectable()
export class DemoGateway extends BaseGateway { }