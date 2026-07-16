import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '../lib/security';

export function withSecurity(handler: Function) {
  return async (request: Request, context?: any) => {
    const ip = getClientIP(request);
    const rateLimitKey = `api:${ip}:${request.url}`;

    if (!checkRateLimit(rateLimitKey, 100, 60000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const response = await handler(request, context);

    if (response instanceof NextResponse) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    return response;
  };
}
