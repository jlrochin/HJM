import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  if (authCookie) {
    const userId = parseInt(authCookie.value);
    if (!isNaN(userId)) {
      await prisma.user.update({
        where: { id: userId },
        data: { lastActiveAt: new Date() },
      });
    }
  }
  return NextResponse.json({ ok: true });
} 