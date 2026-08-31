import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    const updated = await prisma.project.updateMany({
        where: { status: 'active' },
        data: { status: 'planning' }
    });
    console.log(`Updated ${updated.count} projects from active to planning.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
