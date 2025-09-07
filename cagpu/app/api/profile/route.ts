import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/db'
import { hashPassword, isStrongPassword } from '@/lib/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto'

export async function GET(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('auth')
    if (!authCookie) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { payload } = await jwtVerify(authCookie.value, new TextEncoder().encode(JWT_SECRET))
    const userId = payload.id as number

    const user = await prisma.user.findUnique({
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
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        fullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username,
        position: user.role === 'admin' ? 'Administrador' : user.role === 'user' ? 'Usuario' : user.role,
      }
    })
  } catch (error) {
    console.error('Error al obtener perfil:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('auth')
    if (!authCookie) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { payload } = await jwtVerify(authCookie.value, new TextEncoder().encode(JWT_SECRET))
    const userId = payload.id as number

    const body = await request.json()
    const { firstName, lastName, department, phone, email, currentPassword, newPassword } = body

    // Validar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Si se está cambiando la contraseña, validar la actual
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Contraseña actual es requerida' }, { status: 400 })
      }

      // Verificar contraseña actual
      const bcrypt = require('bcryptjs')
      const isValidPassword = await bcrypt.compare(currentPassword, existingUser.passwordHash)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 400 })
      }

      // Validar nueva contraseña
      if (!isStrongPassword(newPassword)) {
        return NextResponse.json({ 
          error: 'La nueva contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un símbolo' 
        }, { status: 400 })
      }
    }

    // Preparar datos a actualizar
    const updateData: any = {}
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (department !== undefined) updateData.department = department
    if (phone !== undefined) updateData.phone = phone
    if (email !== undefined) updateData.email = email
    if (newPassword) updateData.passwordHash = await hashPassword(newPassword)

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
        updatedAt: true,
      },
    })

    // Registrar cambio en historial
    await prisma.userChangeHistory.create({
      data: {
        targetUserId: userId,
        action: 'profile_update',
        performedBy: userId,
        details: 'Perfil actualizado por el usuario',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: {
        ...updatedUser,
        fullName: updatedUser.firstName && updatedUser.lastName ? `${updatedUser.firstName} ${updatedUser.lastName}` : updatedUser.username,
        position: updatedUser.role === 'admin' ? 'Administrador' : updatedUser.role === 'user' ? 'Usuario' : updatedUser.role,
      }
    })
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
