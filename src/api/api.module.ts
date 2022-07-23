import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { Module } from '@nestjs/common';

@Module({
    imports: [],
    providers: [ApiService],
    controllers: [ApiController]
})
export class ApiModule { }
