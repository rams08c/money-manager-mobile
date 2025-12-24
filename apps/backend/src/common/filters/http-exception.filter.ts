import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorResponse: any = {
            statusCode: status,
            errorCode: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object') {
                errorResponse = {
                    ...errorResponse,
                    ...exceptionResponse,
                    statusCode: status,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                };
            } else {
                errorResponse = {
                    statusCode: status,
                    message: exceptionResponse,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                };
            }
        } else {
            // Log internal errors but don't expose details to client
            this.logger.error(
                `Internal server error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
                exception instanceof Error ? exception.stack : undefined,
            );
        }

        response.status(status).json(errorResponse);
    }
}
