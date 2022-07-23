import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { MessageBrokerService } from './message-broker.service';

@Global()
@Module({})
export class MessageBrokerModule {
    static forRoot(messageBrokerServiceProvider: Provider<MessageBrokerService>): DynamicModule {
        return {
            module: MessageBrokerModule,
            providers: [
                messageBrokerServiceProvider
            ],
            exports: [messageBrokerServiceProvider],
        };
    }
} { }