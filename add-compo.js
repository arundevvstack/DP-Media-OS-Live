const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const company = await prisma.company.findFirst();
  const compo = await prisma.leaveType.findUnique({ where: { id: 'compo' } });
  if (!compo && company) {
    await prisma.leaveType.create({
      data: { id: 'compo', name: 'Compensatory Leave', description: 'Compensatory off', company_id: company.id }
    });
    console.log('Inserted compo leave type');
  }
}
main().finally(() => prisma.$disconnect());
