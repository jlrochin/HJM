import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from './lib/config';
import { loginRateLimiter, apiRateLimiter, getRateLimitInfo } from './lib/rate-limit-nextjs';

// ============================================================================
// MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN - OPTIMIZADO PARA RED LOCAL
// ============================================================================
// Protege rutas y verifica tokens JWT
// Incluye rate limiting inteligente para redes locales
// ============================================================================

export async function middleware(request: NextRequest) {
  const originalPathname = request.nextUrl.pathname;
  const basePath = '/cagpu';

  // Solo operar bajo /cagpu
  if (!originalPathname.startsWith(basePath)) {
    return NextResponse.next();
  }

  // Path interno sin el prefijo /cagpu
  const innerPath = originalPathname.slice(basePath.length) || '/';

  // Permitir assets y archivos estáticos
  if (
    innerPath.startsWith('/_next') ||
    innerPath.startsWith('/static') ||
    /\.(png|jpg|jpeg|svg|gif|ico|css|js|map)$/i.test(innerPath)
  ) {
    return NextResponse.next();
  }

  // Bloquear contenido directo en /cagpu (redirigir a /cagpu/login siempre)
  if (innerPath === '/' || innerPath === '') {
    const loginUrl = new URL(`${basePath}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Rate limiting para login
  if (innerPath.startsWith('/api/auth/login')) {
    const rateLimitResult = await loginRateLimiter(request);
    if (rateLimitResult.status === 429) {
      return rateLimitResult;
    }
  }

  // Rate limiting para APIs generales
  if (innerPath.startsWith('/api/') && !innerPath.startsWith('/api/auth/')) {
    const rateLimitResult = await apiRateLimiter(request);
    if (rateLimitResult.status === 429) {
      return rateLimitResult;
    }
  }

  // Permitir público: /cagpu/login, /cagpu/documentacion, /cagpu/api/auth/*, /cagpu/api/ping
  if (
    innerPath.startsWith('/login') ||
    innerPath.startsWith('/documentacion') ||
    innerPath.startsWith('/api/auth') ||
    innerPath.startsWith('/api/ping')
  ) {
    return NextResponse.next();
  }

  // Verificación de JWT para APIs no públicas
  if (innerPath.startsWith('/api/')) {
    const authCookie = request.cookies.get('auth');
    if (!authCookie) {
      return NextResponse.json(
        { error: 'No autorizado. Token de autenticación requerido.' },
        { status: 401 }
      );
    }

    try {
      const verified = await jwtVerify(authCookie.value, new TextEncoder().encode(JWT_SECRET));
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', verified.payload.sub as string);
      requestHeaders.set('x-user-role', verified.payload.role as string);
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (e) {
      return NextResponse.json(
        { error: 'Token de autenticación inválido.' },
        { status: 401 }
      );
    }
  }

  // Para páginas, exigir autenticación
  const authCookie = request.cookies.get('auth');
  if (!authCookie) {
    const loginUrl = new URL(`${basePath}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const verified = await jwtVerify(authCookie.value, new TextEncoder().encode(JWT_SECRET));
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', verified.payload.sub as string);
    requestHeaders.set('x-user-role', verified.payload.role as string);
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (e) {
    const loginUrl = new URL(`${basePath}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/cagpu/:path*'],
};