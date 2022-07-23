import { CacheService } from 'src/modules/redis-cache/cache.service';
import { DemoGateway } from 'src/modules/websocket/gateways/demo.gateway';
import { Injectable, Logger } from '@nestjs/common';
import { MessageBrokerService } from 'src/modules/message-broker';

@Injectable()
export class ApiService {
    private logger = new Logger(this.constructor.name)
    constructor(
        private readonly messageBrokerService: MessageBrokerService,
        private readonly redisCacheService: CacheService,
        private readonly demoGateway: DemoGateway
    ) {
    }

    async testQueueSendMessage() {
        await this.messageBrokerService.sendToQueue('DEMO_QUEUE_1', { data: { name: 'text' } })
    }

    async testRedis() {
        try {
            return await this.redisCacheService.getJSON('1213');
        } catch (err) {
            this.logger.error(err.message)
        }
    }

    async send() {
        this.demoGateway.server.to('rom:anthony').emit('event', { test: '123' })
    }
}