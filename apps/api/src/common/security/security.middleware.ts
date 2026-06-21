import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

type Bucket = { count: number; expiresAt: number };
const buckets = new Map<string, Bucket>();
let nextCleanupAt = 0;

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
    /^\/api\/ai\/findings\/[^/]+\/source$/.test(path) ||
    /^\/api\/ai\/findings\/[^/]+\/(review|fix(?:\/pull-request)?)$/.test(
      path,
    ) ||
    /^\/api\/workspaces(?:\/|$)/.test(path) ||
    /^\/api\/scans\/[^/]+\/report\/pdf$/.test(path) ||
    /^\/api\/admin\/providers\/[^/]+\/test$/.test(path)
  );
}

export function securityMiddleware(
  limit = 30,
  windowMs = 60_000,
  requireHttps = false,
  maxBodyBytes = 1024 * 1024,
  rateLimitEnabled = true,
  allowedOrigins: string[] = [],
): (request: Request, response: Response, next: NextFunction) => void {
  return (request, response, next) => {
    const requestId =
      request.header('x-request-id')?.slice(0, 128) ?? randomUUID();
    (request as Request & { requestId: string }).requestId = requestId;
    response.setHeader('x-request-id', requestId);
    response.setHeader('x-content-type-options', 'nosniff');
    response.setHeader('x-dns-prefetch-control', 'off');
    response.setHeader('x-frame-options', 'DENY');
    response.setHeader('x-permitted-cross-domain-policies', 'none');
    response.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
    response.setHeader(
      'permissions-policy',
      'camera=(), microphone=(), geolocation=()',
    );
    response.setHeader('cross-origin-opener-policy', 'same-origin');
    response.setHeader('cross-origin-resource-policy', 'same-site');
    if (!request.path.startsWith('/api/docs')) {
      response.setHeader(
        'content-security-policy',
        "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
      );
      response.setHeader(
        'cache-control',
        'no-store, no-cache, must-revalidate, proxy-revalidate',
      );
      response.setHeader('pragma', 'no-cache');
      response.setHeader('expires', '0');
    }
    const contentLength = Number(request.header('content-length') ?? 0);
    if (Number.isFinite(contentLength) && contentLength > maxBodyBytes) {
      return response.status(413).json({
        message: 'Request body is too large',
        requestId,
        success: false,
      });
    }
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
    const origin = request.header('origin');
    if (
      origin &&
      isUnsafeMethod(request.method) &&
      allowedOrigins.length > 0 &&
      !allowedOrigins.includes(origin)
    ) {
      return response.status(403).json({
        message: 'Origin is not allowed',
        requestId,
        success: false,
      });
    }

    if (!rateLimitEnabled || !isLimitedRoute(request.path)) return next();
    const now = Date.now();
    cleanupExpiredBuckets(now);
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

function isUnsafeMethod(method: string) {
  return !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
}

function cleanupExpiredBuckets(now: number) {
  if (now < nextCleanupAt) return;
  nextCleanupAt = now + 60_000;
  for (const [key, bucket] of buckets) {
    if (bucket.expiresAt <= now) buckets.delete(key);
  }
}

function isLocalHealthCheck(request: Request): boolean {
  return (
    request.path === '/api/health' &&
    ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(request.ip ?? '')
  );
}
