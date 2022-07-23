import { Injectable } from '@nestjs/common';
import { MessageBrokerService } from 'src/modules/message-broker';

@Injectable()
export class ApiService {

    constructor(
        private readonly messageBrokerService: MessageBrokerService,
    ) { }

    async testQueueSendMessage() {
        await this.messageBrokerService.sendToQueue('DEMO_QUEUE_1', { data: { name: 'text' } })
    }
}