import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheConnection {
    redisConnection: string;

}