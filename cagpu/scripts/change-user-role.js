#!/usr/bin/env node

// ============================================================================
// SCRIPT PARA CAMBIAR EL ROL DE UN USUARIO
// ============================================================================
// Cambia el rol de un usuario existente (admin, user, service_user, developer)
// ============================================================================

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Función para cambiar el rol de un usuario
async function changeUserRole(username, newRole) {
  try {
    console.log('🔄 CAMBIANDO ROL DE USUARIO')
    console.log('')

    // Validar datos requeridos
    if (!username || !newRole) {
      console.log('❌ Error: username y newRole son requeridos')
      console.log('')
      console.log('📋 Uso:')
      console.log('   node scripts/change-user-role.js')
      console.log('')
      console.log('🔧 O configura las variables de entorno:')
      console.log('   CHANGE_USERNAME=nombre_usuario')
      console.log('   CHANGE_ROLE=nuevo_rol')
      console.log('')
      console.log('🎯 Roles disponibles: admin, user, service_user, developer')
      console.log('')
      return
    }

    // Validar rol
    const validRoles = ['admin', 'user', 'service_user', 'developer']
    if (!validRoles.includes(newRole)) {
      console.log(`❌ Error: Rol inválido "${newRole}"`)
      console.log(`🎯 Roles válidos: ${validRoles.join(', ')}`)
      console.log('')
      return
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      console.log(`❌ Error: No se encontró el usuario "${username}"`)
      console.log('')
      return
    }

    console.log(`📋 Usuario encontrado:`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Usuario: ${user.username}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Rol actual: ${user.role}`)
    console.log(`   Nombre: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`)
    console.log(`   Departamento: ${user.department || 'N/A'}`)
    console.log('')

    // Confirmar el cambio
    console.log(`🔄 ¿Cambiar rol de "${user.role}" a "${newRole}"?`)
    console.log('')

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { username },
      data: { role: newRole }
    })

    console.log('✅ Rol cambiado exitosamente:')
    console.log(`   Usuario: ${updatedUser.username}`)
    console.log(`   Rol anterior: ${user.role}`)
    console.log(`   Rol nuevo: ${updatedUser.role}`)
    console.log('')

    // Mostrar permisos del nuevo rol
    console.log('🔐 Permisos del nuevo rol:')
    switch (newRole) {
      case 'admin':
        console.log('   ✅ Acceso completo al sistema')
        console.log('   ✅ Gestión de usuarios')
        console.log('   ✅ Dashboard de administración')
        console.log('   ✅ Analíticas')
        console.log('   ✅ Auditoría')
        console.log('   ✅ Cambios recientes')
        break
      case 'developer':
        console.log('   ✅ Dashboard de Seguridad')
        console.log('   ✅ Métricas de seguridad')
        console.log('   ✅ Alertas en tiempo real')
        console.log('   ❌ No puede gestionar usuarios')
        console.log('   ❌ No puede acceder a administración')
        break
      case 'service_user':
        console.log('   ✅ Acceso a servicios específicos')
        console.log('   ✅ Gestión de su servicio asignado')
        console.log('   ❌ Acceso limitado')
        break
      case 'user':
        console.log('   ✅ Acceso básico')
        console.log('   ✅ Ver servicios')
        console.log('   ❌ Acceso limitado')
        break
    }
    console.log('')

    // Registrar el cambio en el historial
    await prisma.userChangeHistory.create({
      data: {
        targetUserId: user.id,
        action: 'role_change',
        performedBy: user.id, // El mismo usuario se cambió el rol
        details: `Rol cambiado de "${user.role}" a "${newRole}"`
      }
    })

    console.log('📝 Cambio registrado en el historial de cambios')
    console.log('')

    if (newRole === 'developer') {
      console.log('🚀 Para acceder al Dashboard de Seguridad:')
      console.log('   1. Ve a http://localhost:3000/login')
      console.log('   2. Inicia sesión con tu usuario')
      console.log('   3. Ve a http://localhost:3000/dashboard')
      console.log('   4. Haz clic en la pestaña "Seguridad"')
      console.log('')
    }

  } catch (error) {
    console.error('❌ Error al cambiar el rol:', error.message)
    if (error.code === 'P2025') {
      console.log('   El usuario no existe en la base de datos')
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Función principal
async function main() {
  // Obtener datos desde variables de entorno o usar valores por defecto
  const username = process.env.CHANGE_USERNAME || 'jrochinu'
  const newRole = process.env.CHANGE_ROLE || 'developer'

  await changeUserRole(username, newRole)
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = { changeUserRole }
