import { NestInterceptor, ExecutionContext, CallHandler, Injectable, HttpStatus } from '@nestjs/common';
import { map } from 'rxjs/operators';

interface Content {
    data?: any;
    code?: number;
    message?: string;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): import('rxjs').Observable<any> | Promise<import('rxjs').Observable<any>> {
        return next.handle().pipe(
            map((content: Content) => {
                return {
                    data: content.data || {},
                    code: content.code || HttpStatus.OK,
                    message: content.message || null,
                };
            }),
        );
    }
}
