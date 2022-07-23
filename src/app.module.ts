import { ApiModule } from './api/api.module';
import { CacheConnection } from './modules/redis-cache/cache.connection';
import { MessageBrokerModule, MessageBrokerService } from './modules/message-broker';
import { Module } from '@nestjs/common';
import { RedisCacheModule } from './modules/redis-cache/redis-cache.module';
import { WebsocketModule } from './modules/websocket/websocket.module';

@Module({
    imports: [
        MessageBrokerModule.forRoot(
            {
                provide: MessageBrokerService,
                useFactory() {
                    const service = new MessageBrokerService();
                    service.setConnectionString('amqp://guest:guest@localhost:5672/');

                    return service;
                },
                inject: [],
            }
        ),
        RedisCacheModule.forRoot({
            provide: CacheConnection,
            useFactory() {
                return {
                    redisConnection: 'redis://:@127.0.0.1:6379'
                }
            },
            inject: []
        }),
        WebsocketModule,
        ApiModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
