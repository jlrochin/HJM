import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const history = await prisma.userChangeHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        targetUser: { select: { username: true } },
        performedByUser: { select: { username: true } },
      },
    });
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error al obtener historial de cambios:', error);
    // Log extra para depuración
    return NextResponse.json({ error: 'Error interno del servidor', detalle: String(error) }, { status: 500 });
  }
}

// Endpoint para consultar el log de auditoría general
export async function POST(request: NextRequest) {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        targetUser: { select: { username: true } },
        performedByUser: { select: { username: true } },
      },
    });
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error al obtener audit log:', error);
    return NextResponse.json({ error: 'Error interno del servidor', detalle: String(error) }, { status: 500 });
  }
} 