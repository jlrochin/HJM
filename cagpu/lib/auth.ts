import bcrypt from 'bcryptjs'
import { prisma } from './db'
import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { JWT_SECRET, AUTH_SALT_ROUNDS, AUTH_MIN_PASSWORD_LENGTH } from './config'

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  score: number // 0-4: muy débil, 5-7: débil, 8-10: moderada, 11-13: fuerte, 14+: muy fuerte
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  let score = 0

  // Validaciones básicas
  if (!password || password.length < AUTH_MIN_PASSWORD_LENGTH) {
    errors.push(`La contraseña debe tener al menos ${AUTH_MIN_PASSWORD_LENGTH} caracteres`)
  } else {
    score += Math.min(password.length, 8) // Máximo 8 puntos por longitud
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula')
  } else {
    score += 1
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula')
  } else {
    score += 1
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Debe contener al menos un número')
  } else {
    score += 1
  }

  if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) {
    errors.push('Debe contener al menos un símbolo especial')
  } else {
    score += 1
  }

  // Validaciones adicionales de seguridad
  if (/(.)\1{2,}/.test(password)) {
    errors.push('No debe contener más de 2 caracteres consecutivos iguales')
  }

  if (/^(.)\1+$/.test(password)) {
    errors.push('No debe contener solo un tipo de carácter repetido')
  }

  // Patrones comunes de contraseñas débiles
  const weakPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^admin/i,
    /^123456789/,
    /^111111/,
    /^abc123/,
    /^password123/i
  ]

  if (weakPatterns.some(pattern => pattern.test(password))) {
    errors.push('La contraseña es demasiado común o predecible')
    score = Math.max(0, score - 3)
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 20)
  }
}

export function isStrongPassword(password: string): boolean {
  return validatePassword(password).isValid
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, AUTH_SALT_ROUNDS)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(userData: {
  username: string
  email: string
  password: string
  role?: string
  firstName?: string
  lastName?: string
  department?: string
  phone?: string
  serviceId?: string
}) {
  // Validación robusta de contraseña
  if (!userData.password || !isStrongPassword(userData.password)) {
    throw new Error(`La contraseña debe tener al menos ${AUTH_MIN_PASSWORD_LENGTH} caracteres, incluyendo mayúsculas, minúsculas, números y símbolos especiales.`)
  }
  const hashedPassword = await hashPassword(userData.password)
  const user = await prisma.user.create({
    data: {
      username: userData.username,
      email: userData.email,
      passwordHash: hashedPassword,
      role: userData.role || 'user',
      firstName: userData.firstName,
      lastName: userData.lastName,
      department: userData.department,
      phone: userData.phone,
      serviceId: userData.serviceId,
      isActive: true,
    },
  })
  // Registrar en historial
  if ((userData as any).performedBy) {
    await prisma.userChangeHistory.create({
      data: {
        targetUserId: user.id,
        action: 'create',
        performedBy: (userData as any).performedBy,
        details: `Usuario creado: ${user.username}`,
      },
    })
  }
  return user
}

export async function authenticateUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user) {
    return null;
  }
  if (!user.isActive) {
    return { inactive: true };
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash)
  if (!isValidPassword) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    department: user.department,
    serviceId: user.serviceId,
  }
}

export async function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('auth')?.value

    if (!token) {
      return { success: false, error: 'No token provided' }
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    
    if (!payload.id) {
      return { success: false, error: 'Invalid token' }
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id as number },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        department: true,
        serviceId: true,
        isActive: true
      }
    })

    if (!user || !user.isActive) {
      return { success: false, error: 'User not found or inactive' }
    }

    return { success: true, user }
  } catch (error) {
    console.error('Auth verification error:', error)
    return { success: false, error: 'Invalid token' }
  }
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
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
  })
}

export async function updateUser(id: number, userData: {
  firstName?: string
  lastName?: string
  department?: string
  phone?: string
  email?: string
  password?: string
  performedBy?: number // id del admin que modifica
}) {
  if (userData.password) {
    const validation = validatePassword(userData.password)
    if (!validation.isValid) {
      throw new Error(`La contraseña no es lo suficientemente segura: ${validation.errors.join(', ')}`)
    }
  }
  let dataToUpdate: any = { ...userData }
  if (userData.password) {
    dataToUpdate.passwordHash = await hashPassword(userData.password)
    delete dataToUpdate.password
  }
  const user = await prisma.user.update({
    where: { id },
    data: dataToUpdate,
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
  // Registrar en historial
  if (userData.performedBy) {
    await prisma.userChangeHistory.create({
      data: {
        targetUserId: id,
        action: 'update',
        performedBy: userData.performedBy,
        details: `Usuario modificado: ${user.username}`,
      },
    })
  }
  return user
}

export async function deactivateUser(id: number, performedBy: number) {
  const user = await prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  })
  // Registrar en historial
  await prisma.userChangeHistory.create({
    data: {
      targetUserId: id,
      action: 'deactivate',
      performedBy,
      details: `Usuario desactivado: ${user.username}`,
    },
  })
  return user
} 