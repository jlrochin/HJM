import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)

    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener historial de cambios del usuario
    const history = await prisma.userChangeHistory.findMany({
      where: { targetUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limitar a los últimos 50 cambios
    })

    // Obtener información de quién realizó cada cambio
    const historyWithPerformer = await Promise.all(
      history.map(async (change) => {
        const performer = await prisma.user.findUnique({
          where: { id: change.performedBy },
          select: { username: true, email: true },
        })

        return {
          ...change,
          performer: performer ? performer.username : 'Sistema',
        }
      })
    )

    return NextResponse.json({
      success: true,
      user,
      history: historyWithPerformer,
    })
  } catch (error) {
    console.error('Error al obtener historial del usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 