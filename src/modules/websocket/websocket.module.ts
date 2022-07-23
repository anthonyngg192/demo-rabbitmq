import { DemoGateway } from './gateways/demo.gateway';
import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
    imports: [HttpModule],
    providers: [DemoGateway],
    exports: [DemoGateway],
})
export class WebsocketModule { }