import { LoggerService } from './logger';
import { v4 } from 'uuid';

export abstract class BaseService {
    private traceId: string;
    public getTraceId(): string {
        return this.traceId;
    }
    protected readonly logger = new LoggerService(this.constructor.name);

    public initLoggerTraceId(traceId: string = v4()) {
        this.logger.setTraceId(traceId);
        this.traceId = traceId;
        return this;
    }
}
