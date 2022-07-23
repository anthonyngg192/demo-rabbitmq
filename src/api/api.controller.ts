import _ from 'lodash';
import { ApiService } from './api.service';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post } from '@nestjs/common';

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

    @Get('redis')
    async redis() {
        return await this.apiService.testRedis();
    }

    @Post('socket')
    async socket() {
        return await this.apiService.send();
    }
}
