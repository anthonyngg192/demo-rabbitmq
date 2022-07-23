import * as _ from 'lodash';
import * as redis from 'redis';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export abstract class RedisCacheService {
    private _client: redis.RedisClientType<any>;
    private logger = new Logger(this.constructor.name);

    get client() {
        try {
            this._client = redis.createClient({ url: this.connectionString });
            this._client.connect();
        } catch (e) {
            this.logger.error(e.message);
        }
        return this._client;
    }
    constructor(
        private connectionString: string
    ) {
        if (!this._client) {
            try {
                this._client = redis.createClient({ url: this.connectionString })
            } catch (e) {
                this.logger.error(e.message);
            }
        }
    }

    public async getJSON<T>(cacheKey: string): Promise<T> {
        const result = await this.client.get(cacheKey);
        return result ? JSON.parse(result) : null;
    }

    public async listJSON<T>(cacheKeys: string[]): Promise<T[]> {
        const result = await this.client.mGet(_.uniq(cacheKeys));
        return result.length ? result.map(item => JSON.parse(item)) : [];
    }

    public async setJSON(
        key: string,
        value: any,
        lifetime?: number,
    ) {
        return await this.client.set(key, JSON.stringify(value), lifetime ? { PX: lifetime } : {});
    }

}