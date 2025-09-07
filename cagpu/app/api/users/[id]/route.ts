import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { jwtVerify } from 'jose'
import { generateUserChangeDetails } from '@/lib/change-details'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    const userData = await request.json()

    // Obtener el usuario autenticado desde el JWT de la cookie
    const authCookie = request.cookies.get('auth')
    let performedBy = null
    if (authCookie) {
      try {
        const { payload } = await jwtVerify(authCookie.value, new TextEncoder().encode(JWT_SECRET))
        performedBy = payload.id
      } catch (e) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
      }
    }
    if (!performedBy) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Verificar si el usuario autenticado está activo
    const authUser = await prisma.user.findUnique({ where: { id: performedBy as number } })
    if (!authUser || !authUser.isActive) {
      return NextResponse.json({ error: 'Usuario inactivo o no encontrado' }, { status: 403 })
    }

    // Verificar si el usuario existe y obtener datos actuales
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        department: true,
        phone: true,
        isActive: true,
      },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Preparar datos para actualización
    const updateData: any = {
      username: userData.username,
      email: userData.email,
      role: userData.role,
      firstName: userData.firstName,
      lastName: userData.lastName,
      department: userData.department,
      phone: userData.phone,
    }

    // Si se proporciona una nueva contraseña, hashearla
    if (userData.password) {
      updateData.passwordHash = await bcrypt.hash(userData.password, 12)
    }

    // Verificar si el nuevo username o email ya existe en otro usuario
    if (userData.username !== existingUser.username || userData.email !== existingUser.email) {
      const duplicateUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: userData.username },
            { email: userData.email },
          ],
          NOT: { id: userId },
        },
      })

      if (duplicateUser) {
        return NextResponse.json(
          { error: 'El usuario o email ya existe' },
          { status: 409 }
        )
      }
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        department: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Generar detalles legibles de los cambios
    const changeDetails = generateUserChangeDetails(existingUser, updateData)
    
    // Registrar en historial
    await prisma.userChangeHistory.create({
      data: {
        targetUserId: userId,
        action: 'update',
        performedBy: performedBy as number,
        details: changeDetails,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    const { action } = await request.json()

    // Obtener el usuario autenticado desde el JWT de la cookie
    const authCookie = request.cookies.get('auth')
    let performedBy = null
    if (authCookie) {
      try {
        const { payload } = await jwtVerify(authCookie.value, new TextEncoder().encode(JWT_SECRET))
        performedBy = payload.id as number
      } catch (e) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
      }
    }
    if (!performedBy) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Verificar si el usuario autenticado está activo
    const authUser = await prisma.user.findUnique({ where: { id: performedBy as number } })
    if (!authUser || !authUser.isActive) {
      return NextResponse.json({ error: 'Usuario inactivo o no encontrado' }, { status: 403 })
    }

    // No permitir que un usuario se desactive a sí mismo
    if (action === 'deactivate' && performedBy === userId) {
      return NextResponse.json({ error: 'No puedes desactivarte a ti mismo.' }, { status: 403 })
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    let updateData: any = {}
    let actionType = ''

    if (action === 'deactivate') {
      updateData.isActive = false
      actionType = 'deactivate'
    } else if (action === 'activate') {
      updateData.isActive = true
      actionType = 'activate'
    } else {
      return NextResponse.json(
        { error: 'Acción no válida' },
        { status: 400 }
      )
    }

    // Actualizar estado del usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        department: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Registrar en historial
    await prisma.userChangeHistory.create({
      data: {
        targetUserId: userId,
        action: actionType,
        performedBy: performedBy as number,
        details: `Usuario ${actionType === 'deactivate' ? 'desactivado' : 'activado'}`,
      },
    })

    // Obtener el usuario que realiza la acción
    const adminUser = await prisma.user.findUnique({ where: { id: performedBy as number } });
    
    // Crear notificación para el usuario afectado
    await prisma.notification.create({
      data: {
        userId: userId,
        title: actionType === 'deactivate' ? 'Usuario desactivado' : 'Usuario activado',
        message: `El usuario ${existingUser.username} fue ${actionType === 'deactivate' ? 'desactivado' : 'activado'} por ${adminUser?.username || 'un administrador'}.`,
        isRead: false,
      },
    });

    // Crear notificaciones para todos los administradores activos (excepto el que realizó la acción y el usuario afectado)
    const admins = await prisma.user.findMany({
      where: {
        role: 'admin',
        isActive: true,
        id: { 
          notIn: [performedBy, userId] // Excluir tanto al admin que realizó la acción como al usuario afectado
        },
      },
    });

    // Crear notificaciones para los administradores
    const adminNotifications = admins.map(admin => ({
      userId: admin.id,
      title: actionType === 'deactivate' ? 'Usuario desactivado' : 'Usuario activado',
      message: `El usuario ${existingUser.username} fue ${actionType === 'deactivate' ? 'desactivado' : 'activado'} por ${adminUser?.username || 'un administrador'}.`,
      isRead: false,
    }));

    if (adminNotifications.length > 0) {
      await prisma.notification.createMany({
        data: adminNotifications,
      });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `Usuario ${actionType === 'deactivate' ? 'desactivado' : 'activado'} correctamente`,
    })
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 