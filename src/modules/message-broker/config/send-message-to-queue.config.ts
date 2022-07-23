export class SendMessageToQueueConfig {
    constructor(config?: SendMessageToQueueConfig) {
        Object.assign(this, config);
    }
    public persistent?: boolean = true;
    public durable?: boolean = true;
};