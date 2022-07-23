import { BaseConfigReceive } from './message-broker.model';

export class ReceiveMessageFromQueueConfig extends BaseConfigReceive {
    constructor(config: Partial<ReceiveMessageFromQueueConfig> = {}) {
        super({
            amountRetry: config.amountRetry,
            timeDelayRetry: config.timeDelayRetry,
            timeOut: config.timeOut,
        });
        typeof config.durable !== 'undefined' && (this.durable = config.durable);
        typeof config.autoAck !== 'undefined' && (this.autoAck = config.autoAck);
    }
    public durable = true;
    public autoAck = true;
}
