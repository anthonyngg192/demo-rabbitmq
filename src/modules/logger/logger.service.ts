import * as Pino from 'pino';
import { LoggerService as ILoggerService } from '@nestjs/common';
import { LogLevel } from './log-level';

export type LEVEL_LOG_TYPE = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export class LoggerService implements ILoggerService {
    private context: string;
    private traceId: string;

    private pino = Pino({
        level: process.env.LOG_LEVEL || LogLevel.DEBUG,
        timestamp: () => {
            const isoTime = `,"time":"${new Date(Date.now()).toISOString()}"`;
            return isoTime;
        },
    });

    constructor(context?: string, traceId?: string) {
        this.context = context || '';
        this.traceId = traceId || '';
    }

    public setTraceId(traceId: string): LoggerService {
        this.traceId = traceId;
        return this;
    }
    public setContext(context: string): LoggerService {
        this.context = context;
        return this;
    }

    public debug(message: string, context?: string): void {
        this.pino.debug(`${this.stringTraceId()} ${this.getContext(context)} - ${message}`);
    }

    public error(message: string, trace?: string | undefined, context?: string): void {
        this.pino.error(`${this.stringTraceId()}${this.getContext(context)} - ${message} - ${trace}`);
    }

    public warn(message: string, context?: string): void {
        this.pino.warn(`${this.stringTraceId()}${this.getContext(context)} - ${message}`);
    }

    public log(message: string, context?: string): void {
        this.pino.info(`${this.stringTraceId()}${this.getContext(context)} - ${message}`);
    }

    private stringTraceId() {
        return this.traceId ? ` ${this.traceId} - ` : ' ';
    }

    private getContext(context: string) {
        return context || this.context;
    }
}
