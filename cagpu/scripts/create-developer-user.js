#!/usr/bin/env node

// ============================================================================
// SCRIPT PARA CREAR USUARIOS DEVELOPER
// ============================================================================
// Crea usuarios con rol 'developer' para acceso al Dashboard de Seguridad
// ============================================================================

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Configuración de seguridad
const AUTH_SALT_ROUNDS = parseInt(process.env.AUTH_SALT_ROUNDS) || 12
const AUTH_MIN_PASSWORD_LENGTH = parseInt(process.env.AUTH_MIN_PASSWORD_LENGTH) || 12

// Función para validar contraseña
function isStrongPassword(password) {
  if (password.length < AUTH_MIN_PASSWORD_LENGTH) {
    return { isValid: false, error: `La contraseña debe tener al menos ${AUTH_MIN_PASSWORD_LENGTH} caracteres` }
  }
  
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  
  if (!hasLowercase) {
    return { isValid: false, error: 'La contraseña debe contener al menos una letra minúscula' }
  }
  if (!hasUppercase) {
    return { isValid: false, error: 'La contraseña debe contener al menos una letra mayúscula' }
  }
  if (!hasNumber) {
    return { isValid: false, error: 'La contraseña debe contener al menos un número' }
  }
  if (!hasSpecial) {
    return { isValid: false, error: 'La contraseña debe contener al menos un símbolo especial' }
  }
  
  return { isValid: true }
}

// Función para crear usuario developer
async function createDeveloperUser(userData) {
  try {
    console.log('🔄 CREANDO USUARIO DEVELOPER')
    console.log('')

    // Validar datos requeridos
    if (!userData.username || !userData.email || !userData.password) {
      console.log('❌ Error: username, email y password son requeridos')
      console.log('')
      console.log('📋 Uso:')
      console.log('   node scripts/create-developer-user.js')
      console.log('')
      console.log('🔧 O configura las variables de entorno:')
      console.log('   DEV_USERNAME=nombre_usuario')
      console.log('   DEV_EMAIL=email@ejemplo.com')
      console.log('   DEV_PASSWORD=Contraseña123!@#')
      console.log('')
      return
    }

    // Validar contraseña
    const passwordValidation = isStrongPassword(userData.password)
    if (!passwordValidation.isValid) {
      console.log(`❌ Error de contraseña: ${passwordValidation.error}`)
      return
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: userData.username },
          { email: userData.email }
        ]
      }
    })

    if (existingUser) {
      console.log('⚠️  Ya existe un usuario con ese username o email:')
      console.log(`   Usuario: ${existingUser.username}`)
      console.log(`   Email: ${existingUser.email}`)
      console.log(`   Rol: ${existingUser.role}`)
      console.log('')
      return
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(userData.password, AUTH_SALT_ROUNDS)

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        passwordHash,
        role: 'developer',
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        department: userData.department || 'Desarrollo',
        phone: userData.phone || null,
        isActive: true
      }
    })

    console.log('✅ Usuario developer creado exitosamente:')
    console.log(`   ID: ${newUser.id}`)
    console.log(`   Usuario: ${newUser.username}`)
    console.log(`   Email: ${newUser.email}`)
    console.log(`   Rol: ${newUser.role}`)
    console.log(`   Departamento: ${newUser.department}`)
    console.log('')
    console.log('🔐 Credenciales de acceso:')
    console.log(`   Usuario: ${newUser.username}`)
    console.log(`   Contraseña: ${userData.password}`)
    console.log('')
    console.log('🚀 Acceso al Dashboard de Seguridad:')
    console.log('   1. Ve a http://localhost:3000/login')
    console.log('   2. Inicia sesión con las credenciales arriba')
    console.log('   3. Ve a http://localhost:3000/dashboard')
    console.log('   4. Haz clic en la pestaña "Seguridad"')
    console.log('')
    console.log('⚠️  IMPORTANTE: Guarda las credenciales de forma segura')

  } catch (error) {
    console.error('❌ Error al crear usuario developer:', error.message)
    if (error.code === 'P2002') {
      console.log('   El username o email ya existe en la base de datos')
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Función principal
async function main() {
  // Obtener datos del usuario desde variables de entorno o usar valores por defecto
  const userData = {
    username: process.env.DEV_USERNAME || 'developer',
    email: process.env.DEV_EMAIL || 'developer@cagpu.local',
    password: process.env.DEV_PASSWORD || 'Developer123!@#',
    firstName: process.env.DEV_FIRST_NAME || 'Desarrollador',
    lastName: process.env.DEV_LAST_NAME || 'CAGPU',
    department: process.env.DEV_DEPARTMENT || 'Desarrollo',
    phone: process.env.DEV_PHONE || null
  }

  await createDeveloperUser(userData)
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = { createDeveloperUser }
