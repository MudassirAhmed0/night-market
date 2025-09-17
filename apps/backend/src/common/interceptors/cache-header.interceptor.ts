import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Sets Cache-Control for GET responses only.
 * We rely on Express ETag for conditional requests.
 */
@Injectable()
export class CacheHeadersInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest<Request & { method: string }>();
    const res = ctx.switchToHttp().getResponse();

    const isGet = req.method === 'GET';
    if (!isGet) return next.handle();

    // Lists: shorter TTL, Details: longer — we infer by URL pattern (simple & sufficient for MVP).
    // Adjust as needed or annotate routes with custom metadata.
    const url = (req as any).url as string;
    const isList = url.startsWith('/events') && !/\/events\/[a-z0-9]/i.test(url);

    // Cache for shared caches (CDN) and allow stale-while-revalidate
    const cc = isList
      ? 'public, s-maxage=60, stale-while-revalidate=120'
      : 'public, s-maxage=300, stale-while-revalidate=600';

    return next.handle().pipe(
      tap(() => {
        res.setHeader('Cache-Control', cc);
        // ETag is auto by Express for JSON (we set app.set('etag','strong') in main.ts)
      }),
    );
  }
}
