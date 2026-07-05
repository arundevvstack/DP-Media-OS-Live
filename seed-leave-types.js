const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const company = await prisma.company.findFirst();
  if (!company) {
    console.log('No company found');
    return;
  }
  const count = await prisma.leaveType.count();
  if (count === 0) {
    await prisma.leaveType.createMany({
      data: [
        { id: 'casual', name: 'Casual Leave', description: 'Personal or casual reasons', company_id: company.id },
        { id: 'sick', name: 'Sick Leave', description: 'Medical reasons', company_id: company.id },
        { id: 'annual', name: 'Annual Leave', description: 'Planned vacation', company_id: company.id },
        { id: 'maternity', name: 'Maternity Leave', description: 'Maternity leave', company_id: company.id },
        { id: 'compo', name: 'Compensatory Leave', description: 'Compensatory off', company_id: company.id }
      ]
    });
    console.log('Inserted default leave types');
  } else {
    console.log('Leave types already exist');
  }
}
main().finally(() => prisma.$disconnect());
