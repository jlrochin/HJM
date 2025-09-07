import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          targetUser: { select: { username: true } },
          performedByUser: { select: { username: true } },
        },
      }),
      prisma.auditLog.count(),
    ]);

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error('Error al obtener audit log:', error);
    return NextResponse.json({ error: 'Error interno del servidor', detalle: String(error) }, { status: 500 });
  }
} 