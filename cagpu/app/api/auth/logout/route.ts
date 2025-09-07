import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  // Obtener el id del usuario autenticado desde la cookie
  const authCookie = request.cookies.get('auth');
  const performedBy = authCookie ? parseInt(authCookie.value) : null;

  // Registrar cierre de sesión en AuditLog si hay usuario
  if (performedBy) {
    try {
      await prisma.auditLog.create({
        data: {
          action: 'logout',
          performedBy,
          details: 'Cierre de sesión',
          ip: request.headers.get('x-forwarded-for') || request.ip || '',
          userAgent: request.headers.get('user-agent') || '',
        },
      });
    } catch (e) {
      console.error('No se pudo registrar el logout en AuditLog:', e);
    }
  }

  const response = NextResponse.json({ success: true, message: 'Sesión cerrada correctamente' });
  response.cookies.set('auth', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0), // Expira inmediatamente
  });
  return response;
} 