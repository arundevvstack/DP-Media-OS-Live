const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const c = await prisma.company.count();
  const u = await prisma.user.count();
  const p = await prisma.project.count();
  const cl = await prisma.client.count();
  
  console.log('--- DATABASE COUNTS ---');
  console.log(`Companies: ${c}`);
  console.log(`Users:     ${u}`);
  console.log(`Projects:  ${p}`);
  console.log(`Clients:   ${cl}`);

  const users = await prisma.user.findMany({ take: 3, select: { email: true, company_id: true } });
  console.log('\nUsers sample:', users);
  
  const companies = await prisma.company.findMany({ take: 3, select: { id: true, name: true } });
  console.log('\nCompanies sample:', companies);
  
  await prisma.$disconnect();
}
check();
