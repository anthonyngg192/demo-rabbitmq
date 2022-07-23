export class BaseConfigReceive {
    public amountRetry = 3;
    public timeDelayRetry = 10000;
    public timeOut = 30000;
    constructor(data?: Partial<BaseConfigReceive>) {
        typeof data.amountRetry !== 'undefined' && (this.amountRetry = data.amountRetry);
        typeof data.timeDelayRetry !== 'undefined' && (this.timeDelayRetry = data.timeDelayRetry);
        typeof data.timeOut !== 'undefined' && (this.timeOut = data.timeOut);
    }
}

export class NackConfig {
    public retry?: boolean = false;
    constructor(data?: NackConfig) {
        this.retry = data.retry;
    }
}

export enum CustomerHeaderMQ {
    IS_RETRY_MESSAGE = 'isRetryMessage',
    REQUEUE_TIME = 'requeueTime',
}