import { BaseService } from './base.service';

export abstract class BaseUseCase<IRequest, IResponse> extends BaseService {
    public abstract execute(request?: IRequest): Promise<IResponse> | IResponse;
}