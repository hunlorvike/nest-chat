import { NestInterceptor, ExecutionContext, CallHandler, Injectable, HttpStatus } from '@nestjs/common';
import { map } from 'rxjs/operators';
import * as dotenv from 'dotenv'
import { ResponseStatus } from '../enums/response-status.enum';
dotenv.config();

interface Content {
    data?: any;
    code?: number;
    message?: string;
    metadata?: Record<string, unknown>;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): import('rxjs').Observable<any> | Promise<import('rxjs').Observable<any>> {
        return next.handle().pipe(
            map((content: Content) => {
                if (!content) {
                    return {
                        code: HttpStatus.OK,
                        data: null,
                        metadata: null,
                        message: ResponseStatus.FAIL
                    };
                }

                const req = context.switchToHttp().getRequest();

                const metadata = {
                    ...content.metadata,
                    appName: process.env.APP_NAME,
                    apiVersion: process.env.VERSION,
                    endpoint: req.originalUrl,
                    timestamp: new Date(),
                    length: content?.data?.length,
                    query: req.query ? { ...req.query } : undefined,
                    params: req.params ? { ...req.params } : undefined,
                }; 

                return {
                    data: content.data ?? {},
                    code: content.code ?? HttpStatus.OK,
                    message: content.message ?? null,
                    metadata: metadata,
                };
            }),
        );
    }
}
