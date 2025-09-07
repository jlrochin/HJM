import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SignJWT } from 'jose'
import { JWT_SECRET, JWT_EXPIRES_IN } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const user = await authenticateUser(username, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      )
    }
    if ('inactive' in user && user.inactive) {
      return NextResponse.json(
        { error: 'Tu usuario está desactivado. Contacta al administrador.' },
        { status: 403 }
      )
    }

    // Registrar inicio de sesión en AuditLog
    try {
      await prisma.auditLog.create({
        data: {
          action: 'login',
          performedBy: user!.id,
          details: `Inicio de sesión exitoso para ${user.username}`,
          ip: request.headers.get('x-forwarded-for') || request.ip || '',
          userAgent: request.headers.get('user-agent') || '',
        },
      })
    } catch (e) {
      console.error('No se pudo registrar el login en AuditLog:', e)
    }

    // Actualizar lastActiveAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    // Crear respuesta y setear cookie 'auth'
    const response = NextResponse.json({
      success: true,
      user: {
        id: user!.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
      },
    })

    // Firmar un JWT con los datos del usuario y guardarlo en la cookie 'auth'
    if (user && user.id) {
      const jwt = await new SignJWT({
        id: user.id,
        username: user.username,
        role: user.role,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(new TextEncoder().encode(JWT_SECRET));
      response.cookies.set('auth', jwt, {
        httpOnly: true,
        path: '/',
        // secure: true, // solo en producción
        // sameSite: 'lax',
        // maxAge: 60 * 60 * 24, // 1 día
      })
    }

    return response
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 