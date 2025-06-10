import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ULTRA FAST response with minimal processing
  const response = NextResponse.next();
  
  // Aggressive browser caching for static assets
  if (pathname.startsWith('/static/') || pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  }
  
  // INSTANT prefetch hints for critical routes
  if (pathname === '/') {
    response.headers.set('Link', [
      '</courses>; rel=prefetch; as=document',
      '</exams>; rel=prefetch; as=document', 
      '</performance>; rel=prefetch; as=document',
      '</learning-goals>; rel=prefetch; as=document'
    ].join(', '));
  }
  
  // Performance headers for faster loading
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Faster compression
  response.headers.set('Vary', 'Accept-Encoding');

  // Compression hint
  response.headers.set('Accept-Encoding', 'gzip, deflate, br');
  
  // Performance monitoring
  response.headers.set('Server-Timing', `render;dur=${Date.now()}`);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
