import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

type Bucket = { count: number; expiresAt: number };
const buckets = new Map<string, Bucket>();

const LIMITED_ROUTES = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/coupons/validate',
  '/api/payments/midtrans/create',
  '/api/payments/paypal/create-order',
]);

function isLimitedRoute(path: string): boolean {
  return (
    LIMITED_ROUTES.has(path) ||
    /^\/api\/repositories\/[^/]+\/scans$/.test(path) ||
    /^\/api\/ai\/findings\/[^/]+\/(review|fix(?:\/pull-request)?)$/.test(
      path,
    ) ||
    /^\/api\/scans\/[^/]+\/report\/pdf$/.test(path) ||
    /^\/api\/admin\/providers\/[^/]+\/test$/.test(path)
  );
}

export function securityMiddleware(
  limit = 30,
  windowMs = 60_000,
  requireHttps = false,
): (request: Request, response: Response, next: NextFunction) => void {
  return (request, response, next) => {
    const requestId =
      request.header('x-request-id')?.slice(0, 128) ?? randomUUID();
    (request as Request & { requestId: string }).requestId = requestId;
    response.setHeader('x-request-id', requestId);
    response.setHeader('x-content-type-options', 'nosniff');
    response.setHeader('x-frame-options', 'DENY');
    response.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
    response.setHeader(
      'permissions-policy',
      'camera=(), microphone=(), geolocation=()',
    );
    const forwardedProto = request.header('x-forwarded-proto');
    const secure = request.secure || forwardedProto === 'https';
    if (secure) {
      response.setHeader(
        'strict-transport-security',
        'max-age=31536000; includeSubDomains',
      );
    }
    if (requireHttps && !secure && !isLocalHealthCheck(request)) {
      return response.status(400).json({
        message: 'HTTPS is required',
        requestId,
        success: false,
      });
    }

    if (!isLimitedRoute(request.path)) return next();
    const now = Date.now();
    const key = `${request.ip}:${request.path}`;
    const current = buckets.get(key);
    const bucket =
      !current || current.expiresAt <= now
        ? { count: 0, expiresAt: now + windowMs }
        : current;
    bucket.count += 1;
    buckets.set(key, bucket);
    response.setHeader('x-ratelimit-limit', String(limit));
    response.setHeader(
      'x-ratelimit-remaining',
      String(Math.max(0, limit - bucket.count)),
    );
    if (bucket.count > limit)
      return response.status(429).json({
        message: 'Too many requests. Please try again later.',
        requestId,
        success: false,
      });
    next();
  };
}

function isLocalHealthCheck(request: Request): boolean {
  return (
    request.path === '/api/health' &&
    ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(request.ip ?? '')
  );
}
