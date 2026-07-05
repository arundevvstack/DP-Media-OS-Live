const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companyId = '8b6f0d4c-a137-473f-ab5c-bc0b2e002e7b';
  
  const prospects = await prisma.prospect.findMany({ where: { company_id: companyId } });
  const clients = await prisma.client.findMany({ where: { company_id: companyId } });
  
  console.log('Prospects:', prospects.map(p => p.company_name));
  console.log('Clients:', clients.map(c => c.company_name));
}
main().catch(console.error).finally(() => prisma.$disconnect());
