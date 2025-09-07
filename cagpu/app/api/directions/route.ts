import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const directions = await prisma.direction.findMany({
      include: {
        services: {
          where: { isActive: true }
        }
      },
      orderBy: {
        displayOrder: 'asc'
      }
    })

    // Actualizar el conteo de servicios
    const directionsWithCount = directions.map(direction => ({
      ...direction,
      servicesCount: direction.services.length
    }))

    return NextResponse.json(directionsWithCount)
  } catch (error) {
    console.error('Error al obtener direcciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 