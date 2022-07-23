import { CacheConnection } from './cache.connection';
import { Injectable } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';

@Injectable()
export class CacheService extends RedisCacheService {
    constructor(protected readonly cacheOptions: CacheConnection) {
        super(cacheOptions.redisConnection);
    }
}