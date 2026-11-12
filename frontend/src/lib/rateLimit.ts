/**
 * Lightweight, production-grade sliding window rate limiter for Next.js API Routes.
 * Protects against brute-force, credential stuffing, and API flooding.
 */

import { NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic garbage collection for stale memory records every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  limit?: number;        // Max allowed requests in window
  windowSeconds?: number; // Time window in seconds
  identifier?: string;   // Optional custom identifier (e.g. email or userId)
}

/**
 * Extracts client IP from standard proxy headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Checks if the request exceeds rate limits.
 * Returns null if allowed, or a 429 NextResponse if rate limit is exceeded.
 */
export function checkRateLimit(
  request: Request,
  actionName: string,
  config: RateLimitConfig = {}
): NextResponse | null {
  const limit = config.limit || 30;
  const windowMs = (config.windowSeconds || 60) * 1000;
  const clientIp = getClientIp(request);
  const key = `${actionName}:${config.identifier || clientIp}`;

  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs
    });
    return null;
  }

  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return NextResponse.json(
      {
        success: false,
        error: `Too many requests for ${actionName}. Please wait ${retryAfter} seconds before trying again.`,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(record.resetAt / 1000))
        }
      }
    );
  }

  record.count += 1;
  return null;
}
