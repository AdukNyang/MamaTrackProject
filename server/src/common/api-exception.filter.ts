import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : typeof body === 'object' && body !== null && 'message' in body
            ? Array.isArray((body as { message: string | string[] }).message)
              ? (body as { message: string[] }).message.join(', ')
              : String((body as { message: string }).message)
            : 'Request failed';

      response.status(status).json({ error: message });
      return;
    }

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';
    const status =
      message === 'Not authenticated'
        ? HttpStatus.UNAUTHORIZED
        : message.includes('access required') || message.includes('authorized')
          ? HttpStatus.FORBIDDEN
          : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({ error: message });
  }
}
