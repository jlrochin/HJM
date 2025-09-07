import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateServiceData } from '@/lib/validation';
import { generateServiceChangeDetails } from '@/lib/change-details';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { user } = authResult;
    
    // Si es admin o developer, mostrar todos los servicios
    // Si es usuario normal, mostrar solo su servicio
    let services;
    if (user && (user.role === 'admin' || user.role === 'developer')) {
      services = await prisma.service.findMany({
        include: {
          direction: true,
        },
        orderBy: [
          { direction: { displayOrder: 'asc' } },
          { name: 'asc' }
        ]
      });
    } else {
      // Usuario normal solo ve su servicio
      if (!user || !user.serviceId) {
        return NextResponse.json({ error: 'Usuario no tiene servicio asignado' }, { status: 403 });
      }
      
      services = await prisma.service.findMany({
        where: { id: user.serviceId },
        include: {
          direction: true,
        }
      });
    }

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (!authResult.user || (authResult.user.role !== 'admin' && authResult.user.role !== 'developer')) {
      return NextResponse.json({ error: 'Solo los administradores y desarrolladores pueden crear servicios' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validar datos
    const validation = validateServiceData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.errors },
        { status: 400 }
      );
    }

    // Verificar si ya existe un servicio con el mismo nombre
    const existingService = await prisma.service.findFirst({
      where: {
        name: body.name,
      },
    });

    if (existingService) {
      return NextResponse.json(
        { error: 'Ya existe un servicio con este nombre' },
        { status: 409 }
      );
    }

    // Crear el servicio
    const service = await prisma.service.create({
      data: {
        id: body.id || `service_${Date.now()}`,
        name: body.name,
        directionId: body.directionId,
        responsiblePerson: body.responsiblePerson,
        phoneExtension: body.phoneExtension,
        serviceType: body.serviceType,
        location: body.location,
        description: body.description,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
      include: {
        direction: true,
      },
    });

    // Obtener información del usuario que creó el servicio
    const performedBy = authResult.user.id;

    // Generar detalles del cambio
    const changeDetails = generateServiceChangeDetails('create', service.name, service.direction.name);
    
    // Registrar en historial de cambios (usando la misma tabla por ahora)
    await prisma.userChangeHistory.create({
      data: {
        targetUserId: performedBy, // Para servicios, puede ser el usuario que lo creó
        action: 'service_create',
        performedBy,
        details: changeDetails,
      },
    });

    // Crear notificación para administradores
    const admins = await prisma.user.findMany({
      where: {
        role: 'admin',
        isActive: true,
      },
    });

    const performedByUser = await prisma.user.findUnique({
      where: { id: performedBy },
      select: { username: true },
    });

    await Promise.all(
      admins.map(admin =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'Nuevo servicio creado',
            message: `Se ha creado el servicio "${service.name}" en ${service.direction.name} por ${performedByUser?.username || 'un usuario'}.`,
            serviceId: service.id,
            isRead: false,
          },
        })
      )
    );

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Debug: mostrar datos recibidos
    console.log('Datos recibidos en PUT /api/services:', body)
    
    // Validar datos
    const validation = validateServiceData(body);
    if (!validation.isValid) {
      console.log('Errores de validación:', validation.errors)
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.errors },
        { status: 400 }
      );
    }

    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { user } = authResult;
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }
    
    const performedBy = user.id;

    // Verificar permisos: admin y developer pueden editar cualquier servicio, usuario normal solo su servicio
    if (user.role !== 'admin' && user.role !== 'developer') {
      if (!user.serviceId || user.serviceId !== body.id) {
        return NextResponse.json({ error: 'Solo puede editar su propio servicio' }, { status: 403 });
      }
    }

    // Verificar que el servicio existe
    const existingService = await prisma.service.findUnique({
      where: { id: body.id },
      include: { direction: true },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar el servicio
    const updatedService = await prisma.service.update({
      where: { id: body.id },
      data: {
        name: body.name,
        directionId: body.directionId,
        responsiblePerson: body.responsiblePerson,
        phoneExtension: body.phoneExtension,
        serviceType: body.serviceType,
        location: body.location,
        description: body.description,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
      include: {
        direction: true,
      },
    });

    // Obtener información del usuario que actualizó el servicio
    // performedBy ya está definido arriba

    // Generar detalles legibles de los cambios
    const changeDetails = generateServiceChangeDetails('update', updatedService.name, updatedService.direction.name, existingService, updatedService);
    
    // Debug: mostrar detalles de cambios
    console.log('Detalles de cambios generados:', changeDetails)
    
    // Registrar en historial de cambios
    await prisma.userChangeHistory.create({
      data: {
        targetUserId: performedBy,
        action: 'service_update',
        performedBy,
        details: changeDetails,
      },
    });

    // Crear notificación para administradores
    const admins = await prisma.user.findMany({
      where: {
        role: 'admin',
        isActive: true,
      },
    });

    const performedByUser = await prisma.user.findUnique({
      where: { id: performedBy },
      select: { username: true },
    });

    await Promise.all(
      admins.map(admin =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'Servicio actualizado',
            message: `El servicio "${updatedService.name}" ha sido actualizado por ${performedByUser?.username || 'un usuario'}.`,
            serviceId: updatedService.id,
            isRead: false,
          },
        })
      )
    );

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 