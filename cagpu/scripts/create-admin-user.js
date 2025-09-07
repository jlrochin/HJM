const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        console.log('🔄 CREANDO USUARIO ADMINISTRADOR\n');

        // Verificar si ya existe un usuario admin
        const existingAdmin = await prisma.user.findFirst({
            where: { role: 'admin' }
        });

        if (existingAdmin) {
            console.log('⚠️  Ya existe un usuario administrador:');
            console.log(`   Usuario: ${existingAdmin.username}`);
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Rol: ${existingAdmin.role}`);
            return;
        }

        // Datos del usuario administrador
        const adminData = {
            username: 'admin',
            email: 'admin@cagpu.com',
            password: 'admin123',
            role: 'admin',
            firstName: 'Administrador',
            lastName: 'Sistema',
            department: 'TI',
            isActive: true
        };

        console.log('📋 Creando usuario con los siguientes datos:');
        console.log(`   Usuario: ${adminData.username}`);
        console.log(`   Email: ${adminData.email}`);
        console.log(`   Contraseña: ${adminData.password}`);
        console.log(`   Rol: ${adminData.role}`);
        console.log(`   Nombre: ${adminData.firstName} ${adminData.lastName}`);
        console.log(`   Departamento: ${adminData.department}\n`);

        // Hashear la contraseña
        const saltRounds = 14;
        const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

        // Crear el usuario
        const adminUser = await prisma.user.create({
            data: {
                username: adminData.username,
                email: adminData.email,
                passwordHash: hashedPassword,
                role: adminData.role,
                firstName: adminData.firstName,
                lastName: adminData.lastName,
                department: adminData.department,
                isActive: adminData.isActive
            }
        });

        console.log('✅ Usuario administrador creado exitosamente!');
        console.log(`   ID: ${adminUser.id}`);
        console.log(`   Usuario: ${adminUser.username}`);
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Rol: ${adminUser.role}`);
        console.log(`   Estado: ${adminUser.isActive ? 'Activo' : 'Inactivo'}`);
        console.log(`   Creado: ${adminUser.createdAt.toLocaleDateString()}\n`);

        console.log('🔑 CREDENCIALES DE ACCESO:');
        console.log(`   Usuario: ${adminData.username}`);
        console.log(`   Contraseña: ${adminData.password}\n`);

        console.log('💡 Ahora puedes iniciar sesión en el sistema');

    } catch (error) {
        console.error('❌ Error al crear usuario administrador:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar la creación
createAdminUser();
