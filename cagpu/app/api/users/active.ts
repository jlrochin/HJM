import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const count = await prisma.user.count({
    where: {
      lastActiveAt: { gte: fiveMinutesAgo },
      isInvisible: false,
      role: {
        not: 'developer' // Excluir usuarios developer del conteo
      }
    },
  });
  return NextResponse.json({ activeUsers: count });
} 