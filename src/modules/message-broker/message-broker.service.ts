import { AckHandler } from './models/ack-handler';
import { BaseMessageReceivedService } from './base.message-broker';
import { BaseUseCase } from '../base.use-case';
import { Channel, connect, Connection } from 'amqplib';
import { CustomerHeaderMQ } from './config/message-broker.model';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { v4 } from 'uuid';
import {
    ReceiveMessageFromQueueConfig,
    ReceiveMessageFromTopicConfig,
    SendMessageToQueueConfig,
    SendMessageToTopicConfig,
} from './config';

export interface IMetadataMQ {
    traceId?: string;
    [key: string]: any;
}

export interface IMessageMQ {
    payload: any;
    metadata: IMetadataMQ;
}

export enum CONSUME_TYPE {
    QUEUE = 'QUEUE',
    TOPIC = 'TOPIC',
}

@Injectable()
export class MessageBrokerService implements OnModuleInit, OnModuleDestroy {
    private connectionString: string;
    private connection!: Connection;
    private readonly queueChannels: { [key: string]: Channel } = {};
    private readonly topicChannels: { [key: string]: Channel } = {};
    private logger = new LoggerService(this.constructor.name);

    public setConnectionString(connectionString: string) {
        this.connectionString = connectionString;
    }

    public async onModuleInit(): Promise<void> {
        this.logger.log(`Start connect to message broker`);
        this.logger.log(`Connection string mq: ${this.connectionString}`);
        try {
            this.connection = await connect(this.connectionString);
            this.connection.on('open', () => {
                this.logger.log(`Connection message broker`);
            });
            this.connection.on('error', (error) => {
                this.logger.error(`Error connect message broker: ${error.message}`);
            });
        } catch (error) {
            this.logger.error(`Some thing wrong when connect message broker: ${error.message}`);
        }
    }

    public async sendToQueue<IRequest>(
        queueName: string,
        payload: IRequest,
        config = new SendMessageToQueueConfig(),
        serverHandler?: BaseUseCase<any, any>,
    ): Promise<boolean> {
        let resultSend = false;
        const data = {
            metadata: {
                traceId: serverHandler?.getTraceId(),
                payload,
            },
        };
        try {
            this.queueChannels[queueName] = this.queueChannels[queueName] || await this.connection.createChannel();
            resultSend = await this.pushMessageToQueue(this.queueChannels[queueName], queueName, data, config);
            return resultSend;
        } catch (error) {
            this.logger.error(`Error when publish message: ${error.message}`);
            this.logger.log(`Reconnecting to queue`);
            this.connection = await connect(this.connectionString);
            await this.connection.createChannel();
            return this.reSendToQueue(queueName, data, config)
        }
    }

    private async reSendToQueue(queueName: string, data: any, config: SendMessageToQueueConfig) {
        try {
            this.queueChannels[queueName] = this.queueChannels[queueName] || await this.connection.createChannel();
            return await this.pushMessageToQueue(this.queueChannels[queueName], queueName, data, config);
        } catch (err) {
            this.logger.error(`Failed to reconnect and send to Queue - ${err.message}`);
            return false;
        }
    }

    public async sendToTopic<IRequest>(
        topicName: string,
        payload: IRequest,
        config = new SendMessageToTopicConfig(),
        serverHandler?: BaseUseCase<any, any>,
    ): Promise<boolean> {
        try {
            const data = {
                metadata: {
                    traceId: serverHandler?.getTraceId(),
                },
                payload,
            };
            this.topicChannels[topicName] = this.topicChannels[topicName] || await this.connection.createChannel();
            let resultSend = false;

            resultSend = await this.pushMessageToTopic(this.topicChannels[topicName], topicName, data, config);

            return resultSend;
        } catch (error) {
            this.logger.error(`Error when publish message: ${error.message}`);
        }
    }

    private async pushMessageToQueue(channel: Channel, queueName: string, data: any, config: SendMessageToQueueConfig) {
        await channel.assertQueue(queueName, {
            durable: config.durable,
        });
        const resultSendToQueue = channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
            ...config,
        });
        this.logger.log(
            `Result push message to queue ${queueName} is ${resultSendToQueue ? `successfully` : `failure`}`,
        );
        return resultSendToQueue;
    }

    private async pushMessageToTopic(channel: Channel, topicName: string, data: any, config: SendMessageToTopicConfig) {
        channel.assertExchange(topicName, 'fanout', {
            durable: config.durable,
        });
        const resultSendToTopic = channel.publish(topicName, '', Buffer.from(JSON.stringify(data)));
        this.logger.log(
            `Result push message to topic ${topicName} is ${resultSendToTopic ? `successfully` : `failure`}`,
        );
        return resultSendToTopic;
    }

    async receiveMessageFromQueue<IRequest, IResponse>(
        queueName: string,
        handler: BaseMessageReceivedService<IRequest, IResponse>,
        config?: Partial<ReceiveMessageFromQueueConfig>,
    ): Promise<void> {
        const configData = new ReceiveMessageFromQueueConfig(config);
        const channel = await this.connection.createChannel();
        this.logger.log(`Listening on queue '${queueName}'`);
        this.configConsumerForQueue(channel, queueName, configData.durable);
        this.handleConsume<IRequest, IResponse>(channel, queueName, configData, handler, CONSUME_TYPE.QUEUE);
    }

    async receiveMessageFromTopic<IRequest, IResponse>(
        topicName: string,
        queueName: string,
        handler: BaseMessageReceivedService<IRequest, IResponse>,
        config?: Partial<ReceiveMessageFromTopicConfig>,
    ): Promise<void> {
        const dataConfig = new ReceiveMessageFromTopicConfig(config);
        const channel = await this.connection.createChannel();
        this.logger.log(`Listening on topic '${topicName}' and queue '${queueName}'`);
        this.configConsumerForTopic(channel, topicName, queueName, dataConfig);
        this.handleConsume<IRequest, IResponse>(channel, queueName, dataConfig, handler, CONSUME_TYPE.TOPIC);
    }

    private configConsumerForTopic(
        channel: Channel,
        topicName: string,
        queueReceiveName: string,
        config: Partial<ReceiveMessageFromTopicConfig>,
    ) {
        channel.assertQueue(queueReceiveName, {
            durable: config.durable,
        });
        channel.assertExchange(topicName, 'fanout', {
            durable: config.durable,
        });
        channel.bindQueue(queueReceiveName, topicName, '');
    }

    private configConsumerForQueue(channel: Channel, queueName: string, durable: boolean) {
        channel.assertQueue(queueName, {
            durable,
        });
    }

    private handleConsume<IRequest, IResponse>(
        channel: Channel,
        queue: string,
        config: Partial<ReceiveMessageFromTopicConfig | ReceiveMessageFromQueueConfig>,
        handler: BaseMessageReceivedService<IRequest, IResponse>,
        consumerType: CONSUME_TYPE,
    ) {
        channel.consume(queue, async (message) => {
            this.logger.log(`Message content :${message.content.toString()}`);
            let acked = false;
            const timeoutHandler = setTimeout(() => {
                this.logger.log(`Auto acknowledge message ${message.content.toString()} of queue: ${queue}`);
                acked = true;
                channel.ack(message);
                handler.setByPassAck();
            }, config.timeOut);
            try {
                await this.handlerMessage(
                    queue,
                    JSON.parse(message.content.toString()) as IMessageMQ,
                    handler,
                    consumerType,
                    config.autoAck ? null : new AckHandler(channel, message, queue),
                );
                if (config.autoAck && !acked) {
                    this.logger.log(`Auto acknowledge message ${message.content.toString()} of queue: ${queue}`);
                    channel.ack(message);
                }
                clearTimeout(timeoutHandler);
            } catch (error) {
                clearTimeout(timeoutHandler);
                if (config.autoAck) {
                    this.logger.log(`Auto acknowledge message ${message.content.toString()} of queue: ${queue}`);
                    channel.ack(message);
                } else {
                    if (message.properties.headers[CustomerHeaderMQ.IS_RETRY_MESSAGE]) {
                        this.logger.warn(
                            `Handler message retry ${message.properties.headers[CustomerHeaderMQ.REQUEUE_TIME]} time`,
                        );
                        const dlq_queue = `DLQ.${queue}`;
                        if (message.properties.headers[CustomerHeaderMQ.REQUEUE_TIME] >= config.amountRetry) {
                            this.logger.warn(`Message sent to ${dlq_queue}`);
                            channel.sendToQueue(dlq_queue, message.content, {
                                persistent: true,
                            });
                        } else {
                            setTimeout(() => {
                                channel.sendToQueue(queue, message.content, {
                                    persistent: true,
                                    headers: {
                                        [CustomerHeaderMQ.REQUEUE_TIME]:
                                            message.properties.headers[CustomerHeaderMQ.REQUEUE_TIME] + 1,
                                        [CustomerHeaderMQ.IS_RETRY_MESSAGE]: true,
                                    },
                                });
                            }, config.timeDelayRetry);
                        }
                    } else {
                        channel.sendToQueue(queue, message.content, {
                            persistent: true,
                            headers: {
                                [CustomerHeaderMQ.REQUEUE_TIME]: 1,
                                [CustomerHeaderMQ.IS_RETRY_MESSAGE]: true,
                            },
                        });
                    }
                    channel.ack(message);
                }
            }
        });
    }

    public async handlerMessage<IRequest, IResponse>(
        queueName: string,
        message: IMessageMQ,
        handler: BaseMessageReceivedService<IRequest, IResponse>,
        consumerType: CONSUME_TYPE,
        handlerAck: AckHandler,
    ) {
        let traceId: string;
        if (message.metadata?.traceId) {
            traceId = message.metadata?.traceId + this.addSuffixTraceId(consumerType, queueName);
        } else {
            traceId = v4() + this.addSuffixTraceId(consumerType, queueName);
            this.logger.warn(`Don't have traceId in message receive, auto init traceId: ${traceId}`);
        }

        try {
            handler.setHandlerAck(handlerAck);
            handler.initLoggerTraceId(traceId);
            await handler.execute(message.payload);
        } catch (error) {
            this.logger.error(`Error when handle message in queue: ${queueName}`, error.message);
            throw error;
        }
    }

    private addSuffixTraceId(consumerType: string, queueName: string) {
        return consumerType === CONSUME_TYPE.TOPIC ? `-${queueName}` : '';
    }

    public async onModuleDestroy(): Promise<void> {
        this.connection.close();
    }
}
