const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companyId = '8b6f0d4c-a137-473f-ab5c-bc0b2e002e7b'; // the company id I saw in earlier logs
  const todayStr = new Date().toISOString().split('T')[0];
  const dateObj = new Date(todayStr + 'T00:00:00.000Z');
  const nextDay = new Date(dateObj); nextDay.setDate(nextDay.getDate() + 1);

  const atts = await prisma.employeeAttendance.findMany({
    where: { company_id: companyId, date: { gte: dateObj, lt: nextDay } },
  });
  console.log(atts);
}
main().catch(console.error).finally(() => prisma.$disconnect());
