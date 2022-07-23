import { Channel, Message } from 'amqplib';

export class AckHandler {
    constructor(private channel: Channel, private message: Message, private queue: string) {}

    ack() {
        this.channel.ack(this.message);
        return { queue: this.queue, message: this.message };
    }

    nack() {
        this.channel.nack(this.message, null, false);
        return { queue: this.queue, message: this.message };
    }
}
