const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugQuery() {
    try {
        console.log('🔍 DIAGNOSTICANDO CONSULTA PRISMA\n');

        // Probar con un servicio específico
        const testServiceId = 'ABASTECIMIENTO';

        console.log(`📋 Probando con servicio: ${testServiceId}\n`);

        // Consulta 1: Buscar usuario con serviceId específico
        const user1 = await prisma.user.findFirst({
            where: {
                serviceId: testServiceId,
                role: 'user'
            }
        });

        console.log('1️⃣ Consulta 1 (serviceId específico):');
        console.log('   Resultado:', user1 ? user1.username : 'null');
        console.log('');

        // Consulta 2: Buscar usuario con serviceId específico y role user
        const user2 = await prisma.user.findFirst({
            where: {
                serviceId: testServiceId,
                role: 'user',
                serviceId: { not: null }
            }
        });

        console.log('2️⃣ Consulta 2 (con not null):');
        console.log('   Resultado:', user2 ? user2.username : 'null');
        console.log('');

        // Consulta 3: Buscar usuario con serviceId específico y role user (sin not null)
        const user3 = await prisma.user.findFirst({
            where: {
                serviceId: testServiceId,
                role: 'user'
            }
        });

        console.log('3️⃣ Consulta 3 (sin not null):');
        console.log('   Resultado:', user3 ? user3.username : 'null');
        console.log('');

        // Consulta 4: Buscar usuario con serviceId específico (cualquier role)
        const user4 = await prisma.user.findFirst({
            where: {
                serviceId: testServiceId
            }
        });

        console.log('4️⃣ Consulta 4 (cualquier role):');
        console.log('   Resultado:', user4 ? `${user4.username} (${user4.role})` : 'null');
        console.log('');

        // Consulta 5: Listar todos los usuarios con serviceId
        const usersWithServiceId = await prisma.user.findMany({
            where: {
                serviceId: { not: null }
            },
            select: {
                username: true,
                serviceId: true,
                role: true
            }
        });

        console.log('5️⃣ Usuarios con serviceId:');
        usersWithServiceId.forEach(user => {
            console.log(`   - ${user.username} (${user.role}) → ${user.serviceId}`);
        });
        console.log('');

        // Consulta 6: Listar todos los usuarios con role 'user'
        const usersWithRoleUser = await prisma.user.findMany({
            where: {
                role: 'user'
            },
            select: {
                username: true,
                serviceId: true,
                role: true
            }
        });

        console.log('6️⃣ Usuarios con role "user":');
        usersWithRoleUser.forEach(user => {
            console.log(`   - ${user.username} → ${user.serviceId || 'null'}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugQuery();
