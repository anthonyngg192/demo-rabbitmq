import { AckHandler } from './models/ack-handler';
import { BaseUseCase } from '../base.use-case';

export abstract class BaseMessageReceivedService<IRequest = any, IResponse = any> extends BaseUseCase<
    IRequest,
    IResponse
> {
    private handleAck: AckHandler;
    private byPassAck = false;

    ack() {
        if (this.handleAck?.ack && !this.byPassAck) {
            const result = this.handleAck.ack();
            this.logger.log(`Acknowledge message ${result.message.content.toString()} of queue: ${result.queue}`);
        }
    }

    nack() {
        if (this.handleAck?.nack) {
            const result = this.handleAck.nack();
            this.logger.log(`Nacknowledge message ${result.message.content.toString()} of queue: ${result.queue}`);
        }
    }

    setHandlerAck(handleAck: AckHandler): BaseMessageReceivedService<IRequest, IResponse> {
        this.handleAck = handleAck;
        return this;
    }

    setByPassAck() {
        this.byPassAck = true;
    }
}
