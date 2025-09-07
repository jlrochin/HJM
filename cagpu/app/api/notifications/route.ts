import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';

// Función auxiliar para verificar JWT
async function verifyAuth(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('auth');
    if (!authCookie) {
      return { success: false, error: 'No autenticado', status: 401 };
    }

    const { payload } = await jwtVerify(authCookie.value, new TextEncoder().encode(JWT_SECRET));
    const userId = payload.id as number;
    
    if (!userId) {
      return { success: false, error: 'Token inválido', status: 401 };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      return { success: false, error: 'Usuario no encontrado o inactivo', status: 404 };
    }

    return { success: true, user, userId };
  } catch (error) {
    return { success: false, error: 'Token inválido', status: 401 };
  }
}

// Obtener notificaciones del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, userId } = auth;
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === '1';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let where: any = {};
    let baseWhere: any = {};

    if (user && (user.role === 'admin' || user.role === 'developer')) {
      // Los administradores ven todas las notificaciones (excepto login/logout)
      baseWhere = {
        AND: [
          { title: { not: { contains: 'login' } } },
          { title: { not: { contains: 'logout' } } },
        ]
      };
    } else {
      // Los usuarios normales solo ven sus notificaciones
      baseWhere = {
        userId,
        AND: [
          { title: { not: { contains: 'login' } } },
          { title: { not: { contains: 'logout' } } },
        ]
      };
    }

    where = showAll ? baseWhere : { ...baseWhere, isRead: false };

    // Obtener notificaciones con paginación
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              direction: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.notification.count({ where })
    ]);

    return NextResponse.json({ 
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Marcar una notificación como leída
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, userId } = auth;
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID de notificación requerido' }, { status: 400 });
    }

    // Buscar la notificación
    const notification = await prisma.notification.findUnique({ 
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notificación no encontrada' }, { status: 404 });
    }

    // Verificar permisos: solo el dueño o admin/developer puede marcar como leída
    if (notification.userId !== userId && user && user.role !== 'admin' && user.role !== 'developer') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Marcar como leída
    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true, message: 'Notificación marcada como leída' });

  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Crear una nueva notificación
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user } = auth;
    const { title, message, userId, serviceId } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Título requerido' }, { status: 400 });
    }

    // Solo admin/developer puede crear notificaciones para otros usuarios
    if (userId && user && userId !== user.id && user.role !== 'admin' && user.role !== 'developer') {
      return NextResponse.json({ error: 'No autorizado para crear notificaciones para otros usuarios' }, { status: 403 });
    }

    // Verificar que el servicio existe si se especifica
    if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!service) {
        return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
      }
    }

    // Crear la notificación
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        userId: userId || (user ? user.id : null),
        serviceId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            direction: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      notification,
      message: 'Notificación creada exitosamente' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error al crear notificación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Eliminar una notificación
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, userId } = auth;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de notificación requerido' }, { status: 400 });
    }

    // Buscar la notificación
    const notification = await prisma.notification.findUnique({ 
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notificación no encontrada' }, { status: 404 });
    }

    // Verificar permisos: solo el dueño o admin/developer puede eliminar
    if (notification.userId !== userId && user && user.role !== 'admin' && user.role !== 'developer') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Eliminar la notificación
    await prisma.notification.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true, message: 'Notificación eliminada exitosamente' });

  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 