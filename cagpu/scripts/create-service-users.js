const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createServiceUsers() {
    try {
        console.log('🔄 CREANDO USUARIOS PARA CADA SERVICIO\n');

        // Obtener todos los servicios activos
        const services = await prisma.service.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                directionId: true
            }
        });

        console.log(`📋 Se encontraron ${services.length} servicios activos\n`);

        let createdCount = 0;
        let skippedCount = 0;

        for (const service of services) {
            // Verificar si ya existe un usuario para este servicio
            const existingUser = await prisma.user.findFirst({
                where: {
                    serviceId: service.id
                }
            });

            if (existingUser) {
                console.log(`⏭️  Ya existe usuario para "${service.name}": ${existingUser.username}`);
                skippedCount++;
                continue;
            }

            // Generar username corto basado en el nombre del servicio
            let username = service.name
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '')
                .substring(0, 15);

            // Si el username es muy corto, usar el ID del servicio
            if (username.length < 3) {
                username = service.id.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
            }

            // Generar email único
            const email = `${username}@cagpu.com`;

            // Verificar si el username ya existe
            let finalUsername = username;
            let counter = 1;
            while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
                finalUsername = `${username}${counter}`;
                counter++;
            }

            // Crear usuario
            const saltRounds = 14;
            const hashedPassword = await bcrypt.hash(finalUsername, saltRounds);

            const user = await prisma.user.create({
                data: {
                    username: finalUsername,
                    email: email,
                    passwordHash: hashedPassword,
                    role: 'user',
                    firstName: (service.name.split(' ')[0] || 'Usuario').substring(0, 50),
                    lastName: (service.name.split(' ').slice(1).join(' ') || 'Servicio').substring(0, 50),
                    department: service.directionId.substring(0, 100),
                    serviceId: service.id,
                    isActive: true
                }
            });

            console.log(`✅ Usuario creado para "${service.name}":`);
            console.log(`   Usuario: ${finalUsername}`);
            console.log(`   Contraseña: ${finalUsername}`);
            console.log(`   Email: ${email}`);
            console.log(`   Servicio: ${service.id}`);
            console.log('');

            createdCount++;
        }

        console.log('📊 RESUMEN:');
        console.log(`   ✅ Usuarios creados: ${createdCount}`);
        console.log(`   ⏭️  Usuarios existentes: ${skippedCount}`);
        console.log(`   📋 Total de servicios: ${services.length}\n`);

        if (createdCount > 0) {
            console.log('🔑 CREDENCIALES DE ACCESO:');
            console.log('   Los usuarios pueden iniciar sesión con su username como contraseña');
            console.log('   Ejemplo: usuario "abastecimiento" con contraseña "abastecimiento"\n');
        }

    } catch (error) {
        console.error('❌ Error al crear usuarios de servicio:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createServiceUsers();
