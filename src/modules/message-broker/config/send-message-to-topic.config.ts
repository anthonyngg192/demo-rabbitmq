export class SendMessageToTopicConfig {
    constructor(config?: SendMessageToTopicConfig) {
        Object.assign(this, config);
    }
    public durable?: boolean = true;
}
