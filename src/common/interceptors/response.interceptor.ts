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
                const req = context.switchToHttp().getRequest();

                const data = content?.data ?? {};
                const code = content?.code ?? HttpStatus.OK;
                const message = content?.message ?? null;

                const metadata = this.buildMetadata(req, content);

                return {
                    data: data,
                    code: code,
                    message: message,
                    metadata: metadata,
                };
            }),
        );
    }

    private buildMetadata(req: any, content: Content): Record<string, unknown> {
        const defaultMetadata = {
            appName: process.env.APP_NAME,
            apiVersion: process.env.VERSION,
            endpoint: req.originalUrl,
            timestamp: new Date(),
        };

        if (content?.data) {
            defaultMetadata['length'] = content.data.length;
        }

        if (req.query) {
            defaultMetadata['query'] = { ...req.query };
        }

        if (req.params) {
            defaultMetadata['params'] = { ...req.params };
        }

        return { ...defaultMetadata, ...content?.metadata };
    }
}
