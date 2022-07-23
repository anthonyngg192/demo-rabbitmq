import { ApiService } from './api.service';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

@ApiTags('Api')
@Controller('api')
export class ApiController {

    constructor(
        private readonly apiService: ApiService,
    ) { }

    @Get('hello')
    async getHello() {
        return await this.apiService.testQueueSendMessage();
    }
}
