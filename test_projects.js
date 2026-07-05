const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companyId = '8b6f0d4c-a137-473f-ab5c-bc0b2e002e7b'; // the company id I saw in earlier logs
  const projects = await prisma.project.findMany({
    where: { company_id: companyId },
  });
  console.log(projects);
}
main().catch(console.error).finally(() => prisma.$disconnect());
