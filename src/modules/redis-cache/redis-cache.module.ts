import { CacheConnection } from './cache.connection';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ModelCacheService } from './model-cache.service';

const services = [
    ModelCacheService
]

@Global()
@Module({
    providers: [],
    exports: []
})
export class RedisCacheModule {
    static forRoot(connectionProvider: Provider<CacheConnection>): DynamicModule {
        return {
            module: RedisCacheModule,
            providers: [...services, connectionProvider],
            exports: services
        }
    }
}