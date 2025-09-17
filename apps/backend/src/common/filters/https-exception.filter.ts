import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest<Request & { method: string; url: string }>();

    const timestamp = new Date().toISOString();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response: any = exception.getResponse();
      const message =
        typeof response === 'string' ? response : (response?.message ?? exception.message);

      return res.status(status).json({
        error: {
          status,
          message,
          path: req.url,
          method: req.method,
          timestamp,
        },
      });
    }

    // Fallback for unhandled errors
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    res.status(status).json({
      error: {
        status,
        message: 'Internal Server Error',
        path: req.url,
        method: req.method,
        timestamp,
      },
    });
  }
}
