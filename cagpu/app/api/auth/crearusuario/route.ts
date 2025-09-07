import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, role = 'user', firstName = '', lastName = '', department = '', phone = '' } = await request.json();
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] }
    });
    if (existing) {
      return NextResponse.json({ error: 'El usuario o email ya existe' }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role,
        firstName,
        lastName,
        department,
        phone,
        isActive: true,
      },
    });
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Endpoint temporal para pruebas: crear usuario vía GET
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || '';
    const email = searchParams.get('email') || '';
    const password = searchParams.get('password') || '';
    const role = searchParams.get('role') || 'user';
    const firstName = searchParams.get('firstName') || '';
    const lastName = searchParams.get('lastName') || '';
    const department = searchParams.get('department') || '';
    const phone = searchParams.get('phone') || '';

    // Si no se pasan parámetros, crear admin y user por defecto
    if (!username && !email && !password) {
      const results = [];
      // Admin
      const adminExists = await prisma.user.findFirst({ where: { username: 'admin' } });
      if (!adminExists) {
        const adminHash = await bcrypt.hash('admin', 12);
        const admin = await prisma.user.create({
          data: {
            username: 'admin',
            email: 'admin@sistema.local',
            passwordHash: adminHash,
            role: 'admin',
            firstName: 'Administrador',
            lastName: 'Sistema',
            department: 'TI',
            isActive: true,
          },
        });
        results.push({ admin });
      } else {
        results.push({ admin: 'ya existe' });
      }
      // User
      const userExists = await prisma.user.findFirst({ where: { username: 'user' } });
      if (!userExists) {
        const userHash = await bcrypt.hash('user', 12);
        const user = await prisma.user.create({
          data: {
            username: 'user',
            email: 'user@sistema.local',
            passwordHash: userHash,
            role: 'user',
            firstName: 'Usuario',
            lastName: 'Sistema',
            department: 'General',
            isActive: true,
          },
        });
        results.push({ user });
      } else {
        results.push({ user: 'ya existe' });
      }
      return NextResponse.json({ success: true, results });
    }

    // Si se pasan parámetros, crear usuario personalizado
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Faltan username, email o password' }, { status: 400 });
    }
    const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
    if (existing) {
      return NextResponse.json({ error: 'El usuario o email ya existe' }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role,
        firstName,
        lastName,
        department,
        phone,
        isActive: true,
      },
    });
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error al crear usuario (GET):', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 