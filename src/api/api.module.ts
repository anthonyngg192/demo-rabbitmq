import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { CacheService } from 'src/modules/redis-cache/cache.service';
import { Module } from '@nestjs/common';

@Module({
    imports: [],
    controllers: [ApiController],
    providers: [
        ApiService,
        {
            provide: CacheService,
            useFactory: () => new CacheService({ redisConnection: 'redis://:@127.0.0.1:6379/0' }),
            inject: [],
        },
    ],
})
export class ApiModule { }
