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
  const { pathname } = request.nextUrl;

  // Rate limiting para login
  if (pathname.startsWith('/api/auth/login')) {
    const rateLimitResult = await loginRateLimiter(request);
    if (rateLimitResult.status === 429) {
      return rateLimitResult;
    }
  }

  // Rate limiting para APIs generales
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const rateLimitResult = await apiRateLimiter(request);
    if (rateLimitResult.status === 429) {
      return rateLimitResult;
    }
  }

  // Permitir el acceso directo a /login, documentación y solo a las APIs de autenticación
  if (pathname.startsWith('/login') || 
      pathname.startsWith('/documentacion') ||
      pathname.startsWith('/api/auth') || 
      pathname.startsWith('/api/ping')) {
    return NextResponse.next();
  }

  // Para APIs que requieren autenticación pero no son de auth, verificar JWT
  if (pathname.startsWith('/api/')) {
    const authCookie = request.cookies.get('auth');
    if (!authCookie) {
      return NextResponse.json(
        { error: 'No autorizado. Token de autenticación requerido.' },
        { status: 401 }
      );
    }

    try {
      const verified = await jwtVerify(authCookie.value, new TextEncoder().encode(JWT_SECRET));
      
      // Agregar información del usuario al request para rate limiting
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', verified.payload.sub as string);
      requestHeaders.set('x-user-role', verified.payload.role as string);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (e) {
      return NextResponse.json(
        { error: 'Token de autenticación inválido.' },
        { status: 401 }
      );
    }
  }

  // Para rutas de páginas (no APIs), redirigir al login si no hay autenticación
  const authCookie = request.cookies.get('auth');
  if (!authCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  try {
    const verified = await jwtVerify(authCookie.value, new TextEncoder().encode(JWT_SECRET));
    
    // Agregar información del usuario al request para rate limiting
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', verified.payload.sub as string);
    requestHeaders.set('x-user-role', verified.payload.role as string);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (e) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/((?!_next|static|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif|api/auth/login|api/auth/crearusuario|api/auth/logout).*)',
  ],
}; 