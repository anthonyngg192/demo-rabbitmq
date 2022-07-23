import { ApiModule } from './api/api.module';
import { MessageBrokerModule, MessageBrokerService } from './modules/message-broker';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        ApiModule,
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
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
