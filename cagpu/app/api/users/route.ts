import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createUser } from '@/lib/auth'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { 
        isInvisible: false,
        role: {
          not: 'developer' // Excluir usuarios con rol developer
        }
      },
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    // Validar datos requeridos
    if (!userData.username || !userData.email || !userData.password) {
      return NextResponse.json(
        { error: 'Usuario, email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: userData.username },
          { email: userData.email },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario o email ya existe' },
        { status: 409 }
      )
    }

    const newUser = await createUser(userData)

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        department: newUser.department,
        phone: newUser.phone,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 